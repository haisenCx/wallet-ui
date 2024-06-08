import Toast from "@/utils/toast";
import { Image, Textarea } from "@nextui-org/react";

interface IDefaultMessageProps {
  commandCb: (command: string) => void;
}

const defaultCommands = [
  "I want to transfer 0.1 SWT to 0x5134F00C95b8e794db38E1eE39397d8086cee7Ed on Fuji",
  "I want to stake my balance",
  "I want to trade SWT with 5% return",
  // 'I want to transfer 1USDC to 0x567a5c7c6812bf9a8fbb048f310f3707637e454e on target chain mumbai',
  // 'I want to transfer 0.01SWT to 0x567a5c7c6812bf9a8fbb048f310f3707637e454e on target chain mumbai',
  // 'I want to transfer 1SWT to 0x567a5c7c6812bf9a8fbb048f310f3707637e454e on target chain fuji',
];

const DefaultMessage: React.FC<IDefaultMessageProps> = ({ commandCb }) => {
  const handleCommandClick = (
    e: React.MouseEvent<HTMLElement>,
    command: string,
    index: number
  ) => {
    e.preventDefault();
    if (index == 0) {
      commandCb(command);
    } else {
      Toast("Coming soon");
    }
  };
  return (
    <div className="relative">
      <div className="absolute bottom-0 left-[15px]  size-[22px]">
        <Image className="" src={`/imgs/msg-prefix.png`} alt="msg prefix" />
      </div>
      <div className="flex flex-1  rounded-lg flex-col px-5 py-4 m-6 bg-[#0E1437]">
        <p className="leading-6 text-[14px] text-white">
          Hi, how can I help you today?
        </p>
        <p className="leading-6 text-[14px] text-white">
          Feel free to try the following command:
        </p>

        {defaultCommands.map((command, index) => (
          <p
            key={command}
            className="leading-6 text-[14px] text-[#819DF5] break-all"
            onClick={(e) => handleCommandClick(e, command, index)}
          >
            {command}
          </p>
        ))}
      </div>
    </div>
  );
};

export default DefaultMessage;
