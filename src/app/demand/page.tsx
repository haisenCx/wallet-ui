"use client";
import Header from "@/components/Header";
import { classNames } from "@/utils/classNames";
import Style from "./style.module.scss";
import { Button } from "@nextui-org/button";
import { useContext, useEffect, useState } from "react";
import { LoadingContext } from "@/app/providers";
import { Global } from "@/server/Global";
import { useRouter } from "next/navigation";
import { Image } from "@nextui-org/react";
import { getAssetBalance } from "@/api/hold";
import { useClientFetchData } from "@/lib/hooks/useClientFetchData";
import { Response, AssetBalance } from "@/api/types/hold";
import Toast from "@/utils/toast";
import MainLayout from "@/components/basic/MainLayout";

const DemandPage = () => {
    const router = useRouter();
    const { setLoading } = useContext(LoadingContext);
    const handleTransfer = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        router.push("/transfer_function");
    };

    const handleCommingSoon = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        Toast("Comming soon...");
    };

    const functionData = [
        {
            id: "transfer",
            label: "Transfer",
            icon: "demand-transfer",
            disable: false,
            func: handleTransfer,
        },
        {
            id: "receive",
            label: "Receive",
            icon: "demand-receive",
            disable: true,
            func: handleCommingSoon,
        },
        {
            id: "earn",
            label: "Earn",
            icon: "demand-earn",
            disable: true,
            func: handleCommingSoon,
        },
        {
            id: "pay",
            label: "Pay",
            icon: "demand-pay",
            disable: true,
            func: handleCommingSoon,
        },
        {
            id: "play",
            label: "Play",
            icon: "demand-play",
            disable: true,
            func: handleCommingSoon,
        },
        {
            id: "social",
            label: "Social",
            icon: "demand-social",
            disable: true,
            func: handleCommingSoon,
        },
    ];

    const { isLoading, result } = useClientFetchData<Response<AssetBalance>>(
        getAssetBalance,
        {
            chainId: 1,
            // todo address修改
            address: "0x61f8a7B1634F3AfD82c13F01b995187432E85eEf",
        }
    );
    const balance = result ? result.result.sumBalanceUSD : "0";
    const balanceFix2 = parseFloat(balance).toFixed(2);

    const handle2Chat = () => {
        router.push("/demandchat");
    }
    return (
        <MainLayout activeMenu="demand">
            <div className="">
                <div
                    style={{
                        position: 'sticky',
                        top: '0',
                        backgroundColor: '#000'
                    }}
                >
                    <Header title="Demand" showBack={false} />
                </div>
                <div
                    className={classNames(`${Style.transaction} mian px-6 py-4 m-4 rounded-[25px]`)}
                >
                    <div className="font-poppins text-[20px] font-bold text-center leading-relaxed">
                        Deposit your balance to earn
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-4">
                        <div className="font-poppins text-[16px] font-bold leading-6">
                            Earn
                        </div>
                        <div className="font-poppins text-[16px] font-bold leading-6">
                            Retrieve
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-1">
                        <div className="font-poppins text-[#4FAAEB] text-[30px] font-bold leading-8">
                            Everyday
                        </div>
                        <div className="font-poppins text-[#3DC8C8] text-[30px] font-bold leading-8">
                            Anytime
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3  mt-5">
                        <div className="font-poppins text-[16px] font-bold leading-6">
                            Return
                        </div>
                        <div className="font-poppins text-[16px] font-bold leading-6">
                            Risks
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="font-poppins text-xs font-bold leading-4">
                            up to
                        </div>
                        <div className="font-poppins text-xs font-bold leading-4">
                            up to
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="font-poppins font-bold">
                            <span className="leading-normal text-[36px] text-[#4FAAEB]">5.7% </span>
                            <span className="text-xs"> APR</span>
                        </div>
                        <div className="font-poppins text-[#3DC8C8] text-[36px] font-bold">
                            <span className="leading-normal">0.1%</span>
                        </div>

                    </div>
                    <div className="mx-2 mt-4">
                        <Button
                            fullWidth
                            className="rounded-[15px] bg-[#949CBF]"
                            onClick={handleCommingSoon}
                        >
                            View
                            <span className="text-[14px] ml-2"> {">"} </span>
                        </Button>
                    </div>
                </div>
                <div className={classNames(`mian p-4 m-4 rounded-lg text-xs`)}>
                    <div className="grid grid-cols-3 gap-5">
                        {functionData.map((item) => (
                            <div
                                key={item.id}
                                className="flex flex-col items-center mb-1"
                                onClick={item.func}
                            >
                                <div
                                    className={classNames(
                                        `rounded-[13px] mb-2 text-center overflow-hidden`,
                                        item.disable ? `opacity-50` : ``
                                    )}
                                >
                                    <Image
                                        className="w-full h-full object-cover"
                                        src={`/imgs/${item.icon}.png`}
                                        alt={item.label}
                                    />
                                </div>
                                <div className="text-center">{item.label}</div>
                            </div>
                        ))}
                    </div>

                    <div style={{
                        position: 'sticky',
                        bottom: '10px'
                    }}>
                        <Button
                            fullWidth
                            size="lg"
                            className="mt-4 text-sm flex justify-between rounded-md text-white bg-[#819DF5] "
                            onClick={handle2Chat}
                        >
                            How can we help?
                            <Image
                                className=""
                                src={`/imgs/demand-microphone.png`}
                                alt="microphone"
                            />
                        </Button>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};
export default DemandPage;
