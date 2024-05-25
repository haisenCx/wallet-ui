import { Global } from "@/server/Global";
import { BigNumber, ethers } from "ethers";

export interface ITransferParams {
  fromNative: boolean; // true：转native token；false：转erc20 token
  useNative: boolean; // true：手续费使用 native token；false：手续费使用 erc20 token

  walletAddress: string;
  entryPointAddress: string;
  gasPrice: string;
  gasLimit: BigNumber|string|number;
  // 接收地址
  receiveAddress: string;
  amount: string;
  tokenPaymasterAddress?: string;
  payGasFeeTokenAddress?: string;
  tokenAddress: string;
}
export async function transfer(params: ITransferParams) {
  const {
    fromNative,
    useNative,
    walletAddress,
    entryPointAddress,
    gasPrice,
    gasLimit,
    receiveAddress,
    amount,
    tokenPaymasterAddress,
    payGasFeeTokenAddress,
    tokenAddress,
  } = params;
  let op;
  const _gasPrice = ethers.utils.parseEther(gasPrice);
  const _amount = ethers.utils.parseEther(amount);

  console.log("gasPrice", _gasPrice.toString());
  console.log("amount", _amount.toString());
  if (fromNative) {
    if (useNative) {
      op = await Global.account.buildTxTransferNativeToken(
        walletAddress,
        entryPointAddress,
        gasPrice,
        gasLimit,
        receiveAddress,
        _amount,
      );
    } else {
      op = await Global.account.buildTxTransferNativeToken(
        walletAddress,
        entryPointAddress,
        gasPrice,
        gasLimit,
        receiveAddress,
        _amount,
        tokenPaymasterAddress,
        payGasFeeTokenAddress,
      );
    }
  } else {
    if (useNative) {
      op = await Global.account.buildTxTransferERC20Token(
        walletAddress,
        entryPointAddress,
        gasPrice,
        gasLimit,
        receiveAddress,
        _amount,
        tokenAddress,
      );
    } else {
      op = await Global.account.buildTxTransferERC20Token(
        walletAddress,
        entryPointAddress,
        gasPrice,
        gasLimit,
        receiveAddress,
        _amount,
        tokenAddress,
        tokenPaymasterAddress,
        payGasFeeTokenAddress,
      );
    }
  }
  return op;
}
