import Link from "next/link";
import LinkArrowSVG from "@/components/Icons/LinkArrow";
import Image from "next/image";
import { IToken, ITokenBalance, useChains } from "@/store/useChains";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { formatValue } from "@/utils/format";

export default function Holdings() {
  const { currentChain, currentBalance } = useChains((state) => state);

  const holdingList = useMemo(() => {
    if (currentBalance && currentChain) {
      const tokens = currentChain.tokens;
      const { NativeBalance, tokenBalance } = currentBalance;
      const list = [];
      if (NativeBalance) {
        const tokenId = NativeBalance.tokenId;
        const find = tokens.find((item) => item.tokenId === tokenId);
        if (find) {
          list.push({
            ...NativeBalance,
            ...find,
          });
        }
      }
      if (tokenBalance) {
        tokenBalance.forEach((item) => {
          const tokenId = item.tokenId;
          const find = tokens.find((item) => item.tokenId === tokenId);
          if (find) {
            list.push({
              ...item,
              ...find,
            });
          }
        });
      }
      return list;
    } else {
      return [];
    }
  }, [currentBalance]);
  console.log(holdingList);
  return (
    <div className="w-full ">
      {holdingList?.map((item, index) => (
        <Item key={index} data={item}></Item>
      ))}
    </div>
  );
}

function Item({ data }: { data: ITokenBalance & IToken }) {
  const { name, icon, amount, usdValue } = data;
  const { currentChain } = useChains((state) => state);
  const route = useRouter();

  function handleToDetail(data: IToken) {
    sessionStorage.setItem("holding_token", JSON.stringify(data));
    route.push(`/holdings/${currentChain?.name}/${data.name}`);
  }
  return (
    <div className="flex items-center justify-between py-4 hover:bg-[#819DF54D] cursor-pointer px-4 rounded-2xl
         active:bg-[#819DF599]"
         onClick={() => handleToDetail(data)}>
      <div className="flex flex-1 items-center">
        <Image
          width={45}
          height={45}
          className="mr-4"
          src={icon}
          alt="chain logo"
        />
        <span className="text-md">{name}</span>
      </div>
      <div className="flex items-center">
        <div className="text-right">
          <div>{formatValue(amount)} </div>
          <div className="text-sm text-[#819DF580]">
            {formatValue(usdValue)} USD
          </div>
        </div>
        <div className="py-4 px-2 cursor-pointer" >
          <LinkArrowSVG />
        </div>
      </div>
    </div>
  );
}
