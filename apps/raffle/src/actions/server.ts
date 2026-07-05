'use server';

import {
  getActivity,
  getInfo,
  getInfoBlockchain,
  getInfoTags,
  getRaffleRaffleId,
  getRaffleRaffleIdBasket,
  getRaffleRaffleIdBasketWinnerIndexTransactions,
  getTokens,
  getTokensBridgeable,
  getTokensSearch,
  postApiDonation
} from '@ergo-raffle/client';
import Axios from 'axios';

import { wrap } from '@/safeServerAction';

const getTokensBase: typeof getTokens = async (params) => {
  const ergs = [
    {
      id: 'erg',
      name: 'ERG',
      decimals: 9,
      isVerified: true
    },
    {
      id: 'ERG',
      name: 'ERG',
      decimals: 9,
      isVerified: true
    }
  ];

  const tokenIds = Array.isArray(params.tokenIds)
    ? params.tokenIds
    : [params.tokenIds].filter(Boolean);

  if (!tokenIds.length) return { items: [] };

  const hasErg = tokenIds.some((id) => id.toLowerCase() === 'erg');

  const serverTokenIds = tokenIds.filter((id) => id.toLowerCase() !== 'erg');

  if (serverTokenIds.length === 0) {
    return { items: ergs };
  }

  const result = await getTokens({ tokenIds: serverTokenIds });

  if (hasErg) {
    return { items: [...ergs, ...result.items] };
  }

  return result;
};

const getTokensSearchBase: typeof getTokensSearch = async (params) => {
  if (!params.query?.length || params.query.length < 3) return { items: [], total: 0 };
  return await getTokensSearch(params);
};

export const requestUnisat = async <T>(path: string): Promise<T> => {
  const headers = { 'Content-Type': 'application/json' };

  if (process.env.BITCOIN_UNISAT_API_KEY) {
    Object.assign(headers, {
      Authorization: `Bearer ${process.env.BITCOIN_UNISAT_API_KEY}`
    });
  }

  const response = await Axios.get<T>(`${process.env.BITCOIN_UNISAT_API}${path}`, { headers });

  return response.data;
};

const getTagsBase: typeof getInfoTags = async (params) => {
  if (!params?.query?.length || params.query.length < 3) return [];
  return await getInfoTags(params);
};

export const getRaffleSafe = wrap(getRaffleRaffleId, 'getRaffleRaffleId');
export const getRaffleBasketsSafe = wrap(getRaffleRaffleIdBasket, 'getRaffleRaffleIdBasket');
export const getInfoBlockchainSafe = wrap(getInfoBlockchain, 'getInfoBlockchain');
export const getActivitySafe = wrap(getActivity, 'getActivity');
export const getTokensBridgeableSafe = wrap(getTokensBridgeable, 'getTokensBridgeable');
export const postDonationSafe = wrap(postApiDonation, 'postDonation');
export const getInfoSafe = wrap(getInfo, 'getInfo');
export const getTokensSafe = wrap(getTokensBase, 'getTokensBase');
export const getTokensSearchSafe = wrap(getTokensSearchBase, 'getTokensSearchBase');
export const getRaffleWinnerBasketTransactionsSafe = wrap(
  getRaffleRaffleIdBasketWinnerIndexTransactions,
  'getRaffleRaffleIdBasketWinnerIndexTransactions'
);
export const getTagsSafe = wrap(getTagsBase, 'getTagsBase');
