import { useEffect, useMemo, useState } from "react";
import { Arrow } from "@/components/Arrow";
import { useAddress } from "@/store/useAddress";
import { copyToClipboard, truncateString } from "@/utils/util";
import { User } from "@nextui-org/react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { ExtraInfo, ITx } from "@/app/dashboard/page";
import { formatAddress } from "@/utils/format";
import { IChain, IToken } from "@/store/useChains";
import { create } from "zustand";
import UniswapLogo from "@/app/transfer/components/Icon/UniswapLogo";
dayjs.extend(utc);
dayjs.extend(timezone);

type TransferUserInfoProps = {
  type?: "out" | "in" | "text" | "swap";
  data?: ExtraInfo;
  price?:number;
};
type TransferDetailInfoProps = {
  type?: "success" | "pending";
  data?: {
    label: string;
    value: string;
  }[];
  icon?:string;
  price?:number;
};

type SuccessCrossDetailProps = {} & StyleType;
type ErrorDetailProps = {} & StyleType;
type SuccessDetailProps = {} & StyleType;

const TransferUserInfo = ({ type = "out", data,price }: TransferUserInfoProps) => {
  const map = {
    out: { img: "/imgs/out.png", color: "#FF8266" },
    swap: { img: "/imgs/out.png", color: "#FFF" },
    in: { img: "/imgs/in.png", color: "#6FFF62" },
    text: { img: "/imgs/in.png", color: "#6FFF62" },
  };
  const { img, color } = map[type];
  const { currentAddress } = useAddress();
  const transactionDetail = useMemo(() => {
    let _data = sessionStorage.getItem("transaction_detail");
    if (_data) {
      return JSON.parse(_data) as ITx;
    }
    return undefined;
  }, []);
  const walletChains = useMemo(() => {
    let _chains = localStorage.getItem("wallet_chains");
    if (_chains) {
      return JSON.parse(_chains) as IChain[];
    }
    return [];
  }, []);

  const findTokenInfo = (tokenName: string): IToken | undefined => {
    for (const chain of walletChains) {
      const token = chain.tokens.find(t => t.name === tokenName);
      if (token) return token;
    }
    return undefined;
  };

  const tokenInfo = data ? findTokenInfo(data.source_token_name || data.fee.token_name) : undefined;

  let name = "Other"; // Default to "Other"
  if (transactionDetail) {
    if (type === "out" && currentAddress === transactionDetail.from) {
      name = "You";
    }
    if (type === "in" && currentAddress === transactionDetail.to) {
      name = "You";
    }
  }

  const swapFee = data?.fee.amount;
  const swapTokenName = data?.fee.token_name;
  const amount = Number(data?.amount).toFixed(4)|| Number(transactionDetail?.value).toFixed(4) ;
  const tokenName = data?.token_name || transactionDetail?.tokenName;
  const usdValue = price ? `$ ${(Number(data?.amount) * price).toFixed(2)}` : `$ ${Number(transactionDetail?.amount).toFixed(2)}`;

  console.log(`当前tokenname${data?.source_token_name||data?.token_name},当前usdValue:${usdValue}`);
  
  return (
    <div className="flex flex-row items-center w-full bg-[#819DF533] justify-between px-4 py-2 rounded-lg">
      {type==='swap' ? (
        <UniswapLogo></UniswapLogo>
      ) : (
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
      )}

      <div className="text-[12px] flex flex-col ">
        {type === "text" && (
          <div className="max-w-[180px]">
            charged <em className="text-[#FF8266] not-italic">0.24 USDT</em> for
            cross-chain bridging
          </div>
        )}
        {type === "swap" && (
          <div className="max-w-[180px] text-right">
            charged{" "}
            <em className="text-[#FFF] not-italic font-bold">
              {Number(transactionDetail?.gasFee?.usdValue).toFixed(4)} USDT
            </em>{" "}
            for swap and transfer
          </div>
        )}
        {type !== "text" && type !== "swap" && (
          <>
            <div>
              <img className="w-4 mr-2 inline-block" src={img} />
              <span className="font-bold inline-block" style={{ color }}>
                {amount }{" "}
                {tokenName || transactionDetail?.tokenName}
              </span>
              
                <div className="text-right">
                  {usdValue}
                </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const TransferDetailInfo = ({ type, data = [], icon, price }: TransferDetailInfoProps) => {
  const [transactionFees, setTransactionFees] = useState<string>("");

  useEffect(() => {
    const fetchFees = async () => {
      const feeItem = data.find(item => item.label === "Transaction fees");
      if (feeItem && price) {
        const feeAmount = parseFloat(feeItem.value.split(" ")[0]);
        const calculatedFee = (price * feeAmount).toFixed(2);
        setTransactionFees(`$ ${calculatedFee}`);
      }
    };
    fetchFees();
  }, [data, price]);

  return (
    <div className="px-4 py-1 flex flex-row">
      <div className="w-9 mr-8 bg-cover flex justify-center items-center">
        <Arrow type={type} src={icon}></Arrow>
      </div>
      <div className="flex-1 flex flex-col items-center py-1">
        <div>
          {data.map((item, index) => {
            if (item.label !== "Token icon") {
              return (
                <div key={index} className="text-[10px] py-1">
                  <span className="text-[#FFFFFF80] mr-1">{item.label}:</span>
                  {item.label === "Transaction hash" ? (
                    <span
                      className="cursor-pointer text-[#819DF5]"
                      onClick={() => {
                        copyToClipboard(item.value);
                      }}
                    >
                      {formatAddress(item.value)}
                    </span>
                  ) : (
                    <span>{item.label === "Transaction fees" ? transactionFees : item.value}</span>
                  )}
                </div>
              );
            }
          })}
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
  const formattedTime = dayjs((transactionDetail?.timeStamp || 0) * 1000)
    .utc()
    .format("HH:mm MMM DD YYYY")
    .toLocaleString();
  const data = [
    {
      label: "Transaction fees",
      value:
        (isNaN(Number(transactionDetail?.gasFee?.usdValue))
          ? "0"
          : Number(transactionDetail?.gasFee?.usdValue).toFixed(4).toString() ||
            0) + " USDT",
    },
    {
      label: "Time",
      value: formattedTime,
    },
    {
      label: "Transaction hash",
      value: transactionDetail?.txHash || "",
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
  const transactionDetail: ITx | undefined = useMemo(() => {
    let _data = sessionStorage.getItem("transaction_detail");
    if (_data) {
      return JSON.parse(_data) as ITx;
    }
    return undefined;
  }, []);

  const walletChains: IChain[] = useMemo(() => {
    let _chains = localStorage.getItem("wallet_chains");
    if (_chains) {
      return JSON.parse(_chains) as IChain[];
    }
    return [];
  }, []);

  const [prices, setPrices] = useState<{ [key: string]: number }>({});

    useEffect(() => {
    const fetchPrices = async () => {
      const tokenNames = transactionDetail?.extraInfo.map(info => info.source_token_name || info.token_name) || [];
      const uniqueTokenNames = tokenNames.filter((value, index, self) => self.indexOf(value) === index);
      
      const tokenPrices: { [key: string]: number } = {};
      for (const token of uniqueTokenNames) {
        try {
          const response = await fetch(`https://price-dev.web3idea.xyz/api/v1/coin-price?coinName=${token}`);
          const result = await response.json();
          if (result && result.result) {
            tokenPrices[token] = Number(result.result);
          }
        } catch (error) {
          console.error('Error fetching price:', error);
        }
      }
      setPrices(tokenPrices);

      // Update extraInfo with USD values
      const updatedExtraInfo = transactionDetail?.extraInfo.map(info => {
        const tokenPrice = tokenPrices[info.source_token_name || info.token_name] || 0;
        const usdValue = (Number(info.amount) * tokenPrice).toFixed(2);
        return {
          ...info,
          usdValue: `$ ${usdValue}`,
        };
      });

      // Update transactionDetail
      if (transactionDetail && updatedExtraInfo) {
        const updatedTransactionDetail = {
          ...transactionDetail,
          extraInfo: updatedExtraInfo,
        };
        sessionStorage.setItem("transaction_detail", JSON.stringify(updatedTransactionDetail));
        console.log(updatedTransactionDetail,'@@@@@@@@@@@@');
        
      }
    };

    if (transactionDetail) {
      fetchPrices();
    }
  }, [transactionDetail]);

  const findTokenIcon = (tokenName: string | undefined ): string | undefined => {
    for (const chain of walletChains) {
      const token = chain.tokens.find(t => t.name === tokenName);
      if (token) return token.icon;
    }
    return "";
  };

  const extraInfoData = transactionDetail?.extraInfo.map(info => {
    const tokenIcon = findTokenIcon(info.token_name||info.source_token_name) || '';
    return {
      data: [
        {
          label: "Transaction fees",
          value: `${info.fee.amount} ${info.fee.token_name}`,
        },
        {
          label: "Time",
          value: dayjs((Number(info?.create_date) || 0)).utc().format("HH:mm MMM DD YYYY").toLocaleString(),
        },
        {
          label: "Transaction hash",
          value: transactionDetail?.txHash || '',
        }
      ],
      icon: tokenIcon,
      price: prices[info.source_token_name||info.token_name] || 0
    };
  });


    
  return (
    <div className={className}>
      <TransferUserInfo
        data={transactionDetail?.extraInfo[0]}
        price={prices[transactionDetail?.extraInfo?.[0]?.source_token_name||transactionDetail?.extraInfo?.[0]?.token_name ||'']}
      ></TransferUserInfo>
      <TransferDetailInfo
        data={extraInfoData?.[0]?.data}
        icon={extraInfoData?.[0]?.icon || ""}
        price={extraInfoData?.[0]?.price}
      ></TransferDetailInfo>
      <TransferUserInfo type="swap"></TransferUserInfo>
      <TransferDetailInfo
        data={extraInfoData?.[1]?.data}
        icon={extraInfoData?.[1]?.icon || ""}
        price={extraInfoData?.[1]?.price}
      ></TransferDetailInfo>
      <TransferUserInfo
        type="in"
        data={transactionDetail?.extraInfo[1]}
        price={prices[transactionDetail?.extraInfo?.[1]?.source_token_name||transactionDetail?.extraInfo?.[1]?.token_name ||'']}
      ></TransferUserInfo>
    </div>
  );
};

