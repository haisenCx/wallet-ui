export enum TxTypeEnum {
  CROSS_CHAIN = "crossChain",
  INTERNAL_TRANSFER = "internalTransfer",
  SWAP = "swap"
}

export interface IInternalTransferData {
  type: TxTypeEnum.INTERNAL_TRANSFER;
  to_name: string;
  from_address: string;
  to_address: string;
  amount: string;
  token_id: number;
  token_name: string;
  chain_id: number;
  chain_name: string;
  create_date: string;
  fee: {
    chain_id: number;
    chain_name: string;
    token_id: number;
    token_name: string;
    amount: string;
  };
}

export interface ISwapData {
  type: TxTypeEnum.SWAP;
  dex: string; // swap方式，目前只支持uniswap
  source_token_name: string;
  source_token_id: number; // swap from token id
  target_token_name: string;
  target_token_id: number; // swap to token id
  swap_in: string; // swap from amount
  swap_out: string; // swap to amount
  to_name: string;
  from_address: string;
  to_address: string;
  amount: string;
  token_id?: number;
  token_name?: string;
  chain_id: number;
  chain_name: string;
  create_date: string;
  fee: {
    chain_id: number;
    chain_name: string;
    token_id: number;
    token_name: string;
    amount: string;
  };
}

export interface ICrossData {
  type: TxTypeEnum.CROSS_CHAIN;
  dex?: string; // swap方式，目前只支持uniswap
  crossId: number; // 跨链ID，当保存跨链信息到https://cc-dev.web3idea.xyz/api/v1/cross-tx可获得该值
  source_chain_id: number; // 源链chain id
  source_chain_name: number; // 源链chain id
  source_chain_amount: string; // 源链交易的token数量
  target_chain_id: number; // 目标链chain id
  target_chain_name: number; // 目标链chain id
  to_name: string;
  from_address: string;
  to_address: string;
  amount: string;
  token_id: number;
  token_name: string;
  chain_id?: number;
  chain_name?: string;
  create_date: string;
  fee: {
    chain_id: number;
    chain_name: string;
    token_id: number;
    token_name: string;
    amount: string;
  };
}

export type ITransactionRecord = IInternalTransferData | ISwapData | ICrossData;
