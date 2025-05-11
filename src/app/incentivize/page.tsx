"use client";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import SelectTokenPopup from "@/components/modals/SelectTokenPopup";
import Logo from "@/components/common/Logo";
import { useAccount, useChainId } from "wagmi";
import { useRouter, useSearchParams } from "next/navigation";
import { tokens } from "@myswap/token-list";
import { gobV2, stableTokens } from "@/utils/constant.utils";
import ListLayout from "@/components/lockRow";
import { approve, erc20Balance, fetchV2Pools, findIndex } from "@/utils/web3.utils";
import Link from "next/link";
import { fromUnits, toUnits } from "@/utils/math.utils";
import { byIndex, FormattedPool } from "@/utils/sugar.utils";
import styled, { keyframes } from "styled-components";
import Progress from "@/components/common/Progress";
import ActButton from "@/components/common/ActButton";
import { ethers, ZeroAddress } from "ethers";
import { aerodromeContracts } from "@/utils/config.utils";
import { useEthersSigner } from "@/hooks/useEthersSigner";
import voterAbi from "../../abi/aerodrome/voter.json";
import bribeVotingRewardAbi from "../../abi/aerodrome/bribeVotingReward.json";
import Notify from "@/components/common/Notify";


export interface Token {
  address: string;
  symbol: string;
  decimals: number;
  balance: number;
}

type Column = {
  accessor: string;
  component?: (item: Data, key: number) => React.ReactNode; // Optional component property
  isComponent?: boolean; // For columns with specific components (like a switch)
};

type Data = {
  pool: string;
  token0: string;
  token1: string;
  symbol: string;
  chainId: number;
  stable: boolean
  volume: string;
  apr: string;
  poolBalance: string;
  action: string;
  status: boolean;
};

const column: Column[] = [
  {
    accessor: "Lock",
    component: (item: Data, key: number) => {
      return (
        <div key={key} className="flex items-center gap-3">
          <ul className="list-none pl-3 mb-0 flex-shrink-0 flex items-center">
            <li className="" style={{ marginLeft: -10 }}>
              <div className="flex-shrink-0 flex items-center shadow-sm border border-gray-800 justify-center rounded-full bg-[#000] p-1">
                <Logo chainId={item.chainId} token={item.token0} margin={0} height={20} />{" "}
              </div>
            </li>
            <li className="" style={{ marginLeft: -10 }}>
              <div className="flex-shrink-0 flex items-center shadow-sm border border-gray-800 justify-center rounded-full bg-[#000] p-1">
                <Logo chainId={item.chainId} token={item.token1} margin={0} height={20} />{" "}
              </div>
            </li>
          </ul>
          <div className="content">
            <p className="m-0 text-muted">{item?.symbol}</p>
          </div>
        </div>
      )
    }
  },
  {
    accessor: "TVL", component: () => {
      return (
        <>
          <p className="m-0 text-gray-500 text-xs">TVL </p>
          <p className="m-0 text-base text-white">
            0 $
          </p>
        </>
      );
    },
  },
  {
    accessor: "Apr",
    component: () => {
      return (
        <>
          <p className="m-0 text-gray-500 text-xs">APR </p>
          <p className="m-0 text-base text-white">
            0 %
          </p>
        </>
      );
    },
  },
  {
    accessor: "Action",
    component: (item: Data) => {
      const url = `/incentivize?token0=${item.token0}&token1=${item.token1}&stable=${item.stable}&addIncentive=true`;
      return (
        <>
          <Link href={url} className="flex items-center justify-center rounded-xl font-semibold transition duration-[400ms] border border-[#454545] h-[38px] px-4 text-white hover:bg-[#00ff4e] hover:text-[#000]">
            Add Incentive
          </Link>
        </>
      );
    },
  }
];

const Incentivize = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stable_ = searchParams.get("stable")
  const incentive_ = searchParams.get("addIncentive");

  const isIncentive = incentive_ === 'true';
  const isStable = stable_ === 'true'

  const chainId = useChainId();
  const { address } = useAccount()
  const signer = useEthersSigner();

  const [isChecked, setIsChecked] = useState(false);
  const [amount, setAmount] = useState("");
  const [token, setToken] = useState<Token | null>(null);
  const [token0, setToken0] = useState<Token | null>(null);
  const [token1, setToken1] = useState<Token | null>(null);
  const [pool, setPool] = useState<FormattedPool>();
  const [stablePool, setStablePool] = useState<Data[]>([]);
  const [volatilePool, setVolatilePool] = useState<Data[]>([]);
  const [tokenBeingSelected, setTokenBeingSelected] = useState<
    "token0" | "token1" | "token" | null
  >(null);
  const [filteredTokenList, setFilteredTokenList] = useState([]);

  const [load, setLoad] = useState<{ [key: string]: boolean }>({});
  const [status, setStatus] = useState<{ [key: string]: boolean }>({
    isTokenSelected: false,
    isCompleted: false,
    createGauge: false,
    isRewardAdded: false,
    isAllowanceForToken: false,
  });

  const handProgress = (action: string, status: boolean) => {
    setStatus((prev) => ({ ...prev, [action]: status }));
  };

  const handleLoad = (action: string, status: boolean) => {
    setLoad((prev) => ({ ...prev, [action]: status }));
  };

  const handleChange = (value: string) => {
    setAmount(value);
  };

  const handleTokenSelect = (_token: Token) => {
    setToken(_token);
    const newQueryParams = new URLSearchParams(searchParams.toString());
    if (tokenBeingSelected === "token0") {
      setToken0(_token);
      newQueryParams.set("token0", _token.address);
    } else if (tokenBeingSelected === "token1") {
      setToken1(_token);
      newQueryParams.set("token1", _token.address);
    }
    setTokenBeingSelected(null);
    router.push(`/incentivize?${newQueryParams.toString()}`, { scroll: false });
  };

  useEffect(() => {
    if (chainId && token0 && token1) {
      fetchPools()
    }
  }, [chainId, token0, token1]);

  useEffect(() => {
    if (isStable) {
      fetchPoolByIndex(chainId, stablePool[0]?.pool)
      // setPool(stablePool[0])
    } else {
      fetchPoolByIndex(chainId, volatilePool[0]?.pool)
      // setPool(volatilePool[0])
    }
  }, [chainId, isStable]);


  useEffect(() => {
    if (chainId) {
      setInitialToken();
    }
  }, [chainId]);

  // useEffect(() => {
  //   if (chainId && address) {
  //     fetchPositions();
  //   }
  // }, [chainId, address]);

  useEffect(() => {
    if (chainId && token?.address && address) {
      fetchRewardTokenBalance();
    }
  }, [chainId, token?.address, address]);

  const setInitialToken = () => {
    let tokens_ = tokens.filter((item) => item.chainId == chainId);
    tokens_ = [...tokens_, ...stableTokens(chainId)];
    //@ts-expect-error ignore
    setFilteredTokenList(tokens_);
  };

  // const fetchPositions = async () => {
  //   if(!address) return
  //   const position_ = await positions(chainId, 1,0, address)
  //   console.log(position_, "position rrr")
  // }

  const fetchPools = async () => {
    if (!token0 || !token1) return;
    const volatile = await fetchV2Pools(chainId, token0.address, token1.address, false);
    //@ts-expect-error ignore
    setVolatilePool(volatile);
    const stable = await fetchV2Pools(chainId, token0.address, token1.address, true);
    //@ts-expect-error ignore
    setStablePool(stable);
  }

  const fetchPoolByIndex = async (chainId: number, _pool: string) => {
    if (!_pool) return
    const index = await findIndex(chainId, _pool)
    const pool_ = await byIndex(chainId, index);
    //@ts-expect-error ignore warn
    setPool(pool_);
  };

  const fetchRewardTokenBalance = async () => {
    if (!token?.address || !address) return;
    const balance = await erc20Balance(
      chainId,
      token?.address,
      token?.decimals,
      address
    );
    if (token && token.address) {
      setToken({
        ...token,
        balance: Number(balance),
      });
    }
  };

  const createGuage = async () => {
    try {
      if (!address) return alert("Please connect your wallet");
      if (pool?.factory == ZeroAddress || pool?.lp == ZeroAddress) return;

      handleLoad("createGauge", true);

      const aerodromeVoter = new ethers.Contract(
        aerodromeContracts[chainId].voter,
        voterAbi,
        await signer
      );

      const tx = await aerodromeVoter.createGauge(pool?.factory, pool?.lp, {
        gasLimit: 5000000,
      });

      await tx.wait();
      await fetchPoolByIndex(chainId, pool?.lp as string);
      Notify({ chainId, txhash: tx.hash });
      handleLoad("createGauge", false);
    } catch (error) {
      console.log(error);
      handleLoad("createGauge", false);
    }
  };

  const addReward = async () => {
    try {
      if (!address) return alert("Please connect your wallet");
      if (pool?.bribe == ZeroAddress || pool?.lp == ZeroAddress) return;

      handleLoad("addReward", true);

      const txApprove = await approve(
        //@ts-expect-error ignore
        token?.address,
        await signer,
        //@ts-expect-error ignore
        pool.bribe,
        Number(amount),
        token?.decimals
      );
      if (txApprove) {
        await txApprove.wait();
      }
      handProgress("isAllowanceForToken", true);
      const bribeVotingReward = new ethers.Contract(
        //@ts-expect-error ignore
        pool.bribe,
        bribeVotingRewardAbi,
        await signer
      );

      const tx = await bribeVotingReward.notifyRewardAmount(
        token?.address,
        //@ts-expect-error ignore
        toUnits(amount, token?.decimals),
        { gasLimit: 5000000 }
      );

      await tx.wait();
      handProgress("isRewardAdded", true);
      await fetchPoolByIndex(chainId, pool?.lp as string);
      Notify({ chainId, txhash: tx.hash });
      handleLoad("addReward", false);
    } catch (error) {
      console.log(error);
      handleLoad("addReward", false);
    }
  };

  return (
    <>
      {tokenBeingSelected &&
        createPortal(
          <SelectTokenPopup
            tokenBeingSelected={tokenBeingSelected}
            onSelectToken={handleTokenSelect}
            onClose={() => setTokenBeingSelected(null)}
            chainId={chainId}
            tokens={filteredTokenList}
          />,
          document.body
        )}
      {
        isIncentive === false ?
          <>
            <section className="pools py-5 relative">
              <div className="container">
                <div className="grid gap-3 grid-cols-12 mx-auto max-w-[800px]">
                  <div className="col-span-12">
                    <div className="pl-9 pr-7 py-7 flex flex-grow-0 items-center justify-between bg-red-600 dark:bg-red-700 text-white rounded-2xl">
                      <div className="w-9/12 pr-12 text-sm"><span className="font-semibold">Warning:</span> The incentivize feature is mainly used by protocols. Please make sure you understand how it works before using it as any transaction is final and cannot be reverted.</div>
                      {icn1}
                    </div>
                  </div>
                  <div className="col-span-12">
                    <div className="">
                      <div className="top pb-3">
                        <h4 className="m-0 font-normal text-xl flex items-center gap-3">
                          Incentivize
                        </h4>
                      </div>
                      <div className="cardBody">
                        <div className="grid gap-3 grid-cols-12">
                          <div className="sm:col-span-6 col-span-12">
                            <div
                              className="flex items-center relative iconWithText cursor-pointer rounded-lg bg-[#000e0e] gap-3 px-4 py-5"
                              onClick={() => setTokenBeingSelected("token0")}
                            >
                              <span className="absolute right-2 icn">{downIcn}</span>
                              <div className="flex-shrink-0">
                                {token0 ? (
                                  <Logo
                                    chainId={chainId}
                                    token={token0?.address}
                                    margin={0}
                                    height={20}
                                  />
                                ) : (
                                  addIcn
                                )}
                              </div>
                              <div className="content">
                                <p className="m-0 text-white/50 text-xs font-medium">
                                  {token0 ? token0.symbol : "Select first token"}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="sm:col-span-6 col-span-12">
                            <div
                              className="flex items-center relative iconWithText cursor-pointer rounded-lg bg-[#000e0e] gap-3 px-4 py-5"
                              onClick={() => setTokenBeingSelected("token1")}
                            >
                              <span className="absolute right-2 icn">{downIcn}</span>
                              <div className="flex-shrink-0">
                                {token1 ? (
                                  <Logo
                                    chainId={chainId}
                                    token={token1?.address}
                                    margin={0}
                                    height={20}
                                  />
                                ) : (
                                  addIcn
                                )}
                              </div>
                              <div className="content">
                                <p className="m-0 text-white/50 text-xs font-medium">
                                  {token1 ? token1.symbol : "Select second token"}
                                </p>
                              </div>
                            </div>
                          </div>


                          <div className="col-span-12">
                            <div className="py-2">
                              <h4 className="m-0 font-medium text-l">Available pools</h4>
                            </div>
                            <div className="w-full">
                              <div className="tabContent pt-3">
                                {stablePool.length > 0 && stablePool[0]?.status == true && <ListLayout column={column} data={stablePool} />}
                                {volatilePool.length > 0 && volatilePool[0]?.status == true && <ListLayout column={column} data={volatilePool} />}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </> :
          <>
            <section className="py-8 relative">
              <div className="container">
                <div className="grid gap-3 grid-cols-12">
                  <div className="col-span-12">
                    <div className="mx-auto grid gap-3 md:gap-5 grid-cols-12 max-w-[1000px]">
                      <div className="md:col-span-7 col-span-12">
                        <div className="py-2">
                          <div className="cardCstm p-3 md:p-5 rounded-xl bg-[#0b120d] relative border border-[#2a2a2a]">
                            <div>
                              <div className="flex flex-col sm:flex-row sm:justify-between">
                                <div className="flex items-center gap-2 sm:gap-3.5">
                                  <div className="flex -space-x-2 w-16 shrink-0">
                                    <div className="flex -space-x-2">
                                      <Logo
                                        chainId={chainId}
                                        token={pool?.token0}
                                        margin={0}
                                        height={20}
                                      />
                                      <Logo
                                        chainId={chainId}
                                        token={pool?.token1}
                                        margin={0}
                                        height={20}
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-sm tracking-wide text-accent-80 mb-1">
                                      <strong>{pool?.symbol}</strong>
                                    </div>
                                    <div className="text-xs text-accent-60 space-y-1">
                                      <div className="flex gap-2 items-center">
                                        <div className="flex gap-1.5 items-center text-amber-600 dark:text-amber-400">
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width={14}
                                            height={14}
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="lucide lucide-variable"
                                          >
                                            <path d="M8 21s-4-3-4-9 4-9 4-9" />
                                            <path d="M16 3s4 3 4 9-4 9-4 9" />
                                            <line x1={15} x2={9} y1={9} y2={15} />
                                            <line x1={9} x2={15} y1={9} y2={15} />
                                          </svg>
                                          Basic {Number(pool?.type) == 0 ? "Stable" : "Volatile"}
                                        </div>
                                        <span className="text-accent-30 last:hidden">·</span>
                                        <div
                                          className="inline-block cursor-pointer"
                                        >
                                          <div className="hover:opacity-60 text-accent-50"> {Number(pool?.pool_fee) / 100} %</div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div
                                  className="inline-block cursor-pointer"
                                  data-testid="flowbite-tooltip-target"
                                >
                                  <div className="sm:text-right mt-6 sm:mt-0">
                                    <div className="text-xs pt-0.5 text-accent-40 pb-1">APR</div>
                                    <div className="text-sm"> --%</div>
                                  </div>
                                </div>

                              </div>
                              <div className="pt-8 text-sm">
                                <div className="flex flex-col gap-6 sm:flex-row justify-between">
                                  <div className="flex flex-col gap-1">
                                    <div className="pb-1 text-xs text-accent-40">Liquidity</div>
                                    <div
                                      className="inline-block cursor-pointer"
                                      data-testid="flowbite-tooltip-target"
                                    >
                                      <span
                                        data-testid=""
                                        data-test-amount="10752.29076765"
                                        className="tabular-nums"
                                      >
                                        {fromUnits(Number(pool?.reserve0), Number(token0?.decimals))}
                                        <span className="opacity-70">&nbsp;{token0?.symbol}</span>
                                      </span>
                                    </div>

                                    <div
                                      className="inline-block cursor-pointer"
                                      data-testid="flowbite-tooltip-target"
                                    >
                                      <span
                                        data-testid=""
                                        data-test-amount="13066.280655759369"
                                        className="tabular-nums"
                                      >
                                        {fromUnits(Number(pool?.reserve1), Number(token1?.decimals))}<span className="opacity-70">&nbsp;{token1?.symbol}</span>
                                      </span>
                                    </div>

                                  </div>
                                  <div className="flex flex-col gap-1 sm:text-right">
                                    <div className="pb-1 text-xs text-accent-40">Your Liquidity</div>
                                    <span data-testid="" data-test-amount={0} className="tabular-nums">
                                      0.0<span className="opacity-70">&nbsp;{token0?.symbol}</span>
                                    </span>
                                    <span data-testid="" data-test-amount={0} className="tabular-nums">
                                      0.0<span className="opacity-70">&nbsp;{token1?.symbol}</span>
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="py-2">
                          <div className="cardCstm p-3 md:p-5 rounded-xl bg-[#0b120d] relative border border-[#2a2a2a]">
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                className="form-check"
                                checked={isChecked}
                                onChange={() => setIsChecked(!isChecked)}
                              />
                              <p className="m-0">I understand I will NOT be able to withdraw incentives
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="py-2">
                          <div className="cardCstm p-3 md:p-5 rounded-xl bg-[#0b120d] relative border border-[#2a2a2a]">
                            <div className="flex flex-col gap-8 p-6">
                              <div className="flex flex-col sm:flex-row gap-6 justify-between sm:items-center text-accent-60">
                                <div className="w-full">
                                  <div className="text-accent-50 text-xs">Current Votes</div>
                                  <div className="pt-2 text-black dark:text-white text-sm"> 0</div>
                                </div>
                              </div>
                              <div><hr className="border-[#303030]" /></div>
                              <div className="pb-2">
                                <div className="space-y-3" data-testid="briber-input">
                                  <div className="flex justify-between items-center px-2">
                                    <div className="text-sm font-semibold">Your Incentive</div>
                                    <div className="text-xs text-right flex gap-3 items-center">
                                      <button className="flex items-center gap-1.5 transition">
                                        <div className="hidden sm:block text-accent-50">Balance</div>
                                        {token?.balance} {token?.symbol}
                                      </button>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3 sm:gap-5 p-4 sm:p-5 border border-accent-30 rounded-xl">
                                    <button
                                      data-testid="token-select-button-briber-input"
                                      className="flex items-center justify-between gap-2 sm:gap-3 hover:opacity-80 transition rounded-2xl p-4 text-xs sm:text-sm font-semibold bg-accent-10 shrink-0"
                                      onClick={() => setTokenBeingSelected("token")}
                                    >
                                      <div className="flex items-center gap-2 sm:gap-3">
                                        <Logo
                                          chainId={chainId}
                                          token={token?.address}
                                          margin={0}
                                          height={20}
                                        />
                                        <span>{token?.symbol}</span>
                                      </div>
                                      {downArrow}
                                    </button>
                                    <div className="grow flex flex-col gap-1 justify-center">
                                      <input
                                        data-testid="briber-input-asset-input-elem"
                                        data-test-amount=""
                                        className="block w-full disabled:text-accent-50 placeholder:text-accent-30 bg-transparent outline-none font-semibold text-end h-7 sm:h-9 text-2xl sm:text-3xl"
                                        pattern="^[0-9]*[.,]?[0-9]*$"
                                        minLength={1}
                                        value={amount}
                                        onChange={(e) =>
                                          handleChange(e.target.value)
                                        }
                                      />
                                      <div className="text-end text-xs text-accent-50">$0.0</div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                            </div>
                          </div>
                        </div>
                      </div>


                      <div className="md:col-span-5 col-span-12">
                        <div className="cardCstm p-3 md:p-4 rounded-md bg-[var(--backgroundColor2)] opacity-70 relative h-full flex justify-between flex-col">
                          <div className="top">
                            <div className="top">
                              <h4 className="m-0 font-semibold text-xl">
                                Incentivize
                              </h4>
                            </div>
                            <div className="my-4">
                              Voting and adding incentives for this epoch ends in 7 days
                              and there will be 7,960,019.11
                              {gobV2[chainId || 8453].symbol} distributed to all liquidity providers. By providing an incentive, you draw more liquidity providers to this pool.
                            </div>

                            {amount && isChecked ? <div className="content pt-3">
                              <SwapList className="list-none py-3 relative z-10 pl-0 mb-0">
                                <Progress
                                  icon={pool?.gauge === ZeroAddress ? lock : unlock}
                                  symbol={pool?.symbol}
                                  text={
                                    pool?.gauge === ZeroAddress
                                      ? "Create gauge for this pool"
                                      : "Gauge found for this pool"
                                  }
                                />
                                <Progress
                                  icon={status.isAllowanceForToken ? unlock : lock}
                                  symbol={token?.symbol}
                                  text="Allowed the contracts to access"
                                />
                                <Progress
                                  icon={status.isRewardAdded ? unlock : lock}
                                  symbol={token?.symbol}
                                  text="Deposit reward"
                                />
                              </SwapList>

                              <div className="btnWrpper mt-3">
                                <ActButton
                                  label={
                                    pool?.gauge === ZeroAddress
                                      ? "Create Guage"
                                      : "Add Reward"
                                  }
                                  onClick={() =>
                                    pool?.gauge === ZeroAddress
                                      ? createGuage()
                                      : addReward()
                                  }
                                  load={
                                    pool?.gauge === ZeroAddress
                                      ? load["createGauge"]
                                      : load["addReward"]
                                  }
                                />
                              </div>
                            </div> :
                              <div className="content pt-3">
                                <SwapList className="list-none py-3 relative z-10 pl-0 mb-0">
                                  <Progress
                                    icon={lock}
                                    symbol={""}
                                    text="Please confirm that you acknowledge incentives cannot be withdrawn."
                                  />
                                  <Progress
                                    icon={lock}
                                    symbol={""}
                                    text="Select the token you want to use for the incentive."
                                  />
                                  <Progress
                                    icon={lock}
                                    symbol={""}
                                    text="Specify the amount of your incentive."
                                  />
                                </SwapList>
                              </div>}

                          </div>

                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
      }

    </>
  );
};

export default Incentivize;


const downIcn = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m6 9 6 6 6-6"></path>
  </svg>
);

const addIcn = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 240 240"
    fill="none"
  >
    <path
      d="M120 240C186.274 240 240 186.274 240 120C240 53.7261 186.274 0 120 0C53.7261 0 0 53.7261 0 120C0 186.274 53.7261 240 120 240Z"
      fill="#E5E7EB"
    />
    <path
      d="M120 240C186.274 240 240 186.274 240 120C240 53.7261 186.274 0 120 0C53.7261 0 0 53.7261 0 120C0 186.274 53.7261 240 120 240Z"
      fill="#E5E5E5"
    />
    <path
      d="M120 220C175.228 220 220 175.228 220 120C220 64.7717 175.228 20 120 20C64.7717 20 20 64.7717 20 120C20 175.228 64.7717 220 120 220Z"
      fill="#CACACA"
    />
    <path
      d="M120 200C164.183 200 200 164.183 200 120C200 75.8174 164.183 40 120 40C75.8174 40 40 75.8174 40 120C40 164.183 75.8174 200 120 200Z"
      fill="#E5E5E5"
    />
    <path
      d="M120 81L132.41 107.59L159 120L132.41 132.41L120 159L107.59 132.41L81 120L107.59 107.59L120 81Z"
      fill="#CACACA"
    />
  </svg>
);

const icn1 = (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" ><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="M9 12h6"></path></svg>
)

const downArrow = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={16}
    height={16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-chevron-down"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
)

const lock = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-lock !text-amber-600 animate-pulse"
  >
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

const unlock = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
  </svg>
);

const fadeInOut = keyframes`
  0% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.5;
  }
`;

const SwapList = styled.ul`
  &:after {
    position: absolute;
    content: "";
    top: 50%;
    left: 12px;
    z-index: -1;
    height: calc(100% - 40px);
    width: 1px;
    border-left: 1px dashed #525252;
    transform: translateY(-50%);
  }
  li:not(:last-child) {
    margin-bottom: 15px;
  }
  .animate {
    animation: ${fadeInOut} 2s infinite;
  }
`;