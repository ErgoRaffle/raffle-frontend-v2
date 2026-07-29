import { BitcoinBoxSelection, generateFeeEstimator } from '@rosen-bridge/bitcoin-utxo-selection';
import { address, Psbt } from 'bitcoinjs-lib';

import { InsufficientAssetsError } from '@ergo-raffle/base-wallet';

import { MINIMUM_BTC_FOR_NATIVE_SEGWIT_OUTPUT } from '../contants';
import { getAddressUtxos, getFeeRatio } from '../utils';

const selector = new BitcoinBoxSelection();

export const generateUnsignedTx = async (
  amount: bigint,
  fromAddress: string,
  toAddress: string
): Promise<{ psbt: Psbt; signInputs: Record<string, number[]> }> => {
  const fromAddressScript = address.toOutputScript(fromAddress);
  const toAddressScript = address.toOutputScript(toAddress);

  const psbt = new Psbt();

  psbt.addOutput({
    script: toAddressScript,
    value: amount
  });

  const utxos = await getAddressUtxos(fromAddress);

  const feeRatio = await getFeeRatio();

  const estimateFee = generateFeeEstimator(1, 42, 272, 124, feeRatio, 4);

  const coveredBoxes = await selector.getCoveringBoxes(
    {
      nativeToken: amount,
      tokens: []
    },
    [],
    new Map(),
    utxos.values(),
    MINIMUM_BTC_FOR_NATIVE_SEGWIT_OUTPUT,
    undefined,
    estimateFee
  );

  if (!coveredBoxes.covered) {
    throw new InsufficientAssetsError();
  }

  coveredBoxes.boxes.forEach((box) => {
    psbt.addInput({
      hash: box.txId,
      index: box.index,
      witnessUtxo: {
        script: fromAddressScript,
        value: box.value
      }
    });
  });

  psbt.addOutput({
    script: fromAddressScript,
    value: coveredBoxes.additionalAssets.aggregated.nativeToken
  });

  return {
    psbt,
    signInputs: {
      [fromAddress]: Array.from(Array(psbt.inputCount).keys())
    }
  };
};
