import { useEffect, useMemo } from "react";
import { Arrow } from "@/components/Arrow";
import { useAddress } from "@/store/useAddress";
import { copyToClipboard, truncateString } from "@/utils/util";
import { User } from "@nextui-org/react";
import dayjs from "dayjs";
import utc  from 'dayjs/plugin/utc';
import timezone  from 'dayjs/plugin/timezone';
import { ITx } from "@/app/dashboard/page";
import { formatAddress } from "@/utils/format";
import {IChain,IToken} from "@/store/useChains";
dayjs.extend(utc)
dayjs.extend(timezone)

type TransferUserInfoProps = {
  type?: "out" | "in" | "text";
};
type TransferDetailInfoProps = {
  type?: "success" | "pending";
  data?: {
    label: string;
    value: string;
  }[];
};

type SuccessCrossDetailProps = {} & StyleType;
type ErrorDetailProps = {} & StyleType;
type SuccessDetailProps = {} & StyleType;

const TransferUserInfo = ({ type = "out" }: TransferUserInfoProps) => {
  const map = {
    out: { img: "/imgs/out.png", color: "#FF8266" },
    in: { img: "/imgs/in.png", color: "#6FFF62" },
    text: { img: "/imgs/in.png" },
  };
  const { img, color } = map[type];
  const { currentAddress} = useAddress();
  const transactionDetail = useMemo(() => {
    let _data = sessionStorage.getItem("transaction_detail");
    if (_data) {
      return JSON.parse(_data) as ITx;
    }
    return undefined;
  }, []);

  let name = "Other"; // Default to "Other"
  if (transactionDetail) {
    if (type==="out"&&currentAddress === transactionDetail.from) {
      name = "You";
    }
    if (type==="in"&&currentAddress === transactionDetail.to) {
      name = "You";
    }
  }

 
  return (
    <div className="flex flex-row items-center w-full bg-[#819DF533] justify-between px-4 py-2 rounded-lg">
      <User
        name={name}
        avatarProps={{
          src: "https://i.pravatar.cc/150?u=a04258114e29026702d",
          style: {
            width: "36px",
            height: "36px",
          },
        }}
      />
      <div className="text-[12px] flex flex-col ">
        {type === "text" && (
          <div className="max-w-[180px]">
            charged <em className="text-[#FF8266] not-italic">0.24 USDT</em> for
            cross-chain bridging
          </div>
        )}
        {type !== "text" && (
          <>
          <div>
            <img  className="w-4 mr-2 inline-block" src={img} />
            <span className="font-bold inline-block" style={{ color }}>{transactionDetail?.value} {transactionDetail?.tokenName}</span>
            <div className="text-right"> ${Number(transactionDetail?.amount).toFixed(2)}</div>
          </div>
           
          </>
        )}
      </div>
    </div>
  );
};

const TransferDetailInfo = ({ type, data = [] }: TransferDetailInfoProps) => {

  // 获取当前时间
  const currentTime = dayjs();

  // 格式化时间
  const formattedTime = currentTime.format("HH:mm MMM DD YYYY");
const currentToken = useMemo(() => {
  let _data = sessionStorage.getItem("transaction_detail");
  let walletChains = localStorage.getItem("wallet_chains");
  if (_data && walletChains) {
    const transactionDetails: ITx = JSON.parse(_data);
    const chains: IChain[] = JSON.parse(walletChains);
    const chain = chains.find(chain => chain.name === transactionDetails.chainName);
    if (chain) {
      const token = chain.tokens.find(token => token.name === transactionDetails.tokenName);
      return token;
    }
  }
  return undefined;
}, []);
  
  return (
    <div className="px-4 py-1 flex flex-row">
      <div className="w-9 mr-8 bg-cover flex justify-center items-center">
        <Arrow
          type={type}
          src={currentToken?currentToken?.icon:''}
        ></Arrow>
      </div>
      <div className="flex-1 flex flex-col items-center py-1">
        <div>
          {data.map((item, index) => (
            <div key={index} className="text-[10px] py-1">
              <span className="text-[#FFFFFF80] mr-1">{item.label}:</span>
              {
                item.label==="Transaction hash" ?<span className="cursor-pointer text-[#819DF5]" onClick={()=>{
                    copyToClipboard(item.value);
                }}>{formatAddress(item.value)}</span> : <span>{item.value}</span>
              }
              
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const ErrorDetail = ({}: ErrorDetailProps) => {};
export const SuccessDetail = ({ className }: SuccessDetailProps) => {
  const transactionDetail = useMemo(() => {
    let _data = sessionStorage.getItem("transaction_detail");
    if (_data) {
      return JSON.parse(_data) as ITx;
    }
    return undefined;
  }, []);
  // 获取当前时间
  // 格式化时间
  const formattedTime = dayjs((transactionDetail?.timeStamp || 0 ) * 1000).utc().format("HH:mm MMM DD YYYY").toLocaleString();
  const data = [
    {
      label: "Transaction fees",
      value: (isNaN(Number(transactionDetail?.gasFee?.usdValue))?'0':Number(transactionDetail?.gasFee?.usdValue).toFixed(4).toString() || 0 )+ " USDT",
    },
    {
      label: "Time",
      value: formattedTime,
    },
     {
      label: "Transaction hash",
      value: transactionDetail?.txHash|| "",
    },
  ];
  return (
    <div className={className}>
      <TransferUserInfo></TransferUserInfo>
      <TransferDetailInfo data={data}></TransferDetailInfo>
      <TransferUserInfo type="in"></TransferUserInfo>
    </div>
  );
};
export const SuccessCrossDetail = ({ className }: SuccessCrossDetailProps) => {
  // 获取当前时间
  const currentTime = dayjs();

  // 格式化时间
  const formattedTime = currentTime.format("HH:mm MMM DD YYYY");
  const data = [
    {
      label: "Transaction fees",
      value: "0.12 USDT",
    },
    {
      label: "From",
      value: truncateString("0.12 USDT"),
    },
    {
      label: "To",
      value: truncateString("0.12 USDT"),
    },
    {
      label: "Time",
      value: formattedTime,
    },
  ];
  return (
    <div className={className}>
      <TransferUserInfo></TransferUserInfo>
      <TransferDetailInfo data={data}></TransferDetailInfo>
      <TransferUserInfo type="text"></TransferUserInfo>
      <TransferDetailInfo data={data}></TransferDetailInfo>
      <TransferUserInfo type="in"></TransferUserInfo>
    </div>
  );
};
