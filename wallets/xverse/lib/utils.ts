import type { BitcoinRunesUtxo, FeeEstimator } from '@rosen-bridge/bitcoin-runes-utxo-selection';
import JsonBigInt from '@rosen-bridge/json-bigint';
import Axios from 'axios';
import type { Psbt } from 'bitcoinjs-lib';

import {
  CONFIRMATION_TARGET,
  GET_BOX_API_LIMIT,
  NATIVE_SEGWIT,
  SEGWIT_INPUT_WEIGHT_UNIT,
  SEGWIT_OUTPUT_WEIGHT_UNIT,
  TAPROOT,
  TAPROOT_INPUT_WEIGHT_UNIT,
  TAPROOT_OUTPUT_WEIGHT_UNIT
} from './contants';
import type {
  EsploraUtxo,
  UnisatAddressAvailableBtcUtxos,
  UnisatAddressBtcUtxos,
  UnisatAddressRunesUtxos,
  UnisatResponse
} from './networkTypes';

/**
 * @returns Bitcoin fee ratio
 */
export const getFeeRatio = async (): Promise<number> => {
  const url = `${process.env.BITCOIN_ESPLORA_API}/api/fee-estimates`;
  const response = await Axios.get<Record<string, number>>(url);
  return response.data[CONFIRMATION_TARGET];
};

/**
 * gets confirmed and unspent boxes of an address that contains given rune
 * @param address the address
 * @param runeId the rune ID
 * @param startOffset
 * @param limit
 * @returns list of boxes
 */
export async function* getAddressRunesUtxos(
  requestUnisat: <T>(path: string) => Promise<T>,
  address: string,
  runeId: string,
  startOffset: number = 0,
  limit: number = GET_BOX_API_LIMIT
): AsyncGenerator<BitcoinRunesUtxo, undefined> {
  let offset = startOffset;
  let hasMorePages = true;

  while (hasMorePages) {
    try {
      const response = await requestUnisat<UnisatResponse<UnisatAddressRunesUtxos>>(
        `/v1/indexer/address/${address}/runes/${runeId}/utxo?start=${offset}&limit=${limit}`
      );
      const utxos = response.data.utxo ?? [];
      if (utxos.length < limit) {
        hasMorePages = false;
      }

      const page = utxos.map((utxo) => ({
        txId: utxo.txid,
        index: utxo.vout,
        value: BigInt(utxo.satoshi),
        runes: utxo.runes.map((rune) => ({
          runeId: rune.runeid,
          quantity: BigInt(rune.amount)
        }))
      }));

      yield* page;

      offset += limit;
      // biome-ignore lint/suspicious/noExplicitAny: make it better
    } catch (e: any) {
      const baseError = `Failed to get UTxOs containing rune [${runeId}] for address [${address}] with offset/limit [${offset}/${limit}] from Unisat: `;
      if (e.response) {
        throw new Error(`${baseError}${JsonBigInt.stringify(e.response.data)}`);
      }
      throw new Error(`${baseError}${e.message}`);
    }
  }
}

/**
 * gets the current address's available UTXO list that can be used for BTC spending
 *
 * Note: UTXOs of assets such as inscriptions, runes, and alkanes will not be included
 * Note: UTXOs with less than 600 satoshis will not be returned to avoid potential
 *  unspendable outputs from unrecognized asset protocols or burns
 * @param address the address
 * @param offset
 * @param limit
 * @returns list of boxes
 */
export async function* getAddressAvailableBtcUtxos(
  requestUnisat: <T>(path: string) => Promise<T>,
  address: string,
  startOffset: number = 0,
  limit: number = GET_BOX_API_LIMIT
): AsyncGenerator<BitcoinRunesUtxo, undefined> {
  let offset = startOffset;
  let hasMorePages = true;

  while (hasMorePages) {
    try {
      const response = await requestUnisat<UnisatResponse<UnisatAddressAvailableBtcUtxos>>(
        `/v1/indexer/address/${address}/available-utxo-data?cursor=${offset}&size=${limit}`
      );
      const utxos = response.data.utxo ?? [];
      if (utxos.length < limit) {
        hasMorePages = false;
      }

      const page = utxos.map((utxo) => ({
        txId: utxo.txid,
        index: utxo.vout,
        value: BigInt(utxo.satoshi),
        runes: []
      }));

      yield* page;

      offset += limit;
      // biome-ignore lint/suspicious/noExplicitAny: make it better
    } catch (e: any) {
      const baseError = `Failed to get available UTxOs containing BTC only for address [${address}] with offset/limit [${offset}/${limit}] from Unisat: `;
      if (e.response) {
        throw new Error(`${baseError}${JsonBigInt.stringify(e.response.data)}`);
      }
      throw new Error(`${baseError}${e.message}`);
    }
  }
}

/**
 * gets confirmed and unspent boxes of an address
 * @param address the address
 * @param startOffset
 * @param limit
 * @returns list of boxes
 */
export async function* getAddressAllBtcUtxos(
  requestUnisat: <T>(path: string) => Promise<T>,
  address: string,
  startOffset: number = 0,
  limit: number = GET_BOX_API_LIMIT
): AsyncGenerator<BitcoinRunesUtxo, undefined> {
  let offset = startOffset;
  let hasMorePages = true;

  while (hasMorePages) {
    try {
      const response = await requestUnisat<UnisatResponse<UnisatAddressBtcUtxos>>(
        `/v1/indexer/address/${address}/all-utxo-data?cursor=${offset}&size=${limit}`
      );
      const utxos = response.data.utxo ?? [];
      if (utxos.length < limit) {
        hasMorePages = false;
      }

      const page = utxos.map((utxo) => ({
        txId: utxo.txid,
        index: utxo.vout,
        value: BigInt(utxo.satoshi),
        runes: []
      }));

      yield* page;

      offset += limit;
      // biome-ignore lint/suspicious/noExplicitAny: make it better
    } catch (e: any) {
      const baseError = `Failed to get all UTxOs containing BTC only for address [${address}] with offset/limit [${offset}/${limit}] from Unisat: `;
      if (e.response) {
        throw new Error(`${baseError}${JsonBigInt.stringify(e.response.data)}`);
      }
      throw new Error(`${baseError}${e.message}`);
    }
  }
}

/**
 * gets utxos by address from Esplora
 * @param address
 * @returns array of BitcoinRunesUtxo
 */
export async function* getEsploraAddressUtxos(
  address: string
): AsyncGenerator<BitcoinRunesUtxo, undefined> {
  const url = `${process.env.BITCOIN_ESPLORA_API}/api/address/${address}/utxo`;

  const response = await Axios.get<Array<EsploraUtxo>>(url);

  for (const record of response.data) {
    yield {
      txId: record.txid,
      index: record.vout,
      value: BigInt(record.value),
      runes: []
    };
  }
}

/**
 * gets utxos by address from Esplora
 * @param address
 * @returns
 */
export const getAddressUtxos = async (address: string) => {
  const esploraUrl = process.env.BITCOIN_ESPLORA_API;
  const GET_ADDRESS_UTXOS = `${esploraUrl}/api/address/${address}/utxo`;
  const res = await Axios.get<Array<EsploraUtxo>>(GET_ADDRESS_UTXOS);
  return res.data.map((utxo) => ({
    txId: utxo.txid,
    index: utxo.vout,
    value: BigInt(utxo.value)
  }));
};

/**
 * generates fee estimator for tx based on the OP_RETURN data length and type of the inputs and outputs
 *
 * **Note: The estimator does NOT consider the change boxes**
 * @param opReturnScriptLength
 * @param feeRatio
 * @param nativeSegwitInputSize
 * @param taprootInputSize
 * @param nativeSegwitOutputSize
 * @param taprootOutputSize
 * @param selectingBoxesType
 * @returns FeeEstimator
 */
export const generateFeeEstimatorWithAssumptions =
  (
    opReturnScriptLength: number,
    feeRatio: number,
    nativeSegwitInputSize: number,
    taprootInputSize: number,
    nativeSegwitOutputSize: number,
    taprootOutputSize: number,
    selectingBoxesType: typeof NATIVE_SEGWIT | typeof TAPROOT
  ): FeeEstimator<BitcoinRunesUtxo> =>
  (selectedBoxes: Array<BitcoinRunesUtxo>, _changeBoxesCount: number): bigint => {
    const nativeSegwitInputCount =
      selectingBoxesType === NATIVE_SEGWIT
        ? nativeSegwitInputSize + selectedBoxes.length
        : nativeSegwitInputSize;
    const taprootInputCount =
      selectingBoxesType === TAPROOT ? taprootInputSize + selectedBoxes.length : taprootInputSize;
    const estimatedVsize = estimateTxVsize(
      nativeSegwitInputCount,
      taprootInputCount,
      opReturnScriptLength,
      nativeSegwitOutputSize,
      taprootOutputSize
    );
    return BigInt(Math.ceil(estimatedVsize * feeRatio));
  };

/**
 * estimates the virtual size of the transaction based on the number of inputs, OP_RETURN output script, number of native segwit and taproot outputs
 * @param taprootInputSize
 * @param nativeSegwitInputSize
 * @param opReturnScriptLength
 * @param nativeSegwitOutputSize
 * @param taprootOutputSize
 * @returns estimated fee
 */
const estimateTxVsize = (
  taprootInputSize: number,
  nativeSegwitInputSize: number,
  opReturnScriptLength: number,
  nativeSegwitOutputSize: number,
  taprootOutputSize: number
): number => {
  const txBaseWeight = 40 + 2; // all txs include 40W. P2WPKH txs need additional 2W
  const opReturnWeightUnit =
    36 + // OP_RETURN base output weight
    opReturnScriptLength * 4; // OP_RETURN output data counts as vSize, so weight = script length * 4
  const inputsWeight =
    taprootInputSize * TAPROOT_INPUT_WEIGHT_UNIT + nativeSegwitInputSize * SEGWIT_INPUT_WEIGHT_UNIT;
  const outputWeight =
    nativeSegwitOutputSize * SEGWIT_OUTPUT_WEIGHT_UNIT +
    taprootOutputSize * TAPROOT_OUTPUT_WEIGHT_UNIT;

  return (txBaseWeight + inputsWeight + opReturnWeightUnit + outputWeight) / 4;
};

/**
 * submits a transaction
 */
export const submitTransaction = async (psbt: Psbt): Promise<string> => {
  const esploraUrl = process.env.BITCOIN_ESPLORA_API;
  const POST_TX = `${esploraUrl}/api/tx`;
  psbt.finalizeAllInputs();
  const res = await Axios.post<string>(POST_TX, psbt.extractTransaction().toHex());
  return res.data;
};
