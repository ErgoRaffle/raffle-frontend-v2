export interface UnisatResponse<Data> {
  code: number;
  msg?: string;
  data: Data;
}

export interface UnisatAddressRunesUtxos {
  utxo: UnisatRunesUtxo[];
  height: number;
  start: number;
  total: number;
}

export interface UnisatRunesUtxo {
  height: number;
  confirmations: number;
  address: string;
  satoshi: number;
  scriptPk: string;
  txid: string;
  vout: number;
  runes: UnisatRunesDetail[];
}

export interface UnisatRunesDetail {
  rune: string;
  runeid: string;
  spacedRune: string;
  amount: string;
  symbol: string;
  divisibility: number;
}

export interface UnisatAddressIndexerPage {
  cursor: number;
  total: number;
}

export interface UnisatAddressBtcUtxos extends UnisatAddressIndexerPage {
  totalConfirmed: number;
  totalUnconfirmed: number;
  totalUnconfirmedSpend: number;
  utxo: UnisatBtcUtxo[];
}

export interface UnisatAddressAvailableBtcUtxos extends UnisatAddressIndexerPage {
  utxo: UnisatAddressAvailableBtcUtxo[];
}

export interface UnisatBtcUtxo {
  txid: string;
  vout: number;
  satoshi: number;
  scriptType: string;
  scriptPk: string;
  codeType: number;
  address: string;
  height: number;
  idx: number;
  isOpInRBF: boolean;
  isSpent: boolean;
  inscriptionsCount: number;
  inscriptions: UnisatInscriptionItem[];
}

export interface UnisatAddressAvailableBtcUtxo extends UnisatBtcUtxo {
  confirmations: number;
}

export interface UnisatInscriptionItem {
  inscriptionId: string;
  inscriptionNumber: number;
  isBRC20: boolean;
  moved: boolean;
  offset: number;
}

export interface EsploraStatus {
  confirmed: boolean;
  block_height?: number;
  block_hash?: string;
  block_time?: number;
}

export interface EsploraUtxo {
  txid: string;
  vout: number;
  status: EsploraStatus;
  value: number;
}
