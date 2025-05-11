import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../assets/styles/globals.css";
import { ThemeProvider } from "@/ContextApi/ThemeContext";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { headers } from "next/headers";
import { cookieToInitialState } from "wagmi";
import { config } from "@/config";
import Web3ModalProvider from "@/context";
import { ToastContainer } from "react-toastify";
import 'react-tooltip/dist/react-tooltip.css'
import "react-toastify/dist/ReactToastify.css";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "Goblin Cash",
  description: "Goblin Cash",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieHeader = await headers();
  const initialState = cookieToInitialState(config, cookieHeader.get("cookie"));

  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <Web3ModalProvider initialState={initialState}>
            <Header />
            {children}
            <Footer />
          </Web3ModalProvider>
          <ToastContainer />
        </ThemeProvider>
      </body>
    </html>
  );
}
