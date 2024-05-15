import DropArrow from "@/components/Icons/DropArrow";
import {
  Avatar,
  Modal,
  Button,
  Input,
  ModalContent,
  ModalHeader,
  ModalBody,
  Listbox,
  ListboxItem,
  useDisclosure
} from "@nextui-org/react";
import { useState } from "react";
import BlockchainPopUP from "./BlockchainPopUP";
import AddIcon from "@/app/transfer/components/Icon/Add"
import { IChain } from "@/store/useChains";
import Toast from "@/utils/toast";

export type ConfirmFunc = (data: {
  addr: string
  chain_id: string
  name: string
}) => void

interface Props {
  confirmContact: ConfirmFunc
}

export interface ContactData {
  name: string
  address: string
  chain: {
    name: string
    icon: string
    id: string
  }
}

function formattedAddr(address: string) {
  return address.substring(0, 7) + "..." + address.substring(38);
}

function ContactItem({
  contactData,
  clickEvent,
}: {
  contactData: ContactData
  clickEvent: ConfirmFunc;
}) {
  return (
    <div
      className="w-full flex items-center transition-all rounded-lg"
      onClick={
        () =>
          clickEvent({
            addr: contactData.address,
            chain_id: contactData.chain.id,
            name: contactData.name
          })
      }
    >
      <Avatar
        classNames={{
          base: "w-8 h-8"
        }}
        src="/imgs/icon.png"
      />
      <p className="truncate mx-2 w-[calc(40%-3rem)]">{contactData.name}</p>
      <p className="text-purpleBlue/50 w-[calc(60%-2.5rem)]">{formattedAddr(contactData.address)}</p>
      <Avatar
        classNames={{
          base: "w-6 h-6 ml-4",
        }}
        src={contactData.chain.icon}
      />
    </div>
  );
}

function ContactBox({
  clickEvent,
  listData
}: {
  clickEvent: ConfirmFunc
  listData: ContactData[]
}) {

  return (
    <div className="max-h-[420px] overflow-y-auto">
      <Listbox
        classNames={{
          base: "px-6",
          list: "max-h-[300px] pr-2 overflow-scroll",
        }}
        itemClasses={{
          base: "px-0 transition-all active:bg-[#819DF599] flex items-center justify-between py-4 hover:bg-[#819DF54D] cursor-pointer px-4 rounded-2xl",
          wrapper: "hover-none"
        }}
        label="contact_list"
        items={listData}
        variant="flat"
        emptyContent="No Contact."
      >
        {(item) => (
          <ListboxItem key={item.address + item.chain.id} textValue={item.name}>
            <ContactItem
              contactData={item}
              clickEvent={clickEvent}
            />
          </ListboxItem>
        )}
      </Listbox>
    </div>
  );
}

export default function Contact({ confirmContact }: Props) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const {
    isOpen: isBlockChainPopup,
    onOpen: showBlockChainPopup,
    onOpenChange: onChainPopupChange
  } = useDisclosure();
  const [nameValue, updateNameValue] = useState<string>("");
  const [addressValue, updateAddressValue] = useState<string>("");
  const [blockchainValue, pickBlockchain] = useState<string>("");
  const [chainInfo, setChainInfo] = useState<ContactData["chain"]>()

  const contactCacheList = localStorage.getItem("contact_list")
  const [contactList, setContactList] = useState<ContactData[]>(contactCacheList ? JSON.parse(contactCacheList) : [])

  function setChain(chain: IChain) {
    if (chain) {
      pickBlockchain(chain.name)
      setChainInfo({
        name: chain.name,
        icon: chain.icon,
        id: chain.ID.toString()
      })
    }
  }

  function handleAdd() {
    if (!nameValue) {
      Toast("please input name")
      return
    }
    if (!addressValue) {
      Toast("please input address")
      return
    }
    if (!/^(0x)?[0-9a-fA-F]{40}$/.test(addressValue)) {
      Toast("The address format is incorrect")
      return
    }
    if (contactList.find(item => item.address == addressValue && item.chain.name == blockchainValue)) {
      Toast("contact already exist")
      return
    }
    if (!chainInfo) {
      Toast("please choose chain")
      return
    }

    const contactData: ContactData = {
      address: addressValue.trim(),
      name: nameValue.trim(),
      chain: {
        name: chainInfo.name,
        icon: chainInfo.icon,
        id: chainInfo.id
      }
    }
    const newList = [...contactList, contactData]
    setContactList(newList)
    localStorage.setItem("contact_list", JSON.stringify(newList))

    onOpenChange()
    updateNameValue("")
    updateAddressValue("")
  }

  return (
    <div className="w-full">
      <div className="flex px-6 justify-between my-4">
        <h1 className="font-bold">Or Choose Contact</h1>
        <AddIcon
          onClick={() => {
            onOpen();
          }}
        />

      </div>
      <ContactBox clickEvent={confirmContact} listData={contactList} />
      <Modal
        isOpen={isOpen}
        placement="bottom"
        className="text-white"
        onOpenChange={onOpenChange}
      >

        <ModalContent className="px-4 pb-4">{
          () =>
          (<>
            <ModalHeader className="flex justify-center items-center text-base">
              Add Contact
            </ModalHeader>
            <ModalBody className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <p>Name</p>
                <Input
                  placeholder="Input the name"
                  variant="bordered"
                  maxLength={30}
                  value={nameValue}
                  onChange={(e) => updateNameValue(e.target.value)}
                  isClearable
                  onClear={() => updateNameValue("")}
                />
              </div>
              <div className="flex flex-col gap-2">
                <p>Address</p>
                <Input
                  placeholder="Input the address"
                  variant="bordered"
                  width="sm"
                  value={addressValue}
                  onChange={(e) => updateAddressValue(e.target.value)}
                  isClearable
                  onClear={() => updateAddressValue("")}
                />
              </div>
              <div className="flex flex-col gap-2">
                <p>Blockchain</p>
                <Input
                  placeholder="Pick the Blockchain"
                  variant="bordered"
                  endContent={<DropArrow />}
                  value={blockchainValue}
                  onClick={() => showBlockChainPopup()}
                />
                <BlockchainPopUP
                  isOpen={isBlockChainPopup}
                  setChain={setChain}
                  onOpenChange={onChainPopupChange}
                />
              </div>
              <div className="flex justify-center gap-4">
                <Button
                  className="w-36 bg-[#819DF54D]"
                  size="lg"
                  onClick={() => {
                    onOpenChange();
                    updateNameValue("");
                    updateAddressValue("");
                  }}
                >
                  Cancel
                </Button>
                <Button className="w-36 bg-[#456ADE]" onClick={handleAdd} size="lg">
                  Add
                </Button>
              </div>
            </ModalBody>

          </>)
        }
        </ModalContent>
      </Modal>
    </div>
  );
}
