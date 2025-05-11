"use client";
import React, { useEffect, useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { allRelay, locksByAccount, Relay, VeNFT } from "@/utils/sugar.utils";
import ListLayout from "@/components/lockRow";
import Link from "next/link";
import { calculateRebaseAPR, formatTimestamp, fromUnits, getTimeSince, shortenPubkey } from "@/utils/math.utils";
import LockInteraction from "@/components/lockInteraction/LockInteraction";
import { Tooltip } from 'react-tooltip'
import Image from "next/image";
import logo from "@/assets/Images/logo.png"
import { gobV2 } from "@/utils/constant.utils";

type Column = {
  accessor: string;
  component?: (item: VeNFT, key: number) => React.ReactNode;
  isComponent?: boolean;
};

const column: Column[] = [
  {
    accessor: "Lock",
    component: (item: VeNFT) => <LockInteraction item={item} />
  },
  {
    accessor: "apr", component: (item: VeNFT) => {
      return (
        <>
          <p className="m-0 text-gray-500 text-xs">Rebase APR </p>
          <p className="m-0 text-base text-white">
            {calculateRebaseAPR(item.rebase_amount, item.amount, item.decimals)}%
          </p>
        </>
      );
    },
  },
  {
    accessor: "Locked Amount",
    component: (item: VeNFT) => {
      const amount = parseFloat(item.amount) / 10 ** parseInt(item.decimals)
      return (
        <>
          <p className="m-0 text-gray-500 text-xs">Locked Amount </p>
          <p className="m-0 text-base text-white">{amount.toFixed(5)} GOB
          </p>
        </>
      );
    },
  },
  {
    accessor: "Voting Power",
    component: (item: VeNFT) => {
      const votingPower = parseFloat(item.voting_amount) / 10 ** parseInt(item.decimals)
      return (
        <>
          <p className="m-0 text-gray-500 text-xs">Voting Power</p>
          <p className="m-0 text-base text-white">{votingPower.toFixed(5)} veGOB
          </p>
        </>
      );
    },
  },
  {
    accessor: "Unlock Date",
    component: (item: VeNFT) => {
      const formattedDate = item.expires_at === "0" ? "-" : formatTimestamp(Number(item.expires_at));
      return (
        <>
          <p className="m-0 text-gray-500 text-xs">Unlock Date</p>
          <p className="m-0 text-base text-white">{formattedDate}
          </p>
        </>
      );
    },
  }
];

const Locks = () => {
  const chainId = useChainId();
  const { address } = useAccount();
  const [locks, setLocks] = useState<VeNFT | null>(null);
  const [relay, setRelay] = useState<Relay[] | null>(null)
  const [isCopied, setIsCopied] = useState(false)

  useEffect(() => {
    if (chainId && address) {
      fetchLocksByAccount()
      fetchRelay()
    }
  }, [chainId, address]);

  const fetchLocksByAccount = async () => {
    if (!address) return
    const locks_ = await locksByAccount(chainId, address)
    setLocks(locks_)
  }

  const fetchRelay = async () => {
    const relay_ = await allRelay(chainId, address as string)
    setRelay(relay_)
  }

  const copy = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setIsCopied(true)
  }


  return (
    <section className="Liquidity py-5 relative">
      <div className="container ">
        <div className="grid gap-3 grid-cols-12">
          <div className="col-span-12">
            <div className="flex items-center justify-between flex-wrap bg-[#000e0e] rounded-xl p-5">
              <h4 className="m-0 font-normal ">Gain greater voting power and higher rewards, by locking more tokens for longer.
              </h4>
              <form action="">
                <div className="flex items-center gap-3">
                  <Link
                    href={"/lock"}
                    className="flex items-center justify-center btn text-xs commonBtn rounded-lg h-[40px] px-4 font-medium "
                  >
                    Create Lock
                  </Link>
                </div>
              </form>
            </div>
          </div>
          <div className="col-span-12">
            <div className="py-2">
              <h4 className="m-0 font-medium text-xl">Lock</h4>
            </div>
            <div className="w-full">
              <div className="tabContent pt-3">
                <ListLayout column={column} data={locks} />
              </div>
            </div>
          </div>

          <div className="col-span-12">
            <div className="py-2">
              <h4 className="m-0 font-medium text-xl">Relays</h4>
            </div>
            {
              relay && relay.map((item) => (
                <div className="w-full" key={item.venft_id}>
                  <div className="py-2">
                    <div
                      className="p-5 flex flex-col gap-4 justify-between bg-[#000e0e] border border-[#242424] rounded-xl"
                    >
                      <div className="flex flex-col gap-8 sm:flex-row sm:gap-4 justify-between grow">
                        <div className="flex gap-4 items-center">
                          <div className="relative bg-[#000] border border-[#242424] rounded-xl size-11 flex items-center justify-center">
                            <div className="-bottom-1 -right-1 bg-green-500 absolute w-2.5 h-2.5 rounded-full animate-ping hover:animate-none" />
                            <div
                              className="inline cursor-pointer"
                            >
                              <div className="-bottom-1 -right-1 bg-green-500 absolute w-2.5 h-2.5 rounded-full" />
                            </div>
                            {icn1}
                          </div>
                          <div className="space-y-1.5">
                            <div className="text-accent-80 flex gap-2.5 text-sm ">
                              <div className="font-semibold">{item.name}</div>
                              <span
                                className="flex items-center gap-1 font-semibold text-accent-60 border border-transparent bg-[#000] border border-[#242424] cursor-default rounded-full h-[16px] px-2 text-[9px] uppercase"
                                data-testid="flowbite-badge"
                              >
                                <span>ID {item.venft_id}</span>
                              </span>
                            </div>
                            <div className="text-xs text-accent-50 flex gap-2 items-center">
                              <span content="[object Object]">
                                {Number(item.run_at) === 0 ? "Never updated" :
                                  <> Updated {getTimeSince(Number(item.run_at)).relative}</>
                                }
                              </span>
                              <span className="hidden sm:inline-block opacity-30">·</span>
                              <div className="hidden sm:flex items-center gap-2 text-[11px]">
                                <span className="font-mono">{shortenPubkey(item.relay)}</span>
                                <div
                                  className="inline-block cursor-pointer"
                                  data-testid="flowbite-tooltip-target"
                                >
                                  <Tooltip id="my-tooltip" />
                                  <div
                                    role="button"
                                    data-tooltip-id="my-tooltip" data-tooltip-content={isCopied ? "Copied" : "Copy"}
                                    onClick={
                                      () => copy(item?.relay)
                                    }
                                  >
                                    {copyIcn}
                                  </div>
                                </div>
                                <div
                                  data-testid="flowbite-tooltip"
                                  tabIndex={-1}
                                  className="absolute inline-block z-10 rounded-lg py-2 px-3 text-sm font-medium transition-opacity duration-300 invisible opacity-0 bg-black text-white shadow-xl"
                                  id=":r99:"
                                  role="tooltip"
                                  style={{ position: "absolute", top: 616, left: "337.352px" }}
                                >
                                  <div className="relative z-20">Copy</div>
                                  <div
                                    className="absolute z-10 h-2 w-2 rotate-45 bg-black"
                                    data-testid="flowbite-tooltip-arrow"
                                    style={{ left: "25.5px", bottom: "-4px" }}
                                  >
                                    &nbsp;
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 items-center">
                          <Link
                            href={`/relay?deposit=true&relay=${item.relay}&id=${item.venft_id}`}
                            type="button"
                            className="group flex h-min items-center justify-center text-center focus:z-10 focus:outline-none focus:ring-transparent focus-visible:ring-inherit font-semibold border border-accent-30 hover:opacity-80 transition rounded-xl focus:ring-2"
                          >
                            <span className="flex items-center rounded-md h-[38px] text-xs py-2 px-4">
                              Deposit Lock
                            </span>
                          </Link>
                        </div>
                      </div>
                      <div className="flex flex-col gap-0 md:gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8 pt-4 xl:mt-0 border-t border-[#242424]">
                        <div className="flex items-center justify-between pb-3 sm:pb-0 gap-3 text-xs">
                          <div className="lg:text-right text-accent-50">Voting Power</div>
                          <div className="flex gap-2 items-center">
                            <div className="lg:text-right">{fromUnits(item.voting_amount, item.decimals)} </div>
                            <div>
                              <span className="mr-2">~</span> --%
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:gap-8 border-t border-[#242424] sm:border-t-0">
                          <div className="flex gap-3 py-3 sm:py-0 sm:pl-5 justify-between items-center text-xs">
                            <div className="text-accent-50">Rewards</div>
                            <div>{gobV2[chainId || 8453].symbol}</div>
                          </div>
                          <div className="flex items-center justify-between gap-2 text-xs pt-3 sm:pt-0 border-t border-[#242424] sm:border-t-0">
                            <div className="text-accent-50">APR</div>
                            <div className="lg:text-right">
                              <span
                                data-testid=""
                                data-test-amount="39.6526453955492"
                                className="tabular-nums"
                              >
                                --%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {item?.account_venfts?.length ?
                      item.account_venfts.map((lockItem) => (
                        <div
                          className="space-y-2 py-2.5 px-2.5 mx-1 sm:mx-3 p-6 text-sm text-accent-60 rounded-b-xl"
                          key={lockItem.id}
                        >
                          <div className="flex flex-col md:flex-row gap-3 md:justify-between md:items-center bg-[#000e0e] border border-[#242424] p-4 pr-4 rounded-lg">
                            <div>
                              <div className="text-accent-40 text-xs pb-4">Deposited</div>
                              <div className="flex gap-3 items-center text-sm">
                                <div className="shrink-0">
                                  <div className="flex items-center justify-center size-11 bg-[#000] border border-[#242424] rounded-xl">
                                    <Image
                                      src={logo}
                                      alt=""
                                      height={10000}
                                      width={10000}
                                      className="max-w-full h-[30px] mx-auto w-auto object-contain"
                                    />

                                  </div>
                                </div>
                                <div>
                                  <div className="flex gap-2 items-center text-accent-80">
                                    <strong>Lock #{lockItem.id}</strong>
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width={12}
                                      height={12}
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth={3}
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      className="lucide lucide-lock"
                                    >
                                      <rect width={18} height={11} x={3} y={11} rx={2} ry={2} />
                                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                  </div>
                                  <div className="flex gap-1.5 items-center pt-1">
                                    <div className="text-accent-50 flex gap-2 items-center text-xs">
                                      <div
                                        className="inline-block cursor-pointer"
                                        data-testid="flowbite-tooltip-target"
                                      >
                                        <span
                                          data-testid=""
                                          data-test-amount="0.1"
                                          className="tabular-nums"
                                        >
                                          {fromUnits(lockItem.amount, item.decimals)}
                                          <span className="opacity-70">&nbsp;{gobV2[chainId || 8453].symbol}</span>
                                        </span>
                                      </div>
                                      locked for 4 years
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="md:text-right border-t border-[#242424] pt-4 mt-2 md:pt-0 md:mt-0 md:border-none">
                              <div className="text-accent-40 text-xs pb-4">Rewards</div>
                              <div className="flex gap-1.5 lg:justify-end text-sm text-foreground pb-1">
                                {" "}
                                {lockItem.earned} {gobV2[chainId || 8453].symbol}
                              </div>
                              <div className="text-accent-50 cursor-not-allowed text-xs">
                                Withdraw available after first epoch
                              </div>
                            </div>
                          </div>
                        </div>
                      )) : ""
                    }


                  </div>
                </div>
              ))
            }

          </div>
        </div>
      </div>
    </section>
  );
};

export default Locks;


const icn1 = <svg
  xmlns="http://www.w3.org/2000/svg"
  width={20}
  height={20}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth={1}
  strokeLinecap="round"
  strokeLinejoin="round"
  className="lucide lucide-ratio"
>
  <rect width={12} height={20} x={6} y={2} rx={2} />
  <rect width={20} height={12} x={2} y={6} rx={2} />
</svg>

const copyIcn = <svg
  xmlns="http://www.w3.org/2000/svg"
  width={10}
  height={10}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth={2}
  strokeLinecap="round"
  strokeLinejoin="round"
  className="lucide lucide-copy opacity-50 hover:opacity-100"
>
  <rect width={14} height={14} x={8} y={8} rx={2} ry={2} />
  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
</svg>