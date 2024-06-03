"use client";
import Sent from "./components/Sent";
import Contact, { ConfirmFunc, ContactData } from "./components/Contact";
import { Button } from "@nextui-org/react";
import { useState } from "react";
import { IChain } from "@/store/useChains";
import { useRouter } from "next/navigation";
import Toast from "@/utils/toast";

export default function Transfer_Function() {
  const [address, setAddress] = useState("");
  const [chain, setChain] = useState<IChain>();
  const router = useRouter();

  function handleNext() {
    if (!/^(0x)?[0-9a-fA-F]{40}$/.test(address)) {
      Toast("The address format is incorrect")
      return
    }
    debugger;
    if (address && chain) {
      const _cl = localStorage.getItem("contact_list")
      const contactList = _cl ? JSON.parse(_cl) : [];
      const contact = contactList.find(
        (item: ContactData) => item.address == address && item.chain.id == chain.ID.toString()
      )
      sessionStorage.setItem("transfer_name", contact?.name || "")
      sessionStorage.setItem("transfer_address", address);
      sessionStorage.setItem("transfer_chainId", chain.ID.toString());
      sessionStorage.setItem("transfer_chainName", chain.name);
      router.push("/chooseToken");
    }
  }
  const confirmContact: ConfirmFunc = ({
    addr,
    chain_id,
    name
  }) => {
    sessionStorage.setItem("transfer_address", addr);
    sessionStorage.setItem("transfer_chainId", chain_id.toString());
    sessionStorage.setItem("transfer_name", name);
    router.push("/chooseToken");
  }
  return (
    <div className="w-full">
      <Sent
        address={address}
        chain={chain}
        setAddress={setAddress}
        setChain={setChain}
      />
      <div className="h-6"></div>
      <Contact confirmContact={confirmContact} />
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
    </div>
  );
}
