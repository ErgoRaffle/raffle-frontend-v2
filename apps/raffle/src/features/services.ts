'use client';

import type { PostApiDonation200 as DonationResponse } from '@ergo-raffle/client';
import type { UnsignedErgoTxProxy } from '@ergo-raffle/nautilus-wallet';
import {
  AddGiftProxyTxBuilder,
  CreationProxyTxBuilder,
  DonationProxyTxBuilder
} from '@ergo-raffle/proxy-transactions';

import { getInfoBlockchain, getRaffle, postDonation } from '@/actions';
import { getNonDecimalString, type WalletInstance } from '@/lib';
import type { WalletContextValue } from '@/providers';

import type { RaffleForm } from './schemas';

const getRaffleData = async (raffleId: string) => {
  try {
    return await getRaffle(raffleId);
  } catch {
    throw new Error('Failed to load raffle data. Please try again later.');
  }
};

const getInfoBlockchainData = async () => {
  try {
    return await getInfoBlockchain();
  } catch {
    throw new Error('Unable to load blockchain data. Please try again.');
  }
};

export const createRaffle = async (data: RaffleForm, wallet: WalletContextValue) => {
  const infoBlockchainData = await getInfoBlockchainData();

  const walletInstance = wallet.ensureConnected('Nautilus');

  const tokens = await walletInstance.fetchTokens();

  const token = tokens.find((token) => token.id === data.tokenId);

  if (!token) {
    throw new Error('Failed to get wallet tokens.');
  }

  // Organizer UTXO boxes the selector may spend
  const boxes = await walletInstance.getBoxes();

  // Current chain height
  const chainHeight = Math.max(
    infoBlockchainData.height,
    ...boxes.map((walletUtxo) => walletUtxo.creationHeight)
  );

  // organizer address is the wallet address that is creating the raffle and will receive the change
  const organizerAddress = (await walletInstance.getAddresses()).main;

  // implementer address is the address of the service that is implementing the raffle
  const implementerAddress = process.env.NEXT_PUBLIC_IMPLEMENTER_ADDRESS || '';

  // block height at which the proxy box expires (configure a value for expiration period and add it to the current network height)
  const expirationHeight = chainHeight + Number(process.env.NEXT_PUBLIC_EXPIRATION_HEIGHT);

  const name = data.name;

  const description = data.description || '';

  // Tags string (use empty string when none)
  const tags = data.tags?.join(',') || '';

  const images = data.images?.filter((image) => !!image.url).map((image) => image.url || '') || [];

  // Ticket price in nanoERG or collecting-token units
  const ticketPrice = BigInt(getNonDecimalString(data.amount.toString(), token.decimals));

  // Funding goal in nanoERG or collecting-token units
  const goal = BigInt(getNonDecimalString(data.count.toString(), token.decimals));

  // Total winners share in thousandths
  const winnersPercent = data.winnerPotShare * 10;

  // Number of winners
  const winnerCount = data.details.reduce(
    (result, current) => result + current.count,
    data.emptyBaskets
  );

  // array of winners percentages in thousandths (should sum to 1000)
  const winnersPercentList: bigint[] = [];
  for (const current of data.details) {
    for (let i = 0; i < current.count; i++) {
      winnersPercentList.push(BigInt(current.percent) * 10n);
    }
  }
  if (!data.details.length) {
    winnersPercentList.push(1000n);
  }
  const emptyBaskets = data.details.length ? data.emptyBaskets : data.emptyBaskets - 1;
  for (let i = 0; i < emptyBaskets; i++) {
    winnersPercentList.push(0n);
  }

  // Raffle deadline height
  const deadline = chainHeight + data.deadline;

  // Optional project address (defaults to organizer when omitted)
  const projectAddress = data.address;

  // Service creation fee in nanoERG
  const creationFee = BigInt(infoBlockchainData.fee.creation);

  // Transaction fee in nanoERG
  const txFee = BigInt(infoBlockchainData.fee.tx);

  let builder = new CreationProxyTxBuilder()
    .setChainHeight(chainHeight)
    .setFeeBoxes(boxes.values())
    .setOrganizerAddress(organizerAddress)
    .setImplementerAddress(implementerAddress)
    .setExpirationHeight(expirationHeight)
    .setName(name)
    .setDescription(description)
    .setTags(tags)
    .setPictures(images)
    .setTicketPrice(ticketPrice)
    .setGoal(goal)
    .setWinnersPercent(winnersPercent)
    .setWinnerCount(winnerCount)
    .setWinnersPercentList(winnersPercentList)
    .setRaffleDeadline(deadline)
    .setProjectAddress(projectAddress)
    .setCreationFee(creationFee)
    .setTxFee(txFee);

  // if the raffle is a token-goal raffle, set the collecting token id
  if (token.id.toLowerCase() !== 'erg') {
    builder = builder.setCollectingTokenId(token.id);
  }

  const unsignedTx = await builder.build();
  const eip12Object = unsignedTx?.toEIP12Object();

  return await walletInstance.transfer(eip12Object as UnsignedErgoTxProxy);
};

export const donateRaffle = async (
  raffleId: string,
  data: {
    isBridgeable?: boolean;
    recaptcha?: string;
    tickets: number;
    ergoAddress?: string;
  },
  walletInstance?: WalletInstance
) => {
  if (!walletInstance) {
    throw new Error('You must connect a wallet.');
  }

  const raffle = await getRaffleData(raffleId);

  if (data.isBridgeable && walletInstance.name === 'Xverse') {
    let donationResponse: DonationResponse | undefined;

    try {
      donationResponse = await postDonation({
        donatorAddress: data.ergoAddress || '',
        raffleId,
        ticketCount: data.tickets,
        captchaToken: data.recaptcha || ''
      });
    } catch (error) {
      throw new Error('Failed to load transaction bitcoin data.', { cause: error });
    }

    return await walletInstance.transfer({
      fromAddress: (await walletInstance.getAddresses()).nativeSegWit,
      toAddress: donationResponse.data.bitcoinAddress || '',
      amount: BigInt(donationResponse.data.satoshiAmount || '0'),
      token: {
        id: donationResponse.data.tokenId || '',
        amount: BigInt(donationResponse.data.tokenAmount || '0')
      }
    });
  }

  if (walletInstance.name !== 'Nautilus') {
    throw new Error('Failed to donate raffle. Please connect to the Nautilus wallet.');
  }

  const infoBlockchainData = await getInfoBlockchainData();

  // Current chain height
  const chainHeight = infoBlockchainData.height;

  // Donator UTXO boxes the selector may spend for value, tokens, and fee
  const boxes = await walletInstance.getBoxes();

  // Donator Ergo address (also receives change)
  const donatorAddress = (await walletInstance.getAddresses()).main; // user address

  // block height at which the proxy box expires (configure a value for expiration period and add it to the current network height)
  const expirationHeight =
    infoBlockchainData.height + Number(process.env.NEXT_PUBLIC_EXPIRATION_HEIGHT);

  // Price per ticket in nanoERG or collecting-token smallest units
  const ticketPrice = BigInt(raffle.ticketPrice);

  // Raffle deadline height written into the proxy box
  const raffleDeadline = raffle.deadline;

  // // Miner fee in nanoERG
  const txFee = BigInt(infoBlockchainData.fee.tx);

  let builder = new DonationProxyTxBuilder()
    .setChainHeight(chainHeight)
    .setFeeBoxes(boxes.values())
    .setDonatorAddress(donatorAddress)
    .setTicketCount(BigInt(data.tickets))
    .setExpirationHeight(expirationHeight)
    .setTicketPrice(ticketPrice)
    .setRaffleDeadline(raffleDeadline)
    .setTxFee(txFee)
    .setRaffleId(raffle.id);

  // if the raffle is a token-goal raffle, set the collecting token id
  if (raffle.token.id.toLowerCase() !== 'erg') {
    builder = builder.setCollectingTokenId(raffle.token.id);
  }

  const unsignedTx = await builder.build();
  const eip12Object = unsignedTx?.toEIP12Object();

  return await walletInstance.transfer(eip12Object as UnsignedErgoTxProxy);
};

export const addGiftRaffle = async (
  raffleId: string,
  data: {
    winnerIndex: number;
    tokens: {
      tokenId: string;
      amount: bigint;
    }[];
  },
  wallet: WalletContextValue
) => {
  const raffle = await getRaffleData(raffleId);

  const infoBlockchainData = await getInfoBlockchainData();

  const walletInstance = wallet.ensureConnected('Nautilus');

  // // Current chain height
  const chainHeight = infoBlockchainData.height; // current height should be fetched from the info api

  // Gift giver UTXO boxes the selector may spend
  const boxes = await walletInstance.getBoxes();

  // Gift giver address (change output)
  const giftGiverAddress = (await walletInstance.getAddresses()).main; // gift giver address (user wallet address)

  // Proxy expiration height
  const expirationHeight =
    infoBlockchainData.height + Number(process.env.NEXT_PUBLIC_EXPIRATION_HEIGHT); // block height at which the proxy box expires (configure a value for expiration period and add it to the current network height)

  // Raffle deadline height
  const raffleDeadline = raffle.deadline;

  // Miner fee in nanoERG
  const txFee = BigInt(infoBlockchainData.fee.tx);

  // Index of the winner receiving the gift
  const winnerIndex = data.winnerIndex; // index of the winner receiving the gift

  const ergToken = data.tokens.find((token) => token.tokenId.toLowerCase() === 'erg');

  // Gift value in nanoERG (must be at least `4n * txFee`)
  const giftValue = BigInt(infoBlockchainData.fee.tx * 4) + (ergToken?.amount || 0n);

  let builder = new AddGiftProxyTxBuilder()
    .setChainHeight(chainHeight)
    .setFeeBoxes(boxes.values())
    .setGiftGiverAddress(giftGiverAddress)
    .setWinnerIndex(winnerIndex)
    .setGiftValue(giftValue)
    .setExpirationHeight(expirationHeight)
    .setRaffleDeadline(raffleDeadline)
    .setTxFee(txFee)
    .setRaffleId(raffle.id);

  // if the gift tokens are provided, add them to the builder
  if (data.tokens.length > 0) {
    const tokens = data.tokens.filter((token) => token.tokenId.toLowerCase() !== 'erg');
    builder = builder.setGiftTokens(tokens); // array of gift tokens
  }

  const unsignedTx = await builder.build();
  const eip12Object = unsignedTx?.toEIP12Object();

  return await walletInstance.transfer(eip12Object as UnsignedErgoTxProxy);
};
