"use client";
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import TableLayout from "@/components/tableLayout";
import { useChainId } from "wagmi";
import { all } from "@/utils/sugar.utils";
import Link from "next/link";
import Logo from "@/components/common/Logo";

const Nav = styled.div`
  button {
    &:after {
      position: absolute;
      content: "";
      bottom: 0;
      left: 0;
      width: 100%;
      background: #00ff4e;
      height: 2px;
      opacity: 0;
    }
    &.active {
      color: #fff;
      &:after {
        opacity: 1;
      }
    }
  }
`;

type Tab = {
  title: string;
  content: React.ReactNode; // This can be any JSX element
};

type Column = {
  head: string;
  accessor: string;
  component?: (item: Data, key: number) => React.ReactNode; // Optional component property
  isComponent?: boolean; // For columns with specific components (like a switch)
};

type Data = {
  chainId: number;
  token0: string;
  token1: string;
  symbol: string;
  volume: string;
  apr: string;
  pool_fee: string;
  poolBalance: string;
  url: string;
};

const tabs: Tab[] = [
  {
    title: "Active",
    content: <></>,
  },
  {
    title: "Volatile",
    content: <></>,
  },
  {
    title: "Stable",
    content: <></>,
  },
];

const column: Column[] = [
  {
    head: "Liquidity Pool",
    accessor: "Liquidity",
    component: (item: Data, key: number) => {
      return (
        <div key={key} className="flex items-center gap-3">
          <ul className="list-none pl-3 mb-0 flex-shrink-0 flex items-center">
            <li className="" style={{ marginLeft: -10 }}>
              <div className="flex-shrink-0 flex items-center shadow-sm border border-gray-800 justify-center rounded-full bg-[#000] p-1">
                <Logo
                  chainId={item.chainId}
                  token={item.token0}
                  margin={0}
                  height={20}
                />{" "}
              </div>
            </li>
            <li className="" style={{ marginLeft: -10 }}>
              <div className="flex-shrink-0 flex items-center shadow-sm border border-gray-800 justify-center rounded-full bg-[#000] p-1">
                <Logo
                  chainId={item.chainId}
                  token={item.token1}
                  margin={0}
                  height={20}
                />{" "}
              </div>
            </li>
          </ul>
          <div className="content">
            <p className="m-0 text-muted">{item?.symbol}</p>
          </div>
        </div>
      );
    },
  },
  { head: "Apr", accessor: "apr" },
  {
    head: "Volume",
    accessor: "volume",
    isComponent: true,
  },
  {
    head: "Pool Fee",
    accessor: "pool_fee",
  },
  {
    head: "Pool Balance",
    accessor: "poolBalance",
  },
  {
    head: "",
    accessor: "action",
    component: (item: Data) => {
      const url = item.url || "/deposit";
      return (
        <>
          <details className="dropdown">
            <summary className="border-0 cursor-pointer p-0 flex items-center m-1">
              {moreIcn}
            </summary>
            <ul className="menu dropdown-content bg-base-100 bg-white rounded-box z-1 w-52 p-2 right-0 shadow-sm text-dark">
              <li className="border-b border-dashed border-[#000] py-1">
                <Link
                  href={url}
                  className="flex items-center text-black font-medium "
                >
                  Deposit
                </Link>
              </li>
              <li className="py-1">
                <Link
                  href={url}
                  className="flex items-center text-black font-medium "
                >
                  Deposit
                </Link>
              </li>
            </ul>
          </details>
        </>
      );
    },
  },
];

const tabFilter = {
  0: 1,
  1: -1,
  2: 0,
} as const;

const Liquidity = () => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [pools, setPools] = useState([]);
  const [type, setType] = useState(1);

  const showTab = (tab: number) => {
    setActiveTab(tab);
    setType(tabFilter[tab as keyof typeof tabFilter]);
  };

  const chainId = useChainId();

  useEffect(() => {
    if (chainId) {
      all(chainId, 8, 0, type).then((result) => setPools(result));
    }
  }, [chainId, type]);

  return (
    <section className="Liquidity py-5 relative">
      <div className="container ">
        <div className="grid gap-3 grid-cols-12">
          <div className="col-span-12">
            <div className="flex items-center justify-between flex-wrap">
              <h4 className="m-0 font-bold text-2xl">Liquidity Pools</h4>
              <form action="">
                <div className="flex items-center gap-3">
                  <Link
                    href={"/pools?token0=&token1=&poolType=&stable="}
                    className="flex items-center justify-center btn text-xs commonBtn rounded-lg h-[40px] px-4 font-medium "
                  >
                    Deposit Liquidity
                  </Link>
                </div>
              </form>
            </div>
          </div>
          <div className="col-span-12">
            <div className="w-full">
              <Nav
                className="flex nav flex-nowrap border-b gap-4 overflow-x-auto"
                style={{ borderColor: "#2c2c2c" }}
              >
                {tabs &&
                  tabs.length > 0 &&
                  tabs.map((item, key) => (
                    <button
                      key={key}
                      onClick={() => showTab(key)}
                      className={`${
                        activeTab === key && "active"
                      } tab-button font-medium relative py-2 flex-shrink-0  text-xs text-gray-400`}
                    >
                      {item.title}
                    </button>
                  ))}
              </Nav>
              <div className="tabContent pt-3">
                <TableLayout column={column} data={pools} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Liquidity;

const moreIcn = (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M2.75 6.5C2.97981 6.5 3.20738 6.54526 3.4197 6.63321C3.63202 6.72116 3.82493 6.85006 3.98744 7.01256C4.14994 7.17507 4.27884 7.36798 4.36679 7.5803C4.45474 7.79262 4.5 8.02019 4.5 8.25C4.5 8.47981 4.45474 8.70738 4.36679 8.9197C4.27884 9.13202 4.14994 9.32493 3.98744 9.48744C3.82493 9.64994 3.63202 9.77884 3.4197 9.86679C3.20738 9.95473 2.97981 10 2.75 10C2.28587 10 1.84075 9.81563 1.51256 9.48744C1.18437 9.15925 1 8.71413 1 8.25C1 7.78587 1.18437 7.34075 1.51256 7.01256C1.84075 6.68437 2.28587 6.5 2.75 6.5ZM8 6.5C8.22981 6.5 8.45738 6.54526 8.6697 6.63321C8.88202 6.72116 9.07493 6.85006 9.23744 7.01256C9.39994 7.17507 9.52884 7.36798 9.61679 7.5803C9.70473 7.79262 9.75 8.02019 9.75 8.25C9.75 8.47981 9.70473 8.70738 9.61679 8.9197C9.52884 9.13202 9.39994 9.32493 9.23744 9.48744C9.07493 9.64994 8.88202 9.77884 8.6697 9.86679C8.45738 9.95473 8.22981 10 8 10C7.53587 10 7.09075 9.81563 6.76256 9.48744C6.43437 9.15925 6.25 8.71413 6.25 8.25C6.25 7.78587 6.43437 7.34075 6.76256 7.01256C7.09075 6.68437 7.53587 6.5 8 6.5ZM13.25 6.5C13.4798 6.5 13.7074 6.54526 13.9197 6.63321C14.132 6.72116 14.3249 6.85006 14.4874 7.01256C14.6499 7.17507 14.7788 7.36798 14.8668 7.5803C14.9547 7.79262 15 8.02019 15 8.25C15 8.47981 14.9547 8.70738 14.8668 8.9197C14.7788 9.13202 14.6499 9.32493 14.4874 9.48744C14.3249 9.64994 14.132 9.77884 13.9197 9.86679C13.7074 9.95473 13.4798 10 13.25 10C12.7859 10 12.3408 9.81563 12.0126 9.48744C11.6844 9.15925 11.5 8.71413 11.5 8.25C11.5 7.78587 11.6844 7.34075 12.0126 7.01256C12.3408 6.68437 12.7859 6.5 13.25 6.5Z"
      fill="#00ff4e"
    />
  </svg>
);
