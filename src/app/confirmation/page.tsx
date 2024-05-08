"use client";
import {
  Avatar,
  Button,
  Divider,
  Listbox,
  ListboxItem,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/react";
import Header from "@/components/Header";
import MainLayout from "@/components/basic/MainLayout";
import DropArrow from "@/components/Icons/DropArrow";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useAddress } from "@/store/useAddress";
import { IChain, useChains } from "@/store/useChains";
import { AATx, GetEstimateFee } from "@/api/aaTxRecord";
import Image from "next/image";
import { BundlerRpc } from "sw-fe-sdk";
import { classNames } from "@/utils/classNames";
import { ITransferParams, transfer } from "@/utils/transferUtils";
import { Global } from "@/server/Global";
import Toast from "@/utils/toast";
import { formatAddress, formatValue } from "@/utils/format";
import Person from "@/components/Person";
import { LoadingContext } from "@/app/providers";
import { IInternalTransferData, TxTypeEnum } from "@/api/types/transactionRecord";
import { useRouter } from "next/navigation";

function Tab({
  name,
  address,
  userAvatar,
  amount,
  tokenName,
  coinValue,
}: {
  name: string;
  address: string;
  userAvatar?: string;
  tokenName: string;
  amount: string;
  coinValue: string;
}) {
  return (
    <div className="flex-1 flex">
      <div className="flex flex-1">
        <Avatar src="/imgs/icon.png" className="mr-2"></Avatar>
        <div>
          <p className=" font-bold">{name}</p>
          <p className="text-[#819DF5] text-sm">{formatAddress(address)}</p>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <p className="text-[#819DF5] font-semibold">
          {amount} {tokenName}
        </p>
        <p className="text-white/30 text-sm">{coinValue}</p>
      </div>
    </div>
  );
}

function GapLine() {
  return (
    <div className="flex flex-col relative">
      <div className="rotate-90 absolute top-[-10px] left-[-40px] scale-50">
        <svg
          width="126"
          height="24"
          viewBox="0 0 126 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M107 12L97 6.2265V17.7735L107 12ZM19 13H21V11H19V13ZM25 13H29V11H25V13ZM33 13H37V11H33V13ZM41 13L45 13V11L41 11V13ZM49 13L53 13V11L49 11V13ZM57 13L61 13V11L57 11V13ZM65 13L69 13V11L65 11V13ZM73 13L77 13V11H73V13ZM81 13H85V11L81 11V13ZM89 13H93V11H89V13ZM97 13H101V11H97V13Z"
            fill="white"
          />
        </svg>
      </div>
      <Divider />
    </div>
  );
}

interface IAATxParams {
  chainid: number;
  txSource: number;
  userOperationHash: string;
  extraData: IInternalTransferData[];
}

function AmountPlaneItem({
  title,
  isBold,
  amount,
  coinValue,
  needArrow,
  clickEvent,
}: {
  title: string;
  isBold: boolean;
  amount: string;
  coinValue: string;
  needArrow: boolean;
  clickEvent?: () => void;
}) {
  return (
    <div onClick={clickEvent} className="py-4">
      <div className="flex justify-between">
        <div className="flex items-center">
          <p
            className="text-mainPurpleBlue mr-2"
            style={{ fontWeight: isBold ? 700 : "normal" }}
          >
            {title}
          </p>
          {needArrow && <DropArrow />}
        </div>
        <p style={{ fontWeight: isBold ? 700 : "normal" }}>{amount}</p>
      </div>
      {coinValue ? (
        <div className="flex justify-end">
          <p className="text-sm text-white/50">${coinValue}</p>
        </div>
      ) : null}
    </div>
  );
}

export default function Confirmation() {
  const { addressList } = useAddress();
  const { chains } = useChains();
  const { setLoading } = useContext(LoadingContext);
  const [gasFeeList, setGasFeeList] = useState([]);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [currentGasFee, setCurrentGasFee] = useState<any>(null);
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);
  const transferData = useMemo(() => {
    const amount = sessionStorage.getItem("transfer_amount");
    const address = sessionStorage.getItem("transfer_address") || "";
    const name = sessionStorage.getItem("transfer_name") || "";
    const tokenId = sessionStorage.getItem("transfer_tokenId");
    const chainId = sessionStorage.getItem("transfer_chainId");

    const findChain = chains.find((c: IChain) => c.ID === Number(chainId));
    const tokens = findChain?.tokens;
    const token = tokens?.find((t) => t.tokenId == +tokenId!);
    const chainAddress = addressList.find(
      (item) => item.chainId === Number(chainId)
    )?.walletAddress;

    return {
      amount,
      address,
      name,
      token,
      chain: findChain,
      chainId,
      chainAddress,
      toName: name,
    };
  }, []);
  const gasPriceRef = useRef(0);
  useEffect(() => {
    async function get() {
      setLoading(true);
      const res = await GetEstimateFee(transferData.chainId!);
      setLoading(false);
      const { gasPrice, payFeeUsdValue, payFeeByToken } = res.body.result;
      setGasFeeList(payFeeByToken);
      setCurrentGasFee(payFeeByToken[0]);
      gasPriceRef.current = gasPrice;
    }
    get();
  }, [transferData.chainId]);

  async function handleConfirm() {
    const entryPointAddress =
      transferData.chain?.erc4337ContractAddress.entrypoint!;
    const bundlerApi = transferData.chain?.bundlerApi!;
    const params: ITransferParams = {
      fromNative: transferData.token?.type !== 1,
      useNative: currentGasFee?.token?.type !== 1,
      walletAddress: transferData.chainAddress!,
      entryPointAddress: entryPointAddress,
      receiveAddress: transferData.address,
      amount: transferData.amount!,
      gasPrice: gasPriceRef.current + "",
      tokenPaymasterAddress: currentGasFee.token?.tokenPaymasterAddress || "",
      payGasFeeTokenAddress: currentGasFee?.token?.address || "",
      tokenAddress: transferData.token?.address || "",
    };
    setLoading(true);
    try {
      const rpc = Global.account.getBlockchainRpc();
      Global.account.setBlockchainRpc(transferData.chain?.rpcApi!);
      const op = await transfer(params);
      console.log("gooooood op", op);
      const res = await BundlerRpc.sendUserOperation(
        bundlerApi,
        op,
        entryPointAddress
      );
      console.log("res", res);
      if (res.body.result) {
        const opHase = res.body.result;
        const txParams: IAATxParams = {
          chainid: +transferData.chainId!,
          txSource: 1,
          userOperationHash: opHase,
          extraData: [
            {
              type: TxTypeEnum.INTERNAL_TRANSFER,
              from_address: params.walletAddress,
              to_name: transferData.name,
              to_address: params.receiveAddress,
              amount: params.amount,
              token_id: transferData.token?.tokenId!,
              token_name: transferData.token?.name!,
              chain_id: +transferData.chainId!,
              chain_name: transferData.chain?.name!,
              create_date: new Date().getTime() + "",
              fee: {
                chain_id: +transferData.chainId!,
                chain_name: transferData.chain?.name!,
                token_id: currentGasFee.token.tokenId,
                token_name: currentGasFee.token.name,
                amount: currentGasFee.needAmount,
              },
            },
          ],
        };
        const aares = await AATx(txParams);
        if (aares.body.result) {
          setShowSuccess(true);
          setTimeout(() => {
            router.push("/transfer_function");
          }, 3000);
        }
        setLoading(false);
      } else {
        setLoading(false);
        Toast(res.body.error.message || "something wrong!");
      }
      Global.account.setBlockchainRpc(rpc);
    } catch (error) {
      setLoading(false);
      throw error
    }
  }

  const total = useMemo(() => {
    if (currentGasFee && transferData) {
      if (currentGasFee.token.name === transferData.token?.name) {
        const total = formatValue(
          `${+currentGasFee.needAmount + +transferData.amount!}`
        );
        return `${total} ${transferData.token?.name} `;
      }
      return `${transferData.amount!} ${transferData.token?.name} + ${currentGasFee.needAmount} ${currentGasFee.token.name}`;
    }
    return "";
  }, [currentGasFee, transferData]);

  return (
    <MainLayout showMenu={false}>
      <Header title="Transfer" showBack></Header>
      <div className="p-6">
        <div className="flex flex-col justify-between">
          <div className="flex items-center justify-center border-b-1 border-gray-500/30 px-4 pb-4">
            <Person name={"You"} address={transferData.chainAddress || ""} />
            <div className="flex-1 flex flex-col items-center">
              <p className="text-[#4FAAEB] text-sm font-bold">
                {transferData?.amount || ""} {transferData.token?.name || ""}
              </p>
              <svg
                width="126"
                height="24"
                viewBox="0 0 126 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M107 12L97 6.2265V17.7735L107 12ZM19 13H21V11H19V13ZM25 13H29V11H25V13ZM33 13H37V11H33V13ZM41 13L45 13V11L41 11V13ZM49 13L53 13V11L49 11V13ZM57 13L61 13V11L57 11V13ZM65 13L69 13V11L65 11V13ZM73 13L77 13V11H73V13ZM81 13H85V11L81 11V13ZM89 13H93V11H89V13ZM97 13H101V11H97V13Z"
                  fill="white"
                />
              </svg>
              <p className="text-[#819DF5] text-xs">Direct Transfer</p>
            </div>
            <Person
              name={transferData?.toName || "New Friend"}
              address={transferData.address || ""}
            />
          </div>

          <div className="my-8">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center mb-4">
                <div className="w-[50px] text-center mr-2">From</div>
                <Tab
                  name={"You"}
                  address={transferData.chainAddress || ""}
                  amount={transferData?.amount || ""}
                  tokenName={transferData?.token?.name || ""}
                  coinValue={""}
                />
              </div>
              {/* <GapLine /> */}
              <div className="flex justify-between items-center">
                <div className="w-[50px] text-center mr-2">To</div>
                <Tab
                  name={transferData?.toName || "New Friend"}
                  address={transferData.address || ""}
                  tokenName={transferData?.token?.name || ""}
                  amount={transferData?.amount || ""}
                  coinValue={""}
                />
              </div>
            </div>
          </div>
          <div>
            <div className="flex bg-[#819DF533] rounded-xl flex-col px-4 py-2">
              <AmountPlaneItem
                title={"Transfer Amount"}
                isBold={false}
                needArrow={false}
                amount={
                  transferData
                    ? `${formatValue(transferData?.amount!)} ${transferData.token?.name}`
                    : ""
                }
                coinValue={""}
              />
              <AmountPlaneItem
                title={"Gas Fee"}
                isBold={false}
                needArrow={true}
                clickEvent={() => {
                  onOpen();
                }}
                amount={
                  currentGasFee
                    ? `${formatValue(currentGasFee?.needAmount)} ${currentGasFee?.token?.name}`
                    : "0"
                }
                coinValue={""}
              />
              <Modal
                isOpen={isOpen}
                placement="bottom"
                className="text-white"
                onOpenChange={onOpenChange}
              >
                <ModalContent>
                  {(onClose) => (
                    <>
                      <ModalHeader className="flex justify-center items-center text-base">
                        Gas Fee
                      </ModalHeader>
                      <ModalBody className="px-4 pb-4">
                        <Listbox
                          items={gasFeeList}
                          aria-label="Dynamic Actions"
                          onAction={(key) => {
                            const find = gasFeeList.find(
                              (item: any) => item.token.tokenId == key
                            );
                            setCurrentGasFee(find);
                            onClose();
                          }}
                        >
                          {(item: any) => (
                            <ListboxItem
                              key={item.token.tokenId}
                              className={classNames(
                                "mb-4",
                                currentGasFee?.token.tokenId ===
                                  item.token.tokenId
                                  ? "text-[#4FAAEB]"
                                  : ""
                              )}
                            >
                              <div className="flex items-center">
                                <Image
                                  src={item.token.icon}
                                  alt="logo"
                                  width={40}
                                  height={40}
                                  className="mr-4"
                                />
                                <div className="flex-1 font-bold text-base">
                                  {item.token.name}
                                </div>
                                <div>
                                  <p>{item.needAmount}</p>
                                  {/* <p>${item.usdValue}</p> */}
                                </div>
                              </div>
                            </ListboxItem>
                          )}
                        </Listbox>
                      </ModalBody>
                    </>
                  )}
                </ModalContent>
              </Modal>
              <Divider className="my-2" />
              <AmountPlaneItem
                title={"Total Amount"}
                isBold={true}
                needArrow={false}
                amount={total}
                coinValue={""}
              />
            </div>
          </div>
          <div className="absolute bottom-8 left-8 right-8">
            <Button
              onClick={handleConfirm}
              fullWidth
              size="lg"
              className="bg-[#819DF5] rounded-3xl"
            >
              Confirm and Send
            </Button>
          </div>
        </div>
      </div>
      {showSuccess ? (
        <div className="absolute top-0 bottom-0 left-0 right-0 bg-black/80">
          <div
            className="absolute text-center top-1/2 left-10 right-10 -translate-y-1/2 rounded-3xl bg-[#597EFF] py-8"
            style={{
              background:
                "linear-gradient(180deg, rgba(0, 10, 20, 1) 24.72%, rgba(1, 8, 64, 1) 39.88%, rgba(6, 41, 128, 1) 72.4%, rgba(89, 126, 255, 1) 100%)",
            }}
          >
            <div className="text-center">
              <img
                className="inline-block w-[196px] mb-2"
                src="/imgs/Transaction submitted.png"
                alt=""
              />
              <div className="text-xs text-white/50">
                Redirecting to My Transfers in 3s
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </MainLayout>
  );
}
