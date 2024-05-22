"use client";
import React, { useContext, useEffect, useState } from "react";
import MainLayout from "@/components/basic/MainLayout";
import Header from "./components/Header";
import Asset from "./components/Asset";
import Holdings from "./components/Holdings";
import Transactions from "./components/Transactions";
import { cn } from "@/utils/util";
import { IBalance, useChains } from "@/store/useChains";
import { useAddress } from "@/store/useAddress";
import { LoadingContext } from "../providers";
import { getBalance } from "@/api/assets";
import { getTxDetail } from "@/api/assets";
import Title from "@/components/Header";

export interface ITx {
  chainName: string;
  tokenId: number;
  tokenName: string;
  blockNumber: number;
  timeStamp: number;
  txHash: string;
  from: string;
  to: string;
  value: string;
  amount: string;
  currentAmount: string;
  status: number;
  gasFee: {
    tokenId: number;
    amount: string;
    usdValue: string;
  };
  transactionType: number;
  tradeDirection: number;
  extraInfo: string;
}

export default function DashBoardLayout() {
  const { currentChain, chains, setBalances, currentBalance } = useChains(
    (state) => state
  );
  const { currentAddress, addressList } = useAddress((state) => state);
  const { setLoading } = useContext(LoadingContext);
  const [transactionlist, setTransactionlist] = useState<ITx[]>([]);

  console.log(currentChain, currentAddress, currentBalance);

  function setCurrentChainId() { }
  function resetFetch() { }

  const [isHoldings, setIsHoldings] = useState<boolean>(true);

  async function getChainBalance(chainId: number, address: string) {
    const res = await getBalance(chainId, address);
    const data = res.body.result as IBalance;
    return data;
  }
  useEffect(() => {
    async function init() {
      // todo 获取每个链的余额
      const arr = [];
      setLoading(true);
      for (let i = 0; i < chains.length; i++) {
        const chain = chains[i];
        const address = addressList.find(
          (item) => item.chainId === chain.ID
        )?.walletAddress;
        if (!address) {
          continue;
        }
        const balance = await getChainBalance(chains[i].ID, address);
        arr.push(balance);
        console.log(balance);
      }
      setBalances(arr);
      setLoading(false);
    }
    init();
  }, []);

  useEffect(() => {
    async function init() {
      if (currentChain && currentAddress) {
        const res = await getTxDetail(currentChain?.ID, currentAddress);
        const data = res.body.result || [];
        sessionStorage.setItem("txList", JSON.stringify(data));
        setTransactionlist(data);
      }
    }
    init();
  }, [currentAddress]);

  return (
    <MainLayout activeMenu="dashboard">
      <div className="p-6 pt-0">
        <Title title="Wallet" />
        <Header
          address={currentAddress!}
          setChainId={resetFetch}
          setCurrentChainId={setCurrentChainId}
        />
        <Asset data={currentBalance} />
        <div className="flex mt-8 mb-2 text-base border-b-1 border-b-slate-500 border-opacity-30">
          <div
            className="flex-1 text-center cursor-pointer"
            onClick={() => {
              if (!isHoldings) {
                setIsHoldings(true);
              }
            }}
          >
            <div
              className={cn(
                "mx-4 p-3 relative bottom-[-1px]",
                !isHoldings
                  ? "text-[#819DF580] p-3"
                  : "text-white border-b-2 border-white py-3 font-bold"
              )}
            >
              Holdings
            </div>
          </div>
          <div
            className="flex-1 text-center cursor-pointer"
            onClick={() => {
              if (isHoldings) {
                setIsHoldings(false);
              }
            }}
          >
            <div
              className={cn(
                "mx-4 p-3 relative bottom-[-1px]",
                isHoldings
                  ? "text-[#819DF580] p-3"
                  : "text-white border-b-2 border-white py-3 font-bold"
              )}
            >
              Transactions
            </div>
          </div>
        </div>
      </div>
      <div className="p-2 pt-0">
        {isHoldings ? <Holdings /> : <Transactions list={transactionlist} />}
      </div>
    </MainLayout>
  );
}
