import ecc from '@bitcoinerlab/secp256k1';
import * as runelib from '@magiceden-oss/runestone-lib';
import {
  type AssetBalance,
  BitcoinRunesBoxSelection,
  type BitcoinRunesUtxo
} from '@rosen-bridge/bitcoin-runes-utxo-selection';
import { address, initEccLib, Psbt } from 'bitcoinjs-lib';

import { InsufficientAssetsError } from '@ergo-raffle/base-wallet';

import {
  MINIMUM_BTC_FOR_NATIVE_SEGWIT_OUTPUT,
  MINIMUM_BTC_FOR_TAPROOT_OUTPUT,
  NATIVE_SEGWIT,
  TAPROOT
} from '../contants';
import {
  generateFeeEstimatorWithAssumptions,
  getAddressAllBtcUtxos,
  getAddressAvailableBtcUtxos,
  getAddressRunesUtxos,
  getEsploraAddressUtxos,
  getFeeRatio
} from '../utils';

initEccLib(ecc);

export const generateUnsignedTx = async (
  btcAmount: bigint,
  userNativeSegwitAddress: string,
  userTaprootAddress: string,
  userTaprootInternalPk: string,
  toAddress: string,
  tokenId: string,
  tokenAmount: bigint,
  requestUnisat: <T>(path: string) => Promise<T>
): Promise<{ psbt: Psbt; signInputs: Record<string, number[]> }> => {
  const p2wpkhPayment = address.toOutputScript(userNativeSegwitAddress);
  const taprootPayment = address.toOutputScript(userTaprootAddress);

  const requiredAssets: AssetBalance = {
    nativeToken:
      MINIMUM_BTC_FOR_TAPROOT_OUTPUT + // min required Satoshi for Runes change UTxO
      MINIMUM_BTC_FOR_NATIVE_SEGWIT_OUTPUT + // min required Satoshi for BTC change UTxO
      btcAmount, // required Satoshi for target UTxO
    tokens: [
      {
        id: tokenId,
        value: tokenAmount
      }
    ]
  };

  const [blockId, txIndex] = tokenId.split(':');
  const tokenIdObj = {
    block: BigInt(blockId),
    tx: Number(txIndex)
  };

  // generate runes data
  const runestone = runelib.encodeRunestone({
    edicts: [
      {
        id: tokenIdObj,
        amount: requiredAssets.tokens[0].value,
        output: 2
      }
    ],
    pointer: 0
  });

  // get fee ratio
  const feeRatio = await getFeeRatio();

  // generate PSBT object
  const psbt = new Psbt();

  // selection step 1: cover the required Rune only
  const runesUtxos = getAddressRunesUtxos(requestUnisat, userTaprootAddress, tokenId);
  const boxSelection = new BitcoinRunesBoxSelection();
  const coveredRunesBoxes = await boxSelection.getCoveringBoxes(
    {
      nativeToken: 0n,
      tokens: requiredAssets.tokens
    },
    [],
    new Map(),
    runesUtxos,
    0n,
    undefined,
    () => 0n
  );
  if (!coveredRunesBoxes.covered) {
    throw new InsufficientAssetsError();
  }

  const selectedBoxes: BitcoinRunesUtxo[] = coveredRunesBoxes.boxes;
  const signInputs: Record<string, number[]> = {
    [userTaprootAddress]: [...Array(coveredRunesBoxes.boxes.length).keys()], // an array from 0 to the number of selected boxes
    [userNativeSegwitAddress]: []
  };

  coveredRunesBoxes.boxes.forEach((box) => {
    psbt.addInput({
      hash: box.txId,
      index: box.index,
      witnessUtxo: {
        script: taprootPayment,
        value: box.value
      },
      tapInternalKey: Buffer.from(userTaprootInternalPk, 'hex')
    });
  });

  let selectedTaprootBoxesCount = 0;
  let selectedNativeSegwitBoxesCount = 0;
  const feeEstimator = generateFeeEstimatorWithAssumptions(
    runestone.encodedRunestone.length,
    feeRatio,
    selectedNativeSegwitBoxesCount,
    selectedTaprootBoxesCount,
    1,
    2, // Runes change UTxO and target UTxO are taproot
    TAPROOT
  );
  let estimatedFee = feeEstimator(selectedBoxes, 1);
  selectedTaprootBoxesCount += coveredRunesBoxes.boxes.length;

  const additionalAssets = coveredRunesBoxes.additionalAssets.aggregated;
  additionalAssets.nativeToken -= requiredAssets.nativeToken + estimatedFee;

  // selection step 2: try to get uncovered BTC from the only-BTC UTxOs of the taproot address
  //-- check if selected BTC can cover the required amount
  let preSelectedBtc = selectedBoxes.reduce((a, b) => a + b.value, 0n);
  if (preSelectedBtc < requiredAssets.nativeToken + estimatedFee) {
    // there is an edge case where the selected BTC cannot cover the fee
    // in this case, the `requiredBTC` will be negative. So, we use the
    // estimated fee for the `requiredBTC`
    const requiredBtc =
      requiredAssets.nativeToken > preSelectedBtc
        ? requiredAssets.nativeToken - preSelectedBtc
        : estimatedFee;

    // generate an iterator on available BTC UTxOs
    const btcUtxos = getAddressAvailableBtcUtxos(requestUnisat, userTaprootAddress);
    const step2FeeEstimator = generateFeeEstimatorWithAssumptions(
      runestone.encodedRunestone.length,
      feeRatio,
      selectedNativeSegwitBoxesCount,
      selectedTaprootBoxesCount,
      1,
      2, // Runes change UTxO and target UTxO are taproot
      TAPROOT
    );
    const additionalBoxes = await boxSelection.getCoveringBoxes(
      { nativeToken: requiredBtc, tokens: [] },
      selectedBoxes.map((box) => `${box.txId}.${box.index}`),
      new Map(),
      btcUtxos,
      0n, // we considered the required Satoshi for BTC change in the `requiredAssets` object
      undefined,
      step2FeeEstimator
    );

    // add selected boxes
    additionalBoxes.boxes.forEach((box) => {
      psbt.addInput({
        hash: box.txId,
        index: box.index,
        witnessUtxo: {
          script: taprootPayment,
          value: box.value
        },
        tapInternalKey: Buffer.from(userTaprootInternalPk, 'hex')
      });
    });

    signInputs[userTaprootAddress].push(
      ...[...Array(selectedBoxes.length + additionalBoxes.boxes.length).keys()].slice(
        selectedBoxes.length
      )
    );
    selectedBoxes.push(...additionalBoxes.boxes);
    selectedTaprootBoxesCount += additionalBoxes.boxes.length;

    // update the fee and additional BTC based on the result of the 2nd selection
    estimatedFee = additionalBoxes.additionalAssets.fee;
    additionalAssets.nativeToken =
      selectedBoxes.reduce((a, b) => a + b.value, 0n) - requiredAssets.nativeToken - estimatedFee;
  }

  // selection step 3: try to get uncovered BTC from the UTxOs of the native-segwit address
  preSelectedBtc = selectedBoxes.reduce((a, b) => a + b.value, 0n);
  if (preSelectedBtc < requiredAssets.nativeToken + estimatedFee) {
    // there is an edge case where the selected BTC cannot cover the fee
    // in this case, the `requiredBTC` will be negative. So, we use the
    // estimated fee for the `requiredBTC`
    const requiredBtc =
      requiredAssets.nativeToken > preSelectedBtc
        ? requiredAssets.nativeToken - preSelectedBtc
        : estimatedFee;

    // generate an iterator on user native-segwit UTxOs
    const nativeSegwitUtxos = getEsploraAddressUtxos(userNativeSegwitAddress);
    const step3FeeEstimator = generateFeeEstimatorWithAssumptions(
      runestone.encodedRunestone.length,
      feeRatio,
      selectedNativeSegwitBoxesCount,
      selectedTaprootBoxesCount,
      1,
      2, // Runes change UTxO and target UTxO are taproot
      NATIVE_SEGWIT
    );
    const additionalBoxes = await boxSelection.getCoveringBoxes(
      { nativeToken: requiredBtc, tokens: [] },
      selectedBoxes.map((box) => `${box.txId}.${box.index}`),
      new Map(),
      nativeSegwitUtxos,
      0n, // we considered the required Satoshi for BTC change in the `requiredAssets` object
      undefined,
      step3FeeEstimator
    );

    // add selected boxes
    additionalBoxes.boxes.forEach((box) => {
      psbt.addInput({
        hash: box.txId,
        index: box.index,
        witnessUtxo: {
          script: p2wpkhPayment,
          value: box.value
        }
      });
    });

    signInputs[userNativeSegwitAddress].push(
      ...[...Array(selectedBoxes.length + additionalBoxes.boxes.length).keys()].slice(
        selectedBoxes.length
      )
    );
    selectedBoxes.push(...additionalBoxes.boxes);
    selectedNativeSegwitBoxesCount += additionalBoxes.boxes.length;

    // update the fee and additional BTC based on the result of the 3rd selection
    estimatedFee = additionalBoxes.additionalAssets.fee;
    additionalAssets.nativeToken =
      selectedBoxes.reduce((a, b) => a + b.value, 0n) - requiredAssets.nativeToken - estimatedFee;
  }

  // selection step 4: try to get uncovered BTC from the remaining UTxOs of the taproot address
  preSelectedBtc = selectedBoxes.reduce((a, b) => a + b.value, 0n);
  if (preSelectedBtc < requiredAssets.nativeToken + estimatedFee) {
    // there is an edge case where the selected BTC cannot cover the fee
    // in this case, the `requiredBTC` will be negative. So, we use the
    // estimated fee for the `requiredBTC`
    const requiredBtc =
      requiredAssets.nativeToken > preSelectedBtc
        ? requiredAssets.nativeToken - preSelectedBtc
        : estimatedFee;

    // get all utxos
    // generate an iterator on user remaining taproot UTxOs
    const remainingTaprootUtxos = getAddressAllBtcUtxos(requestUnisat, userTaprootAddress);
    const step4FeeEstimator = generateFeeEstimatorWithAssumptions(
      runestone.encodedRunestone.length,
      feeRatio,
      selectedNativeSegwitBoxesCount,
      selectedTaprootBoxesCount,
      1,
      2, // Runes change UTxO and target UTxO are taproot
      TAPROOT
    );
    const additionalBoxes = await boxSelection.getCoveringBoxes(
      { nativeToken: requiredBtc, tokens: [] },
      selectedBoxes.map((box) => `${box.txId}.${box.index}`),
      new Map(),
      remainingTaprootUtxos,
      0n, // we considered the required Satoshi for BTC change in the `requiredAssets` object
      undefined,
      step4FeeEstimator
    );

    if (!additionalBoxes.covered) {
      throw new InsufficientAssetsError();
    }

    // add selected boxes
    additionalBoxes.boxes.forEach((box) => {
      psbt.addInput({
        hash: box.txId,
        index: box.index,
        witnessUtxo: {
          script: taprootPayment,
          value: box.value
        },
        tapInternalKey: Buffer.from(userTaprootInternalPk, 'hex')
      });
    });

    signInputs[userTaprootAddress].push(
      ...[...Array(selectedBoxes.length + additionalBoxes.boxes.length).keys()].slice(
        selectedBoxes.length
      )
    );
    selectedBoxes.push(...additionalBoxes.boxes);
    selectedTaprootBoxesCount += additionalBoxes.boxes.length; // no need for this, but we do it anyway, for the sake of consistency between steps

    // update the fee and additional BTC based on the result of the 4th selection
    estimatedFee = additionalBoxes.additionalAssets.fee;
    additionalAssets.nativeToken =
      selectedBoxes.reduce((a, b) => a + b.value, 0n) - requiredAssets.nativeToken - estimatedFee;
  }

  // add Runes change UTxO
  psbt.addOutput({
    script: taprootPayment,
    value: MINIMUM_BTC_FOR_TAPROOT_OUTPUT
  });
  // OP_RETURN
  psbt.addOutput({
    script: runestone.encodedRunestone,
    value: 0n
  });
  // target UTxO
  psbt.addOutput({
    script: address.toOutputScript(toAddress),
    value: btcAmount
  });
  // add BTC change UTxO
  psbt.addOutput({
    script: p2wpkhPayment,
    value: additionalAssets.nativeToken
  });

  return {
    psbt,
    signInputs
  };
};
