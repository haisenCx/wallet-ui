import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { classNames } from "@/utils/classNames";
import { Toaster } from "react-hot-toast";
const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Smarter-Wallet",
  description: "Get your Smarter-Wallet",
};

export default function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props;
  return (
    <html lang="en" className="dark">
      <body
        className={classNames(
          inter.className,
          "sm:flex sm:items-center sm:justify-center"
        )}
      >
        <div
          id={"wallet-ui"}
          className={"layout h-full rounded-lg relative"}
        >
          <Providers>{children}</Providers>
          <Toaster />
        </div>
      </body>
    </html>
  );
}
