import { ReactNode, FC } from "react";
import { useRouter } from "next/navigation";

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  leftBtn?: ReactNode;
  rightBtn?: ReactNode;
}
const Header: FC<HeaderProps> = (props) => {
  const { title, showBack, rightBtn = null } = props;
  const router = useRouter();
  function handleBack() {
    router.back();
  }
  return (
    <div className="flex items-center p-6 mt-6 relative">
      <div className="inline-flex w-1/3 justify-start">
        {showBack ? (
          <img
            onClick={handleBack}
            src="/imgs/back.png"
            alt=""
            className="cursor-pointer h-3 w-2"
          />
        ) : null}
      </div>
      <div className="inline-flex w-1/3 justify-center text-white font-bold text-center">{title}</div>
      <div className="inline-flex w-1/3 justify-end">
        {rightBtn}
      </div>
    </div>
  );
};
export default Header;
