export interface RawResponse {
  code: number;
  message: string;
  result: {
    minInAmount: string;
  };
}

export interface Operation {
  type: string;
  raw_response: RawResponse | null;
  chain_id?: number;
  chain_name?: string;
  source_token: string;
  target_token?: string;
  dex?: string;
  swap_in?: string;
  swap_out?: string;
  usdValue?: string;
  tokenIcon?: string;
  source_chain_id?: number;
  source_chain_name?: string;
  token: string;
  amount?: string;
  receiver?: string;
  target_chain_id?: number;
  target_chain_name?: string;
}

export interface TransferInfo {
  reply: string;
  ops: Operation[];
}