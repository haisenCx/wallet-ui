"use client";
import { classNames } from "@/utils/classNames";
import Style from "./style.module.scss";
import { TransactionMain } from "./components/TransactionMain";
import { SuccessCrossDetail, SuccessDetail } from "./components/Detail";
import MainLayout from "@/components/basic/MainLayout";
import Header from "@/components/Header";
import { useMemo } from "react";
import { ITx } from "../dashboard/page";
import dayjs from "dayjs";
import Person from "@/components/Person";
import { useAddress } from "@/store/useAddress";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import UniswapLogo from "../transfer/components/Icon/UniswapLogo";
dayjs.extend(utc);
dayjs.extend(timezone);
type AmountProps = { num: number | string } & StyleType;

type StatusProps = {
  type: "success" | "fail" | "pending";
  time: string;
} & StyleType;

const Status = ({ type, time, className }: StatusProps) => {
  const map = {
    success: {
      style: Style.success,
      text: "Succeed",
    },
    fail: {
      style: Style.fail,
      text: "Failed",
    },
    pending: {
      style: Style.pending,
      text: "Pending",
    },
  };
  const { style, text } = map[type];
  return (
    <div className={classNames(className, Style.status, style)}>
      <div className={Style["text-left"]}>{text}</div>
      <div className={Style["text-right"]}>{time}</div>
    </div>
  );
};

export default function TransactionDetail() {
  const { currentAddress } = useAddress();
  const transactionDetail = useMemo(() => {
    let _data = sessionStorage.getItem("transaction_detail");
    if (_data) {
      return JSON.parse(_data) as ITx;
    }
    return undefined;
  }, []);

  if (!transactionDetail) {
    return (
      <MainLayout showMenu={false}>
        <div className="flex flex-col h-full">
          <Header title="Transaction Detail" showBack />
          <div className="flex-1 flex justify-center items-center font-bold text-base">
            Please select a transaction
          </div>
        </div>
      </MainLayout>
    );
  }

  const time = transactionDetail?.timeStamp
    ? dayjs(transactionDetail?.timeStamp * 1000)
        .utc()
        .format("HH:mm MMM DD YYYY")
        .toLocaleString()
    : "";
  let inName = "Other";
  let outName = "Other";
  if (transactionDetail) {
    if (currentAddress === transactionDetail.from) {
      outName = "You";
    }
    if (currentAddress === transactionDetail.to) {
      inName = "You";
    }
  }
  let currentStatus: StatusProps["type"] =
    transactionDetail.status == 2
      ? "fail"
      : transactionDetail.status == 1
      ? "success"
      : transactionDetail.status == 3
      ? "pending"
      : "success";
  let isSwap =
    transactionDetail.extraInfo.length > 1 &&
    transactionDetail.extraInfo[0].type === "swap";
  return (
    <MainLayout showMenu={false}>
      <div className="flex flex-col h-full">
        <Header title="Transaction Detail" showBack />
        <div className={classNames(Style.transaction)}>
          <div className="py-4 w-full">
            <Status className="mb-4" type={currentStatus} time={time}></Status>
            <div className="w-full flex items-center justify-center border-b-1 border-gray-500/30 px-6 pb-4">
              <Person
                name={outName}
                address={transactionDetail.from}
                value={isSwap ? transactionDetail.extraInfo[0].amount : null}
                token={transactionDetail.extraInfo[0].source_token_name}
              />
              {isSwap ? (
                <div className=" flex items-center relative h-[100px]">
                    <svg
                    className="w-13"
                    width="82"
                    height="24"
                    viewBox="0 0 82 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M72 12L62 6.22647V17.7735L72 12ZM32 13L63 13V11L32 11V13Z"
                      fill="#33AA5C"
                    />
                  </svg>
                  <div className="flex flex-1 flex-col justify-center items-center text-center">
                    <UniswapLogo></UniswapLogo>
                    <p className="bg-[#819DF54D] text-[#819DF5] block absolute bottom-[6%] rounded-full text-xs text-center whitespace-nowrap px-3 py-1">
                      Swap Transfer
                    </p>
                  </div>
                    <svg
                    className="w-13"
                    width="75"
                    height="24"
                    viewBox="0 0 75 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M50 12L40 6.22647V17.7735L50 12ZM10 13H12V11H10V13ZM16 13H20V11H16V13ZM24 13H28V11H24V13ZM32 13L36 13V11L32 11V13ZM40 13L44 13V11L40 11V13Z"
                      fill="#D0D346"
                    />
                  </svg>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center">
                  <p className="text-[#4FAAEB] text-sm font-bold">{`${transactionDetail.value} ${transactionDetail.tokenName}`}</p>
                  <svg
                    width="88"
                    height="12"
                    viewBox="0 0 88 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M88 6L78 0.226497V11.7735L88 6ZM0 7L79 7V5L0 5L0 7Z"
                      fill="#33AA5C"
                    />
                  </svg>

                  <p className="text-[#819DF5] text-xs">Direct Transfer</p>
                </div>
              )}
              <Person
                name={inName}
                address={transactionDetail.to}
                value={isSwap ? transactionDetail.extraInfo[1].amount : null}
                token={transactionDetail.extraInfo[1].token_name}
              />
            </div>
          </div>
          <div className="flex-1">
            <div className="my-4">
              {transactionDetail.extraInfo.length > 1 ? (
                <SuccessCrossDetail></SuccessCrossDetail>
              ) : (
                <SuccessDetail></SuccessDetail>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
