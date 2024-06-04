import DropArrow from "@/components/Icons/DropArrow";
import EthSVG from "@/components/Icons/EthSVG";
import { IToken, ITokenBalance, useChains } from "@/store/useChains";
import {
  Avatar,
  Button,
  Input,
  Listbox,
  ListboxItem,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/react";
import { FC, useContext, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { classNames } from "@/utils/classNames";
import { useRouter } from "next/navigation";
import { formatValue } from "@/utils/format";
import { useAddress } from "@/store/useAddress";
import { chatApi, chatInitApi, vertifyWalletBalanceApi } from "@/api/demand";
import { BalanceInfo, ChainBalances, CtxBalanceReq } from "@/api/types/demand";
import { LoadingContext } from "@/app/providers";
import { EMessage, IResult } from "@/app/demandchat/tyeps";
export function TokenItem({
  tokenAvatarUrl,
  tokenName,
  tokenLabel,
  amount,
  price,
  isChosen,
  pickToken,
  clickEvent,
}: {
  tokenAvatarUrl: string;
  tokenName: string;
  tokenLabel: string;
  amount: string;
  price: string;
  isChosen: boolean;
  pickToken: (token) => void;
  clickEvent: () => void;
}) {
  return (
    <div
      className="flex justify-between items-center hover:bg-slate-500/30 cursor-pointer p-2 rounded-lg"
      style={{ color: isChosen ? "#4FAAEB" : "white" }}
      onClick={() => {
        pickToken(tokenName);
        clickEvent();
      }}
    >
      <div className="flex gap-2 items-center">
        <Avatar radius="sm" src={tokenAvatarUrl}></Avatar>
        <div className="">
          <p>{tokenName}</p>
          <p>{tokenLabel}</p>
        </div>
      </div>

      <div className=" opacity-0">gap</div>
      <div>
        <p>{amount}</p>
        <p>${price}</p>
      </div>
    </div>
  );
}

interface ITokenProps {
  tokens?: IToken[];
  balances?: ITokenBalance[];
  toAddress?: string;
}

const CIDNAME = "X-Smartwallet-Cid";

const Token: FC<ITokenProps> = (props) => {
  const { tokens = [], balances = [], toAddress = "" } = props;
  const { currentAddress } = useAddress((state) => state);
  const [assetBalance, setAssetBalance] = useState<ChainBalances>({}); // 资产余额
  const { currentChain,chains, balances:balancesOfChains } = useChains((state) => state);
  const router = useRouter();
  const calcTokens = useMemo(() => {
    const arr = [];
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const balance = balances.find((b) => b.tokenId === token.tokenId);
      arr.push({
        ...token,
        amount: balance?.amount || "0",
        usdValue: balance?.usdValue || "0",
      });
    }
    return arr;
  }, [tokens, balances]);
  const [chatHeader, setChatHeader] = useState<{ [CIDNAME]: string }>({
    [CIDNAME]: "",
  });
  const [currentToken, setCurrentToken] = useState<
    IToken & { amount: string; usdValue: string }
  >();
  const [amount, setAmount] = useState("");
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { setLoading } = useContext(LoadingContext);

  const usdBan = currentToken
    ? Number(currentToken?.amount) != 0
      ? (+currentToken?.usdValue / +currentToken?.amount) * +amount
      : 0
    : 0;
      const cacheChainMap = new Map();
  const getTokenName = (chainName: string, tokenId: number) => {
    const cacheTokenName = cacheChainMap.get(`${chainName}-${tokenId}`);
    if (cacheTokenName) return cacheTokenName;
    // 做个缓存
    const targetChain = chains.find((chain) => chain.name == chainName);
    if (!targetChain) return "";
    const targetToken = targetChain.tokens.find(
      (token) => token.tokenId == tokenId
    );
    if (!targetToken) return "";
    cacheChainMap.set(`${chainName}-${tokenId}`, targetToken.name);
    return targetToken.name;
  };
 const convert2balances = () => {
    const _balances: ChainBalances = {};
    // 找当前链的
    balancesOfChains.forEach((chain) => {
      const chainName = chain.chainName;
      const _tokenList: BalanceInfo[] = [];
      chain.tokenBalance.forEach((token) => {
        // 获取每个chain的balance
        // 根据 chainName 和 tokenid 找到 tokenname
        const tokenName = getTokenName(chainName, token.tokenId);
        _tokenList.push({
          balance: Number(token.amount),
          symbol: tokenName,
        });
        _balances[chainName] = _tokenList;
        // 将balance转换成 ChainBalance 类型
      });
    });
    setAssetBalance(_balances);
    console.log(_balances, "_balances");
    return _balances;
  };
  // 页面默认选择
  useEffect(() => {
    const find = calcTokens.find((item) => Number(item?.amount) > 0);
    if (find) {
      setCurrentToken(find);
    }
  }, [calcTokens]);

  useEffect(() => {
    initChatCid();
      setTimeout(() => {
      convert2balances();
    }, 100);
  }, []);
  const initChatCid = async () => {
    const { status, body } = await chatInitApi();
    debugger;
    console.log(body!.cid, "body!.cid");
    setChatHeader({
      [CIDNAME]: body!.cid,
    });
  };
  // 获取evm地址
  const vertifyWalletBalance = async () => {
    if (!currentAddress) return false;
    const param: CtxBalanceReq = {
      address: currentAddress || "",
      // 目前固定写死 mumbai
      baseChain: currentChain?.name as string,
      balances: assetBalance,
    };
    const { status, body } = await vertifyWalletBalanceApi(param, chatHeader);
    if (status && status === 200) {
      return true;
    } else {
      return false;
    }
  };
  function handleTransferAll() {
    if (currentToken) {
      setAmount(currentToken.amount);
    }
  }
  const handleNext = async () => {
    const res = await handleRequest(
      `I want to transfer ${amount} ${
        currentToken?.name
      } to ${toAddress} on ${
        currentChain?.name.toLowerCase()
      }`
    // `I want to transfer 0.005 SWT to 0x539a44bfd3915718fc450c34366d2fbfef13672e on sepolia`

    );
    if (currentToken && currentChain && res.response.ops) {
      sessionStorage.setItem("transfer_tokenId", currentToken.tokenId + "");
      sessionStorage.setItem("transfer_amount", amount);
      sessionStorage.setItem("transfer_tokenName", currentToken.name);
      if (res.response.ops.length>1) {
        debugger;
      sessionStorage.setItem("transfer_Info", JSON.stringify(res.response));
      }

      router.push("/confirmation");
    }
  };
  const handleRequest = async (inputDemandText: string): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      try {
        setLoading(true);
        const res = await vertifyWalletBalance();
        if (!res) {
          setLoading(false);
          return reject("Wallet balance verification failed");
        }

        const { body } = await chatApi(inputDemandText, chatHeader);
        setLoading(false);
        const { category, detail } = body as IResult;
        const { ops, reply } = detail;

        console.log(ops, "ops");

        if (!ops || !ops.length) {
          const newMsg = {
            content: reply,
            msgType: EMessage.MSG,
            response: detail,
          };
          return resolve(newMsg);
        } else {
          const targetOp = ops[0];
          let msgType = category || targetOp.type;
          switch (category) {
            case EMessage.SWAP:
              msgType = EMessage.SWAP;
              break;
            case EMessage.TRANSFER:
              msgType = EMessage.TRANSFER;
              break;
            case EMessage.CROSSCHAIN:
              msgType = EMessage.CROSSCHAIN;
              break;
            default:
              // 处理未知类型
              break;
          }

          const newMsg = {
            content: reply,
            msgType: msgType || EMessage.MSG,
            response: detail,
          };
          return resolve(newMsg);
        }
      } catch (error) {
        setLoading(false);
        return reject(error);
      }
    });
  };

  return (
    <>
      <div className="my-4 font-bold">Token</div>
      <Input
        variant="bordered"
        readOnly
        value={currentToken?.name || ""}
        onClick={() => onOpen()}
        startContent={
          currentToken ? (
            <Image
              src={currentToken?.icon}
              alt="logo"
              width={36}
              height={36}
              className="mr-4"
            />
          ) : null
        }
        endContent={<DropArrow />}
        className="mb-4"
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
                Token
              </ModalHeader>
              <ModalBody className="px-4 pb-4">
                <Listbox
                  items={calcTokens}
                  aria-label="Dynamic Actions"
                  onAction={(key) => {
                    const find = calcTokens.find((item) => item.tokenId == key);
                    if (parseFloat(find?.amount!) == 0) {
                      return;
                    }
                    setCurrentToken(find!);
                    onClose();
                  }}
                >
                  {(item) => (
                    <ListboxItem
                      // 不可点击
                      isDisabled={parseFloat(item.amount) == 0}
                      key={item.tokenId}
                      textValue={item.name}
                      className={classNames(
                        "mb-4",
                        currentToken?.tokenId === item.tokenId
                          ? "text-[#4FAAEB]"
                          : ""
                      )}
                    >
                      <div className="flex items-center">
                        <Image
                          src={item.icon}
                          alt="logo"
                          width={40}
                          height={40}
                          className="mr-4"
                        />
                        <div className="flex-1 font-bold text-base">
                          {item.name}
                        </div>
                        <div className="text-right">
                          <p className="font-bold">
                            {formatValue(item.amount)}
                          </p>
                          <p>${formatValue(item.usdValue)}</p>
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
      <Input
        label="Amount"
        variant="bordered"
        value={amount}
        onChange={(e) => {
          setAmount(e.target.value);
        }}
        className="mb-4"
      />

      <div className="flex items-center mb-4">
        <div className="flex-1 flex">
          <p className="text-sm">{formatValue(usdBan + "")} USD</p>
          <p className="text-sm mx-4">
            <span className="font-bold">Balance:</span>
            <span>{formatValue(currentToken?.amount || "0")}</span>
            <span>{currentToken?.name}</span>
          </p>
        </div>
        {currentToken ? (
          <Button
            size="sm"
            className=" bg-mainPurpleBlue/30 text-mainPurpleBlue"
            onClick={handleTransferAll}
          >
            Transfer all
          </Button>
        ) : null}
      </div>
      <div className="absolute bottom-8 left-8 right-8">
        <Button
          onClick={handleNext}
          fullWidth
          size="lg"
          className="bg-[#819DF5] rounded-3xl"
        >
          Next
        </Button>
      </div>
    </>
  );
};
export default Token;
