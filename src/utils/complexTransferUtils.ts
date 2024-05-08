import { AATx, GetEstimateFee } from "@/api/aaTxRecord";
import { Swap } from "@/api/swap";
import { Global } from "@/server/Global";
import { IAddress } from "@/store/useAddress";
import { IChain } from "@/store/useChains";
import { BigNumber, ethers } from "ethers";
import { BundlerRpc } from "sw-fe-sdk";
import erc20Abi from "sw-fe-sdk/dist/data/IERC20";
import sourceChainSenderAbi from "sw-fe-sdk/dist/data/SourceChainSender";

import Toast from "./toast";
import { CrossTx } from "@/api/crossChain";
import { ITransactionRecord, TxTypeEnum } from "@/api/types/transactionRecord";

export async function complexTransfer(ops: any[]) {
  const params = [];

  const rpc = Global.account.getBlockchainRpc();

  let extraData: ITransactionRecord[] = [];

  let chainsData = localStorage.getItem("wallet_chains");
  let addressListData = localStorage.getItem("wallet_addressList");
  let bundlerApi = "";
  let _gasPrice = 0;
  let feeToken = null;
  let chainId = 0;

  let chains: IChain[] = [];
  if (chainsData) {
    chains = JSON.parse(chainsData);
  }
  let addresslist: IAddress[] = [];
  if (addressListData) {
    addresslist = JSON.parse(addressListData);
  }

  let walletAddress = "";
  let entryPointAddress = "";

  let tokenPaymasterAddress = "";
  let payGasFeeTokenAddress = "";

  let _crossChainId = 0;
  for (let i = 0; i < ops.length; i++) {
    const op = ops[i];
    // 根据source_token，target_token拿到它们的地址
    const { type } = op;

    if (type === "swap") {
      const { chain_id, source_token, target_token, swap_in, swap_out, dex } =
        op;
      const findChain = chains.find((chain) => chain.ID == chain_id)!;
      const walletAddress = addresslist.find(
        (address) => address.chainId == chain_id
      )!.walletAddress;

      Global.account.setBlockchainRpc(findChain.rpcApi);

      const tokens = findChain.tokens;
      const finTokenIn = tokens.find((token) => token.name === source_token);
      const finTokenOut = tokens.find((token) => token.name === target_token);

      const swapParams = {
        chainId: chain_id,
        tokenIn: finTokenIn?.address!,
        tokenOut: finTokenOut?.address!,
        amount: swap_in,
        // recipient: walletAddress,
      };
      // 目前仅支持用mumbai的swt作为手续费，若swt不足，则提示手续费不足，然后结束
      const res = await GetEstimateFee("1");
      const { gasPrice, payFeeByToken, chainId } = res.body.result;

      feeToken = payFeeByToken.find((t: any) => t.token.name === "SWT");
      _gasPrice = gasPrice;

      const swapOp = await Swap(swapParams);
      const p = swapOp.body.result;
      const { callContractAddress, calldata } = p;

      let fromNative = finTokenIn?.type !== 1;
      if (!fromNative) {
        params.push({
          ethValue: BigNumber.from(0),
          callContractAbi: erc20Abi,
          callContractAddress: finTokenIn?.address,
          callFunc: "approve",
          callParams: [callContractAddress, ethers.constants.MaxUint256],
        });
      }

      params.push({
        ethValue: BigNumber.from(0),
        callContractAddress,
        calldataHex: calldata,
      });

      extraData.push({
        type: TxTypeEnum.SWAP,
        dex: dex,
        source_token_name: source_token,
        source_token_id: finTokenIn?.tokenId!,
        target_token_name: target_token,
        target_token_id: finTokenOut?.tokenId!,
        swap_in: swap_in,
        swap_out: swap_out,
        to_name: "",
        from_address: walletAddress,
        to_address: walletAddress,
        amount: swap_in,
        chain_id: findChain.ID,
        chain_name: findChain.name,
        create_date: new Date().getTime() + "",
        fee: {
          chain_id: findChain.ID,
          chain_name: findChain.name,
          token_id: feeToken.token.tokenId,
          token_name: feeToken.token.name,
          amount: feeToken.needAmount,
        },
      });
    }
    if (type === "chain-internal-transfer") {
      const { source_chain_id, source_chain_name, token, amount, receiver } =
        op;

      // 目前仅支持用mumbai的swt作为手续费，若swt不足，则提示手续费不足，然后结束
      const res = await GetEstimateFee("1");
      const { gasPrice, payFeeByToken } = res.body.result;
      feeToken = payFeeByToken.find((t: any) => t.token.name === "SWT").token;
      _gasPrice = gasPrice;

      // 判断几种情况：
      const findChain = chains.find((chain) => chain.ID == source_chain_id)!;
      bundlerApi = findChain.bundlerApi;
      chainId = findChain.ID;

      walletAddress = addresslist.find(
        (address) => address.chainId == source_chain_id
      )!.walletAddress;
      entryPointAddress = findChain.erc4337ContractAddress.entrypoint;

      const tokens = findChain.tokens;
      const finTokenIn = tokens.find((t) => t.name == token);

      let fromNative = finTokenIn?.type !== 1;
      let useNative = feeToken?.type !== 1;

      if (fromNative) {
        params.push({
          ethValue: ethers.utils.parseEther(amount),
          toAddress: receiver,
        });
      } else {
        params.push({
          ethValue: BigNumber.from(0),
          callContractAbi: erc20Abi,
          callContractAddress: finTokenIn?.address,
          callFunc: "transfer",
          callParams: [receiver, ethers.utils.parseEther(amount)],
        });
      }

      if (useNative) {
        tokenPaymasterAddress = "";
        payGasFeeTokenAddress = "";
      } else {
        tokenPaymasterAddress = feeToken?.tokenPaymasterAddress;
        payGasFeeTokenAddress = feeToken?.address;
      }
      extraData.push({
        type: TxTypeEnum.INTERNAL_TRANSFER,
        from_address: walletAddress,
        to_name: "",
        to_address: receiver,
        amount: amount,
        token_id: finTokenIn?.tokenId!,
        token_name: finTokenIn?.name!,
        chain_id: source_chain_id,
        chain_name: source_chain_name,
        create_date: new Date().getTime() + "",
        fee: {
          chain_id: source_chain_id,
          chain_name: source_chain_name,
          token_id: feeToken.tokenId,
          token_name: feeToken.name,
          amount: payFeeByToken.find((t: any) => t.token.name === "SWT")
            .needAmount,
        },
      });
    }
    if (type === "cross-chain-transfer") {
      // 暂时只支持CCIP
      const {
        raw_response,
        source_chain_id,
        token,
        amount,
        receiver,
        source_chain_name,
        target_chain_id,
        target_chain_name,
      } = op;

      _crossChainId = raw_response?.result[0].ID;

      // 目前仅支持用mumbai的swt作为手续费，若swt不足，则提示手续费不足，然后结束
      const res = await GetEstimateFee("1");
      const { gasPrice, payFeeByToken, chainId: _chainId } = res.body.result;
      feeToken = payFeeByToken.find((t: any) => t.token.name === "SWT").token;
      _gasPrice = gasPrice;

      const findChain = chains.find((c) => c.ID == source_chain_id)!;
      bundlerApi = findChain.bundlerApi;
      chainId = findChain.ID;
      const tokens = findChain?.tokens;
      const findToken = tokens?.find((t) => t.name === token);

      walletAddress = addresslist.find(
        (address) => address.chainId == source_chain_id
      )!.walletAddress;
      entryPointAddress = findChain.erc4337ContractAddress.entrypoint;

      let useNative = feeToken?.type !== 1;
      if (useNative) {
        tokenPaymasterAddress = "";
        payGasFeeTokenAddress = "";
      } else {
        tokenPaymasterAddress = feeToken?.tokenPaymasterAddress;
        payGasFeeTokenAddress = feeToken?.address;
      }

      let erc20ContractAddress = findToken?.address;
      let sourceChainSenderAddress =
        raw_response?.result?.[0]?.config?.contractAddress?.sourceChainSender ||
        "";
      let destChainReceiverAddress =
        raw_response?.result?.[0]?.config?.contractAddress?.destChainReceiver ||
        "";
      let destChainSelector =
        raw_response?.result?.[0]?.config?.destchainSelector || "";
      let receiverAddress = receiver;

      params.push(
        ...[
          {
            ethValue: BigNumber.from(0),
            callContractAbi: erc20Abi,
            callContractAddress: erc20ContractAddress,
            callFunc: "approve",
            callParams: [sourceChainSenderAddress, BigNumber.from(0)],
          },
          // approve
          {
            ethValue: BigNumber.from(0),
            callContractAbi: erc20Abi,
            callContractAddress: erc20ContractAddress,
            callFunc: "approve",
            callParams: [
              sourceChainSenderAddress,
              BigNumber.from(amount * Math.pow(10, findToken?.decimal!)),
            ],
          },
          // function sendMessage(uint64 destinationChainSelector,address receiver,payFeesIn feeToken,address to,uint256 amount) external returns (bytes32 messageId)
          {
            ethValue: BigNumber.from(0),
            callContractAbi: sourceChainSenderAbi,
            callContractAddress: sourceChainSenderAddress,
            callFunc: "sendMessage",
            // feeToken: 1-Link
            callParams: [
              BigNumber.from(destChainSelector),
              destChainReceiverAddress,
              1,
              receiverAddress,
              BigNumber.from(amount * Math.pow(10, findToken?.decimal!)),
            ],
          },
        ]
      );
      extraData.push({
        type: TxTypeEnum.CROSS_CHAIN,
        crossId: _crossChainId, // 跨链ID，当保存跨链信息到https://cc-dev.web3idea.xyz/api/v1/cross-tx可获得该值
        source_chain_id: source_chain_id, // 源链chain id
        source_chain_name: source_chain_name, // 源链chain id
        source_chain_amount: amount, // 源链交易的token数量
        target_chain_id: target_chain_id, // 目标链chain id
        target_chain_name: target_chain_name, // 目标链chain id
        to_name: "",
        from_address: walletAddress,
        to_address: receiver,
        amount: amount,
        token_id: feeToken.tokenId,
        token_name: token,
        create_date: new Date().getTime() + "",
        fee: {
          chain_id: findChain.ID,
          chain_name: findChain.name,
          token_id: findToken?.tokenId!,
          token_name: findToken?.name!,
          amount: payFeeByToken.find((t: any) => t.token.name === "SWT")
            .needAmount,
        },
      });
    }
  }
  let op = await Global.account.buildTxCallContract(
    walletAddress,
    entryPointAddress,
    _gasPrice,
    params,
    tokenPaymasterAddress,
    payGasFeeTokenAddress
  );

  Global.account.setBlockchainRpc(rpc);

  const res = await BundlerRpc.sendUserOperation(
    bundlerApi,
    op,
    entryPointAddress
  );
  console.log("res", res);
  if (res.body.result) {
    const opHase = res.body.result;
    const txParams = {
      chainid: chainId!,
      txSource: 1,
      userOperationHash: opHase,
      extraData: extraData,
    };
    const aares = await AATx(txParams);
    if (_crossChainId) {
      await CrossTx({
        crossChainConfigId: _crossChainId,
        sourceChainUserOperationHash: opHase,
        crossChainDetails: {},
      });
    }
    if (aares.body.result) {
      Toast("Transfer Success");
    }
  }
  // return op;
}
