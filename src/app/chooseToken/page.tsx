"use client";
import Header from "@/components/Header";
import MainLayout from "@/components/basic/MainLayout";
import { Avatar } from "@nextui-org/react";
import Token from "../transfer_function/components/Token";
import { IBalance, IChain, IToken, ITokenBalance, useChains } from "@/store/useChains";
import { useMemo, useContext, useEffect, useState } from "react";
import { formatAddress } from "@/utils/format";
import CloseIcon from "@/components/Icons/Close";
import { useRouter } from "next/navigation";
import { getBalance } from "@/api/assets";
import { useAddress } from "@/store/useAddress";
import { LoadingContext } from "../providers";

const crossChainSwt = (banlance: ITokenBalance[], balance: IBalance | undefined) => {
  if (!balance) return;
  const _banlance = [];
  if (balance.NativeBalance) _banlance.push(balance.NativeBalance);
  if (balance.tokenBalance) _banlance.push(...balance.tokenBalance);
  const currentSwt = _banlance.find(({tokenId}) => tokenId === 2);
  if (!currentSwt) return;
  const index = banlance.findIndex((b) => b.tokenId === 2);
  if (index!== -1) banlance.splice(index, 1, currentSwt);
}

export default function ChooseToken() {
  const { setLoading } = useContext(LoadingContext);
  const { chains } = useChains((state) => state);
  const { currentAddress } = useAddress()
  const router = useRouter()
  const [transferData, setTransferData] = useState({
    address: '',
    name: '',
    tokens: [] as IToken[],
    balances: [] as ITokenBalance[],
  });

  useEffect(() => {
    const fetchBalances = async () => {

      const address = sessionStorage.getItem("transfer_address") || "";
      const name = sessionStorage.getItem("transfer_name") || "";
      const chainId = sessionStorage.getItem("transfer_chainId");
      const findChain = chains.find((c: IChain) => c.ID === Number(chainId));
      if (findChain && currentAddress) {

        const res = await getBalance(findChain.ID, currentAddress);
        const { body: { result } } = res
        const _banlance = [];
        if (result) {
          if (result.NativeBalance) {
            _banlance.push(result.NativeBalance);
          }
          if (result.tokenBalance) {
            _banlance.push(...result.tokenBalance);
          }
        }

        setTransferData({
          address,
          name,
          tokens: findChain?.tokens,
          balances: _banlance,
        });
        setLoading(false)
      }
    };

    if (chains && currentAddress) {
      setLoading(true)
      fetchBalances();
    }
  }, [chains, currentAddress]);

  return (
    <MainLayout showMenu={false}>
      <Header title="Transfer" showBack></Header>
      <div className="p-6">
        <div className="font-bold mb-2">Send To</div>
        <div className="flex justify-bettwen items-center">
          <div className="flex items-center w-full">
            <Avatar className="mr-4" src="/imgs/icon.png"></Avatar>
            <div className="flex flex-col w-[60%]">
              <p className="truncate">{transferData.name || "New Friend"}</p>
              <p className="">{formatAddress(transferData.address)}</p>
            </div>
            <div className="w-[30%] flex justify-end">
              <CloseIcon onClick={() => router.back()} />
            </div>
          </div>
        </div>
        <Token tokens={transferData.tokens} balances={transferData.balances} toAddress={transferData.address} />
      </div>
    </MainLayout>
  );
}
