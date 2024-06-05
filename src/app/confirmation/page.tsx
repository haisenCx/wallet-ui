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
import {
  IInternalTransferData,
  TxTypeEnum,
} from "@/api/types/transactionRecord";
import { useRouter } from "next/navigation";
import { BigNumber, ethers } from "ethers";
import UniswapLogo from "../transfer/components/Icon/UniswapLogo";
import { Arrow } from "@/components/Arrow";
import IconArrow from "./components/IconArrow";
import { TransferInfo } from "./types";
import { ContactData } from "../transfer_function/components/Contact";
import { IResult } from "../demandchat/tyeps";
import { complexTransfer } from "@/utils/complexTransferUtils";
function Tab({
  name,
  address,
  userAvatar,
  amount,
  tokenName,
  coinValue,
  isSwap,
}: {
  name: string;
  address: string;
  userAvatar?: string;
  tokenName: string;
  amount: string;
  coinValue: string;
  isSwap?: boolean;
}) {
  return (
    <div className="flex-1 flex">
      <div className="flex flex-1">
        {isSwap ? (
          <div className="w-[40px] h-[40px] mr-4">
            <UniswapLogo></UniswapLogo>
          </div>
        ) : (
          <Avatar src="/imgs/icon.png" className="mr-4"></Avatar>
        )}
        <div>
          <p className=" font-bold">{name}</p>
          <p className="text-[#819DF580] text-sm">
            {isSwap ? address : formatAddress(address)}
          </p>
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
  const walletChains = useMemo(() => {
    let _chains = localStorage.getItem("wallet_chains");
    if (_chains) {
      return JSON.parse(_chains) as IChain[];
    }
    return [];
  }, []);
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
  const transferInfo:TransferInfo = JSON.parse(
    sessionStorage.getItem("transfer_Info") || "{}"
  );
  const isSwap = transferInfo?.ops?.[0]?.type === "swap";
  useEffect(() => {
    const fetchPrices = async () => {
      const transferInfo:TransferInfo = JSON.parse(
        sessionStorage.getItem("transfer_Info") || "{}"
      );
      const ops = transferInfo?.ops || [];

      const tokenNames = ops.map((op) => op.source_token || op.token) || [];
      const uniqueTokenNames = tokenNames.filter(
        (value, index, self) => self.indexOf(value) === index
      );
      
      const tokenPrices: { [key: string]: number } = {};
      for (const token of uniqueTokenNames) {
        try {
          const response = await fetch(
            `https://price-dev.web3idea.xyz/api/v1/coin-price?coinName=${token}`
          );
          const result = await response.json();
          if (result && result.result) {
            tokenPrices[token] = Number(result.result);
          }
        } catch (error) {
          console.error("Error fetching price:", error);
        }
      }

      // Update ops with USD values
      const updatedOps = ops.map((op) => {
        const tokenIcon = findTokenIcon(op.source_token||op.token) || '';
        const tokenName = op.source_token || op.token;
        const tokenPrice = tokenPrices[tokenName] || 0;
        const usdValue = (Number(op.swap_in || op.amount) * tokenPrice).toFixed(
          2
        );
        return {
          ...op,
          usdValue: `$ ${usdValue}`,
          tokenIcon
        };
      });

      // Update transferInfo
      const updatedTransferInfo = {
        ...transferInfo,
        ops: updatedOps,
      };
      sessionStorage.setItem(
        "transfer_Info",
        JSON.stringify(updatedTransferInfo)
      );
    };
    const findTokenIcon = (
      tokenName: string | undefined
    ): string | undefined => {
      for (const chain of walletChains) {
        const token = chain.tokens.find((t) => t.name === tokenName);
        if (token) return token.icon;
      }
      return "";
    };

    const transferInfo = JSON.parse(
      sessionStorage.getItem("transfer_Info") || "{}"
    );
    if (transferInfo) {
      fetchPrices();
    }
  }, []);
  async function handleConfirm() {
    if (isSwap) {
        confirmTx(transferInfo);
        return;
    }
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
      gasLimit: 1000000,
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
      throw error;
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
      return `${transferData.amount!} ${transferData.token?.name} + ${
        currentGasFee.needAmount
      } ${currentGasFee.token.name}`;
    }
    return "";
  }, [currentGasFee, transferData]);
const confirmTx = async (detail: TransferInfo) => {
    const tagetOp = detail.ops && detail.ops[0];
    if (
      detail.ops &&
      detail.ops.length == 1 &&
      detail.ops[0].type == "chain-internal-transfer"
    ) {
      const targetChain = chains.find(
        (chain) => chain.ID == tagetOp.target_chain_id
      );
      if (!targetChain) return "";
      const targetToken = targetChain.tokens.find(
        (token) => token.name == tagetOp.token
      );
      if (!targetToken) return "";

      let receiver = tagetOp.receiver;
      let name = "";
      const _cl = localStorage.getItem("contact_list")
      if (_cl && !receiver.startsWith("0x")) {
        const contactList = JSON.parse(_cl)
        const contact = contactList.find((item: ContactData) => item.name == receiver)
        if (contact) {
          receiver = contact.address;
          name = contact.name;
        }
      }

      sessionStorage.setItem("transfer_amount", tagetOp.amount); // 转账数量
      sessionStorage.setItem("transfer_address", tagetOp.receiver); // 转账地址
      sessionStorage.setItem("transfer_name", name); // 转账名称
      sessionStorage.setItem(
        "transfer_tokenId",
        targetToken.tokenId.toString()
      ); // 转账tokenId
      sessionStorage.setItem("transfer_chainId", targetChain.ID.toString()); // 转账chainId
      // 这里主要逻辑为跳转
      const routerQuery = {};
      setTimeout(() => {
        router.push("/confirmation", routerQuery);
      }, 100);
    } else {
      setLoading(true);
      const tran = await complexTransfer(detail.ops);
      setLoading(false);
      if (tran.error) {
      Toast(tran.error.message || "something wrong!");
      return
      }
      router.push("/dashboard");
    }
  };
  return (
    <MainLayout showMenu={false}>
      <Header title="Transfer" showBack></Header>
      <div className="p-6">
        <div className="flex flex-col justify-between">
          <div className="flex items-center justify-center border-b-1 border-gray-500/30 px-4 pb-4">
            <Person
              name={"You"}
              address={transferData.chainAddress || ""}
              value={isSwap ? transferInfo?.ops?.[0].swap_in : null}
              token={isSwap ? transferInfo?.ops?.[0].source_token: null}
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
            )}
            <Person
              name={transferData?.toName || "New Friend"}
              address={transferData.address || ""}
              value={isSwap ? transferInfo?.ops?.[1].amount : null}
              token={isSwap ? transferInfo?.ops?.[1].token: null}
            />
          </div>

          <div className="my-8">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center mb-4">
                <div className="w-[50px] text-center mr-2">From</div>
                <Tab
                  name={"You"}
                  address={transferData.chainAddress || ""}
                  amount={
                   isSwap ?Number(transferInfo?.ops?.[0].swap_in).toFixed(4):
                    transferData?.amount ||""}
                  tokenName={
                    isSwap ? transferInfo?.ops?.[0].source_token:transferData?.token?.name || ""
                  }
                  coinValue={isSwap ? transferInfo?.ops?.[0].usdValue || "" :""}
                />
              </div>
              {isSwap ? (
                <div className="">
                  <IconArrow src={transferInfo?.ops?.[0].tokenIcon}></IconArrow>
                  <div className="flex justify-between items-center mb-4">
                    <div className="w-[50px] text-center mr-2">Swap</div>
                    <Tab
                      name={transferInfo?.ops?.[0].dex || ""}
                      address={"Swap and Transfer"}
                      amount={
                        Number(transferInfo?.ops?.[0].swap_in).toFixed(4) ||
                        transferData?.amount ||
                        ""
                      }
                      tokenName={
                        transferInfo?.ops?.[0].source_token ||
                        transferData?.token?.name ||
                        ""
                      }
                      coinValue={transferInfo?.ops?.[0].usdValue || ""}
                      isSwap={true}
                    />
                  </div>
                </div>
              ) : null}

              {/* <GapLine /> */}
              <div className="">{isSwap ? <IconArrow src={transferInfo?.ops?.[1].tokenIcon}></IconArrow> : null}</div>

              <div className="flex justify-between items-center">
                <div className="w-[50px] text-center mr-2">To</div>
                <Tab
                  name={transferData?.toName || "New Friend"}
                  address={transferData.address || ""}
                  tokenName={transferData?.token?.name || ""}
                  amount={transferData?.amount || ""}
                  coinValue={isSwap ? transferInfo?.ops?.[1].usdValue || "" :""}
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
                    ? `${formatValue(transferData?.amount!)} ${
                        transferData.token?.name
                      }`
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
                    ? `${formatValue(currentGasFee?.needAmount)} ${
                        currentGasFee?.token?.name
                      }`
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
