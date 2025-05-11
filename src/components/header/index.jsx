"use client";
import React, { useState } from "react";
import Switch from "react-switch";
// css
import Image from "next/image";

// image
import logo from "@/assets/Images/logo.png";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { useTheme } from "../../ContextApi/ThemeContext";
import { Tooltip } from "react-tooltip";
import { shortenPubkey } from "@/utils/math.utils";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useAccount } from "wagmi";

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const pathname = router.pathname;
  const [openDropdown, setOpenDropdown] = useState(null);
  const [menu, setMenu] = useState("");

  const { address } = useAccount();
  const { open } = useWeb3Modal();

  const connect = async () => {
    await open();
  };

  const handleDropdownClick = (index, isOpen) => {
    setOpenDropdown(isOpen ? index : null);
  };

  const isChecked = theme === "dark";

  return (
    <>
      <header
        className={`py-2 sticky-top siteHeader shadow-sm`}
        style={{ zIndex: 999, background: "var(--backgroundColor)" }}
      >
        <div className="container px-3 py-2">
          <nav className="flex items-center justify-between">
            <Image
              src={logo}
              alt="logo"
              className="max-w-full h-auto w-auto object-contain"
              height={10000}
              width={10000}
            />
            <MobileMenu
              className={`cstmMenu flex items-center justify-end w-full ps-lg-4 gap-2`}
            >
              <div className="right flex items-center gap-3">
                <ul className="list-none pl-0 mb-0 flex items-center justify-end gap-3">
                  <li className="px-2">
                    <Link href="/swap" className="">
                      Swap
                    </Link>
                  </li>
                  <li className="px-2">
                    <Link href="/liquidity" className="">
                      Liquidity
                    </Link>
                  </li>
                  <li className="px-2">
                    <Link href="/locks" className="">
                      Lock
                    </Link>
                  </li>
                  <li className="px-2">
                    <Link href="/vote" className="">
                      Vote
                    </Link>
                  </li>
                  <li className="px-2">
                    <Link href="/incentivize" className="">
                    Incentivize
                    </Link>
                  </li>
                  {/* <li className="px-2">
                    <Link href="/farm" className="">
                      Farm
                    </Link>
                  </li> */}
                  <li className="px-1">
                    <button
                      className="btn flex items-center justify-center commonBtn rounded text-xs font-medium "
                      onClick={connect}
                    >
                      {address ? (
                        <>
                          <span className="icn mr-2">{walletIcn}</span>{" "}
                          {shortenPubkey(address)}
                        </>
                      ) : (
                        "Connect"
                      )}
                    </button>
                  </li>
                </ul>
              </div>
            </MobileMenu>
          </nav>
        </div>
      </header>
    </>
  );
};

const MobileMenu = styled.div`
  a {
    transition: 0.4s;
    &:hover {
      color: #00ff4e;
    }
  }
`;

export default Header;

const addIcn = (
  <svg
    width="31"
    height="29"
    viewBox="0 0 31 29"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="31" height="29" rx="5" fill="#141414" />
    <path
      d="M10 15H22"
      stroke="#fff"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 21V9"
      stroke="#fff"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const star = (
  <svg
    width="26"
    height="26"
    viewBox="0 0 26 26"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M25.6816 13.0024C25.6816 20.0055 20.0031 25.6791 13 25.6791C5.99685 25.6791 0.318359 20.0055 0.318359 13.0024C0.318359 5.99929 5.99685 0.320801 13 0.320801C20.0031 0.320801 25.6816 5.99929 25.6816 13.0024Z"
      fill="#F9B938"
    />
    <path
      d="M25.6805 13.0007C25.6805 20.0033 20.0046 25.6793 13.0019 25.6793C9.21799 25.6793 5.82149 24.0243 3.50098 21.3938C5.73484 23.3633 8.66631 24.5532 11.8759 24.5532C18.8785 24.5532 24.5544 18.8772 24.5544 11.8746C24.5544 8.66507 23.36 5.73366 21.3814 3.49512C24.0165 5.80656 25.6805 9.20756 25.6805 13.0007Z"
      fill="#E5A320"
    />
    <g opacity="0.3">
      <path
        d="M3.0284 8.61404C2.85966 8.52856 2.79244 8.32287 2.87792 8.15458C4.02835 5.88442 5.92141 4.02075 8.20848 2.90727C8.37855 2.82357 8.58335 2.89569 8.66527 3.06487C8.74808 3.2345 8.67774 3.4393 8.50767 3.52167C6.35416 4.57059 4.57152 6.32563 3.48786 8.46355C3.40312 8.63116 3.19805 8.69962 3.0284 8.61404Z"
        fill="white"
      />
    </g>
    <g opacity="0.3">
      <path
        d="M10.3658 2.45773C10.3221 2.27385 10.4361 2.08954 10.6195 2.04635C11.2134 1.90611 11.8252 1.81172 12.4378 1.76586C12.6257 1.75919 12.7904 1.8932 12.8042 2.08152C12.818 2.26985 12.6769 2.43369 12.4885 2.44793C11.9115 2.49112 11.3359 2.57972 10.7771 2.7115C10.5892 2.75536 10.4082 2.63839 10.3658 2.45773Z"
        fill="white"
      />
    </g>
    <path
      d="M22.3674 13.0034C22.3674 14.5442 21.9949 15.9963 21.3302 17.279C19.7766 20.2973 16.627 22.3674 12.9992 22.3674C9.37545 22.3674 6.22168 20.2973 4.66799 17.279C4.00344 15.9963 3.63086 14.5442 3.63086 13.0034C3.63086 7.83453 7.83453 3.63086 12.9992 3.63086C18.168 3.63086 22.3674 7.83453 22.3674 13.0034Z"
      fill="#F7F363"
    />
    <path
      d="M20.1237 6.92855C18.4897 5.52736 16.3731 4.68494 14.0533 4.68494C8.88862 4.68494 4.68494 8.88861 4.68494 14.0574C4.68494 15.5983 5.05753 17.0503 5.72213 18.333C6.04805 18.9723 6.446 19.5649 6.90742 20.1068C5.98883 19.3194 5.22682 18.3584 4.66799 17.279C4.00344 15.9963 3.63086 14.5442 3.63086 13.0034C3.63086 7.83453 7.83453 3.63086 12.9992 3.63086C15.8524 3.63086 18.4093 4.91351 20.1237 6.92855Z"
      fill="#EDD318"
    />
    <path
      d="M14.0705 8.41736L15.1092 10.5218L17.4316 10.8593C18.4114 11.0017 18.8026 12.2058 18.0936 12.8969L16.4131 14.535L16.8098 16.848C16.9772 17.8239 15.9529 18.568 15.0766 18.1073L12.9993 17.0152L10.9221 18.1073C10.0457 18.568 9.02145 17.8239 9.18882 16.848L9.58554 14.535L7.90502 12.8969C7.19602 12.2058 7.58726 11.0017 8.56707 10.8593L10.8895 10.5218L11.9281 8.41736C12.3663 7.5295 13.6323 7.5295 14.0705 8.41736Z"
      fill="#F9B938"
    />
    <g opacity="0.4">
      <path
        d="M13.262 9.76341C13.2743 9.92977 13.1449 10.0776 12.9786 10.09C12.9293 10.0961 12.8677 10.1085 12.8123 10.1577C12.7814 10.1824 12.763 10.2131 12.7445 10.244L12.1222 11.507C11.9928 11.7719 11.7402 11.9567 11.4445 11.9998L10.0521 12.2031C9.94125 12.2154 9.85499 12.2894 9.82419 12.3941C9.78723 12.4988 9.81802 12.6037 9.89195 12.6837C10.0691 12.8564 10.9462 13.7119 10.89 13.6572C11.0132 13.7742 11.0132 13.9714 10.8962 14.0946C10.7802 14.2105 10.5938 14.2222 10.4588 14.1007L9.50998 13.1643C9.49768 13.1581 9.47918 13.1458 9.46685 13.1273C9.21427 12.887 9.128 12.5297 9.2389 12.2031C9.34366 11.8766 9.62087 11.6364 9.96588 11.587L11.3521 11.3899C11.4445 11.3776 11.5246 11.316 11.5677 11.2297L12.19 9.97294C12.2331 9.88043 12.2947 9.80658 12.3625 9.73874C12.3748 9.72032 12.3872 9.70799 12.4056 9.68948C12.5535 9.5663 12.7322 9.49237 12.9354 9.48003C13.0956 9.46153 13.2497 9.59089 13.262 9.76341Z"
        fill="white"
      />
    </g>
    <path
      d="M18.0923 12.8996L16.4104 14.5322C16.4513 14.7691 16.2621 13.6741 16.8109 16.8487C16.9764 17.8232 15.9535 18.5651 15.0786 18.105C13.9462 17.5095 12.9401 16.9849 12.9973 17.0151L10.921 18.1056C10.0462 18.5676 9.02346 17.8222 9.18982 16.8487L9.24524 16.5098C9.47936 17.1444 10.2433 17.5018 10.921 17.1506L12.6699 16.2268C12.8706 16.1208 13.1139 16.1371 13.2986 16.269L14.3029 16.9857C14.8465 17.3736 15.6518 17.035 15.677 16.3677C15.6785 16.3273 15.6767 16.2901 15.6711 16.2573L15.3297 14.2569C15.2966 14.0628 15.3608 13.8648 15.5016 13.7271L16.9526 12.3081C17.39 11.883 17.4085 11.2608 17.1312 10.8171L17.4331 10.8603C18.4127 11.002 18.8008 12.2033 18.0923 12.8996Z"
      fill="#E5A320"
    />
  </svg>
);

const darkthemeIcn = (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M1.35356 8.27997C1.59356 11.7133 4.50689 14.5066 7.99356 14.66C10.4536 14.7666 12.6536 13.62 13.9736 11.8133C14.5202 11.0733 14.2269 10.58 13.3136 10.7466C12.8669 10.8266 12.4069 10.86 11.9269 10.84C8.66689 10.7066 6.00022 7.97997 5.98689 4.75997C5.98022 3.89331 6.16022 3.07331 6.48689 2.32664C6.84689 1.49997 6.41356 1.10664 5.58022 1.45997C2.94022 2.57331 1.13356 5.23331 1.35356 8.27997Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const lightThemeIcn = (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7.99984 12.3334C10.3931 12.3334 12.3332 10.3933 12.3332 8.00008C12.3332 5.60685 10.3931 3.66675 7.99984 3.66675C5.6066 3.66675 3.6665 5.60685 3.6665 8.00008C3.6665 10.3933 5.6066 12.3334 7.99984 12.3334Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12.7602 12.7599L12.6735 12.6733M12.6735 3.32659L12.7602 3.23992L12.6735 3.32659ZM3.24016 12.7599L3.32683 12.6733L3.24016 12.7599ZM8.00016 1.38659V1.33325V1.38659ZM8.00016 14.6666V14.6133V14.6666ZM1.38683 7.99992H1.3335H1.38683ZM14.6668 7.99992H14.6135H14.6668ZM3.32683 3.32659L3.24016 3.23992L3.32683 3.32659Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SubscribeIcn = (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M13.9168 15.8166H6.0835C5.7335 15.8166 5.34183 15.5416 5.22517 15.2082L1.77517 5.55822C1.2835 4.17489 1.8585 3.74989 3.04183 4.59989L6.29183 6.92489C6.8335 7.29989 7.45017 7.10822 7.6835 6.49989L9.15017 2.59155C9.61683 1.34155 10.3918 1.34155 10.8585 2.59155L12.3252 6.49989C12.5585 7.10822 13.1752 7.29989 13.7085 6.92489L16.7585 4.74989C18.0585 3.81655 18.6835 4.29155 18.1502 5.79989L14.7835 15.2249C14.6585 15.5416 14.2668 15.8166 13.9168 15.8166Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5.4165 18.3333H14.5832"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7.9165 11.6667H12.0832"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const profileIcn = (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M18 18.86H17.24C16.44 18.86 15.68 19.17 15.12 19.73L13.41 21.42C12.63 22.19 11.36 22.19 10.58 21.42L8.87 19.73C8.31 19.17 7.54 18.86 6.75 18.86H6C4.34 18.86 3 17.53 3 15.89V4.97998C3 3.33998 4.34 2.01001 6 2.01001H18C19.66 2.01001 21 3.33998 21 4.97998V15.89C21 17.52 19.66 18.86 18 18.86Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M11.9999 10.0001C13.2868 10.0001 14.33 8.95687 14.33 7.67004C14.33 6.38322 13.2868 5.34009 11.9999 5.34009C10.7131 5.34009 9.66992 6.38322 9.66992 7.67004C9.66992 8.95687 10.7131 10.0001 11.9999 10.0001Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 15.6601C16 13.8601 14.21 12.4001 12 12.4001C9.79 12.4001 8 13.8601 8 15.6601"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const webIcn = (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7.99961 3H8.99961C7.04961 8.84 7.04961 15.16 8.99961 21H7.99961"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15 3C16.95 8.84 16.95 15.16 15 21"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3 16V15C8.84 16.95 15.16 16.95 21 15V16"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3 9.0001C8.84 7.0501 15.16 7.0501 21 9.0001"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const subsIcn = (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M20.9498 14.55L14.5598 20.94C13.1598 22.34 10.8598 22.34 9.44978 20.94L3.05977 14.55C1.65977 13.15 1.65977 10.85 3.05977 9.44001L9.44978 3.05C10.8498 1.65 13.1498 1.65 14.5598 3.05L20.9498 9.44001C22.3498 10.85 22.3498 13.15 20.9498 14.55Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6.25 6.25L17.75 17.75"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M17.75 6.25L6.25 17.75"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const messageIcn = (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g opacity="0.5">
      <path
        d="M17 20.5H7C4 20.5 2 19 2 15.5V8.5C2 5 4 3.5 7 3.5H17C20 3.5 22 5 22 8.5V15.5C22 19 20 20.5 17 20.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17 9L13.87 11.5C12.84 12.32 11.15 12.32 10.12 11.5L7 9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  </svg>
);

const logoutIcn = (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g opacity="0.5">
      <path
        d="M15.0996 7.55999C14.7896 3.95999 12.9396 2.48999 8.88961 2.48999H8.75961C4.28961 2.48999 2.49961 4.27999 2.49961 8.74999V15.27C2.49961 19.74 4.28961 21.53 8.75961 21.53H8.88961C12.9096 21.53 14.7596 20.08 15.0896 16.54"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.99988 12H20.3799"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.15 8.6499L21.5 11.9999L18.15 15.3499"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  </svg>
);

const backIcn = (
  <svg
    width="33"
    height="33"
    viewBox="0 0 33 33"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="16.5"
      cy="16.5"
      r="16"
      fill="#545454"
      fillOpacity="0.1"
      stroke="#404040"
    />
    <path
      d="M18 22.28L13.6533 17.9333C13.14 17.42 13.14 16.58 13.6533 16.0666L18 11.72"
      stroke="#9A9AAF"
      strokeWidth="1.5"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const walletIcn = (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5 6.25C4.27065 6.25 3.57118 6.53973 3.05546 7.05546C2.53973 7.57118 2.25 8.27065 2.25 9V18C2.25 18.7293 2.53973 19.4288 3.05546 19.9445C3.57118 20.4603 4.27065 20.75 5 20.75H19C19.7293 20.75 20.4288 20.4603 20.9445 19.9445C21.4603 19.4288 21.75 18.7293 21.75 18V9C21.75 8.27065 21.4603 7.57118 20.9445 7.05546C20.4288 6.53973 19.7293 6.25 19 6.25H5ZM16.5 12.25C16.1685 12.25 15.8505 12.3817 15.6161 12.6161C15.3817 12.8505 15.25 13.1685 15.25 13.5C15.25 13.8315 15.3817 14.1495 15.6161 14.3839C15.8505 14.6183 16.1685 14.75 16.5 14.75C16.8315 14.75 17.1495 14.6183 17.3839 14.3839C17.6183 14.1495 17.75 13.8315 17.75 13.5C17.75 13.1685 17.6183 12.8505 17.3839 12.6161C17.1495 12.3817 16.8315 12.25 16.5 12.25Z"
      fill="currentColor"
    />
    <path
      d="M16.485 3.069C16.7811 2.9901 17.0913 2.98028 17.3918 3.04031C17.6923 3.10034 17.9749 3.2286 18.218 3.41521C18.461 3.60181 18.6579 3.84176 18.7935 4.11654C18.9291 4.39133 18.9998 4.69359 19 5H9L16.485 3.069Z"
      fill="currentColor"
    />
  </svg>
);
