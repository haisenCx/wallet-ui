import ArrowUpSVG from "@/components/Icons/ArrowUp";
import ArrowDownSVG from "@/components/Icons/ArrowDown";
import CloseSVG from "@/components/Icons/CloseGrey";
import LinkArrowSVG from "@/components/Icons/LinkArrow";
import { timeToNow } from "@/utils/days";
import { formatAddress, formatValue } from "@/utils/format";
import { useRouter } from "next/navigation";
import { ITx } from "../page";
import UserSVG from "@/components/Icons/User";

interface ITransactionProps {
  list: ITx[];
}
export default function Transactions(props: ITransactionProps) {
  const { list = [] } = props;

  return (
    <div className="flex flex-col w-full justify-center items-center py-4 px-2">
      {list.map((item, index) => (
        <TxItem key={index} data={item} />
      ))}
    </div>
  );
}
export interface ItemProps {
  data: ITx;
}
export function TxItem(props: ItemProps) {
  const { data } = props;
  const router = useRouter();
  const {
    timeStamp,
    amount,
    status,
    tradeDirection,
    tokenName,
    to,
    value,
    transactionType,
  } = data;

  const directText =
    transactionType === 3
      ? "Create Account"
      : tradeDirection === 1
      ? "Sent to"
      : "Received from";

  const isCreate = transactionType === 3;

  function handleToDetail(data: ITx) {
    if (isCreate) {
      return;
    }
    sessionStorage.setItem("transaction_detail", JSON.stringify(data));
    router.push(`/transactionDetail`);
  }

  return (
    <div
      className="flex flex-row w-full mb-6 items-center hover:bg-[#819DF54D] cursor-pointer py-2  rounded-2xl active:bg-[#819DF599]"
      onClick={() => handleToDetail(data)}
    >
      <div className="flex flex-row gap-x-3">
        <div className="flex justify-center items-center">
          {isCreate ? <UserSVG /> : (
            <>
              {(status === 1 || status === 3) && tradeDirection === 1 ? <ArrowUpSVG /> : ""}
              {(status === 1 || status === 3) && tradeDirection === 2 ? <ArrowDownSVG /> : ""}
              {status === 2 ? <CloseSVG /> : ""}
            </>
          )}
        </div>
        <div className={status===2?"text-[#FFFFFF80] flex flex-col":'flex flex-col'}>
          <div>
            <div>{directText}</div>
            {isCreate ? null : <div>{formatAddress(to)}</div>}
          </div>
          <div className="text-[#819DF580]">{timeToNow(timeStamp)} ago</div>
        </div>
      </div>
      <div className="text-sm flex-1">
        {isCreate ? null : (
          <>
            <div className="text-right">
              <div>
                {tradeDirection === 1 ? "-" : "+"} {formatValue(value)}{" "}
                {tokenName}
              </div>
              <div className="text-[#819DF580]">${formatValue(amount)}</div>
            </div>
          </>
        )}
      </div>
      <div className="py-4 px-2">{isCreate ? null : <LinkArrowSVG />}</div>
    </div>
  );
}
