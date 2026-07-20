import { Psbt } from 'bitcoinjs-lib';
import { AddressPurpose, request } from 'sats-connect';

import {
  SubmitTransactionError,
  UserDeniedTransactionSignatureError,
  Wallet,
  type WalletToken
} from '@ergo-raffle/base-wallet';

import { generateUnsignedTx as generateUnsignedTxBitcoin } from './bitcoin';
import { ICON } from './icon';
import { generateUnsignedTx as generateUnsignedTxRunes } from './runes';
import {
  NonNativeSegWitAddressError,
  NonTaprootAddressError,
  type XverseWalletAddresses,
  type XverseWalletConfig,
  type XverseWalletTransferParams
} from './types';
import { submitTransaction } from './utils';
export class XverseWallet extends Wallet<
  XverseWalletConfig,
  XverseWalletAddresses,
  unknown,
  XverseWalletTransferParams
> {
  icon = ICON;

  name = 'Xverse' as const;

  label = 'Xverse';

  link = 'https://www.xverse.app/';

  performConnect = async (): Promise<void> => {
    const response = await request('wallet_connect', null);

    if (response.status === 'success') return;

    throw response.error;
  };

  performDisconnect = async (): Promise<void> => {
    const response = await request('wallet_disconnect', null);

    if (response.status === 'success') return;

    throw response.error;
  };

  fetchAddresses = async (): Promise<XverseWalletAddresses | undefined> => {
    const response = await request('getAddresses', {
      purposes: [AddressPurpose.Ordinals, AddressPurpose.Payment]
    });

    if (response.status === 'error') throw response.error;

    const taprootAddress = response.result.addresses.find(
      (address) => address.purpose === AddressPurpose.Ordinals
    );

    if (!taprootAddress?.address.toLowerCase().startsWith('bc1p')) {
      throw new NonTaprootAddressError(this.name);
    }

    const nativeSegWitAddress = response.result.addresses.find(
      (address) => address.purpose === AddressPurpose.Payment
    );

    if (!nativeSegWitAddress?.address.toLowerCase().startsWith('bc1q')) {
      throw new NonNativeSegWitAddressError(this.name);
    }

    return {
      nativeSegWit: nativeSegWitAddress.address,
      taproot: taprootAddress.address,
      taprootPublicKey: taprootAddress.publicKey
    };
  };

  isAvailable = (): boolean =>
    typeof window !== 'undefined' && !!window.XverseProviders?.BitcoinProvider;

  hasConnection = async (): Promise<boolean> => {
    const response = await request('getAddresses', {
      purposes: [AddressPurpose.Ordinals, AddressPurpose.Payment]
    });
    return response.status === 'success';
  };

  fetchTokens = async (): Promise<WalletToken[]> => [];

  fetchBoxes = async (): Promise<unknown[]> => [];

  performTransfer = async (params: XverseWalletTransferParams): Promise<string> => {
    let generateUnsignedTx: {
      psbt: Psbt;
      signInputs: Record<string, number[]>;
    };

    const addresses = await this.getAddresses();
    // runes
    if (params.token) {
      generateUnsignedTx = await generateUnsignedTxRunes(
        params.amount,
        addresses.nativeSegWit,
        addresses.taproot,
        addresses.taprootPublicKey,
        params.toAddress,
        params.token.id,
        params.token.amount,
        this.config.requestUnisat
      );
    }
    // bitcoin
    else {
      generateUnsignedTx = await generateUnsignedTxBitcoin(
        params.amount,
        addresses.nativeSegWit,
        params.toAddress
      );
    }

    let signedPsbtBase64: string;

    // sign
    try {
      const response = await request('signPsbt', {
        psbt: generateUnsignedTx.psbt.toBase64(),
        signInputs: generateUnsignedTx.signInputs
      });

      if (response.status === 'error') {
        throw response.error;
      }

      signedPsbtBase64 = response.result.psbt;
    } catch (error) {
      throw new UserDeniedTransactionSignatureError(this.name, error);
    }

    // submit
    try {
      const psbt = Psbt.fromBase64(signedPsbtBase64);

      const data = await submitTransaction(psbt);

      return data;
    } catch (error) {
      throw new SubmitTransactionError(this.name, error);
    }
  };

  fetchBalance = async () => undefined;
}
