import DropArrow from "@/components/Icons/DropArrow";
import EthSVG from "@/components/Icons/EthSVG";
import { IToken, ITokenBalance } from "@/store/useChains";
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
import { FC, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { classNames } from "@/utils/classNames";
import { useRouter } from "next/navigation";
import { formatValue } from "@/utils/format";

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
}
const Token: FC<ITokenProps> = (props) => {
  const { tokens = [], balances = [] } = props;
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

  const [currentToken, setCurrentToken] = useState<
    IToken & { amount: string; usdValue: string }
  >();
  const [amount, setAmount] = useState("");

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const usdBan = currentToken
    ? Number(currentToken?.amount) != 0
      ? (+currentToken?.usdValue / +currentToken?.amount) * +amount
      : 0
    : 0;
  // 页面默认选择
  useEffect(()=>{
    const find = calcTokens.find(item => (Number(item?.amount) > 0));
    if (find) {
      setCurrentToken(find);
    }
    },[calcTokens])

  function handleTransferAll() {
    if (currentToken) {
      setAmount(currentToken.amount);
    }
  }
  function handleNext() {
    if (currentToken) {
      sessionStorage.setItem("transfer_tokenId", currentToken.tokenId + "");
      sessionStorage.setItem("transfer_amount", amount);
      router.push("/confirmation");
    }
  }
  return (
    <>
      <div className="my-4 font-bold">Token</div>
      <Input
        variant="bordered"
        readOnly
        value={currentToken?.name || ""}
        onClick={() => onOpen()}
        startContent={
          currentToken ?
            <Image
              src={currentToken?.icon}
              alt="logo"
              width={36}
              height={36}
              className="mr-4"
            /> : null
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
