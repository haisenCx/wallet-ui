import { formatAddress } from "@/utils/format";

export default function Person({
  name,
  address,
  value,
  token
}: {
  name: string;
  address: string;
  value?:string |null;
  token: string | undefined|null;
}) {
  return (
    <div className="flex flex-col items-center">
      <p className="font-bold text-base p-1 font-mono text-center">{name}</p>
      {value?<p className="font-bold text-base p-1 font-mono text-[#4FAAEB] whitespace-nowrap">{`${Number(value).toFixed(4)} ${token || ''}`}</p>:null}
      <p className="bg-[#819DF54D] text-[#819DF5] rounded-full text-xs px-2 py-1">
        {formatAddress(address)}
      </p>
    </div>
  );
}
