"use client";
import React, { useEffect, useState } from "react";
import { useEthersSigner } from "@/hooks/useEthersSigner";
import { useAccount, useChainId } from "wagmi";
import ActButton from "@/components/common/ActButton";
import { fromUnits, toUnits } from "@/utils/math.utils";
import {
  allowance,
  approve,
  erc20Balance,
  fetchTokenDetails,
} from "@/utils/web3.utils";
import { aerodromeContracts } from "@/utils/config.utils";
import aerodromeRouterAbi from "../../abi/aerodromeRouter.json";
import bribeVotingRewardAbi from "../../abi/aerodrome/bribeVotingReward.json";
import voterAbi from "../../abi/aerodrome/voter.json";
import { ethers, ZeroAddress } from "ethers";
import styled, { keyframes } from "styled-components";
import { useSearchParams } from "next/navigation";
import { Token } from "../pools/page";
import Logo from "@/components/common/Logo";
import { byIndex, FormattedPool } from "@/utils/sugar.utils";
import Progress from "@/components/common/Progress";
import SelectTokenPopup from "@/components/modals/SelectTokenPopup";
import { createPortal } from "react-dom";
import { tokens } from "@myswap/token-list";
import { stableTokens } from "@/utils/constant.utils";

const Deposit = () => {
  const [load, setLoad] = useState<{ [key: string]: boolean }>({});
  const signer = useEthersSigner();
  const chainId = useChainId();
  const { address } = useAccount();

  const searchParams = useSearchParams();
  const token0Address = searchParams.get("token0");
  const token1Address = searchParams.get("token1");
  const id = searchParams.get("id");
  const stable = searchParams.get("stable");

  const [token0, setToken0] = useState<Token | null>(null);
  const [token1, setToken1] = useState<Token | null>(null);
  const [token, setToken] = useState<Token | null>(null);
  const [amount0, setAmount0] = useState("");
  const [amount1, setAmount1] = useState("");
  const [amount, setAmount] = useState("");
  const [pool, setPool] = useState<FormattedPool | null>(null);

  const [tokenBeingSelected, setTokenBeingSelected] = useState<
    "token0" | "token1" | null
  >(null);
  const [filteredTokenList, setFilteredTokenList] = useState([]);

  const [status, setStatus] = useState<{ [key: string]: boolean }>({
    isTokenSelected: false,
    isAllowanceForToken0: false,
    isAllowanceForToken1: false,
    isCompleted: false,
    createGauge: false,
    isRewardAdded: false,
    isAllowanceForToken: false,
  });

  const handleTokenSelect = (token: Token) => {
    if (tokenBeingSelected === "token0") {
      setAmount("");
      setToken(token);
    } else if (tokenBeingSelected === "token1") {
      setToken(token);
      setAmount("");
    }
    setTokenBeingSelected(null);
  };

  const handleChange = (value: string) => {
    setAmount(value);
  };

  const setInitialToken = () => {
    let tokens_ = tokens.filter((item) => item.chainId == chainId);
    tokens_ = [...tokens_, ...stableTokens(chainId)];
    //@ts-expect-error ignore warning
    setFilteredTokenList(tokens_);
    if (tokens_?.length == 0) {
      setToken(null);
      return;
    }
    setToken({
      address: tokens_[0].address,
      symbol: tokens_[0].symbol,
      decimals: tokens_[0].decimals,
      balance: 0,
    });
  };

  useEffect(() => {
    if (chainId) {
      setInitialToken();
    }
  }, [chainId]);

  useEffect(() => {
    if (chainId && token0Address && token1Address) {
      fetchToken(chainId, token0Address, token1Address);
    }
  }, [searchParams, chainId]);

  useEffect(() => {
    if (chainId && id) {
      fetchPoolByIndex(chainId, Number(id));
    }
  }, [searchParams, chainId, id]);

  useEffect(() => {
    if (chainId && amount0 && amount1 && token0 && token1) {
      checkAllownceStatus(chainId);
    }
  }, [chainId, amount0, amount1, token0]);

  useEffect(() => {
    if (
      chainId &&
      token0?.address &&
      token1?.address &&
      address &&
      token0.balance == 0 &&
      token1.balance == 0
    ) {
      fetchTokenBalance();
    }
  }, [chainId, token0?.address, token1?.address, address]);

  useEffect(() => {
    if (chainId && token?.address && address) {
      fetchRewardTokenBalance();
    }
  }, [chainId, token?.address, address]);

  const fetchToken = async (
    chainId: number,
    token0: string,
    token1: string
  ) => {
    const token_ = await fetchTokenDetails(chainId, token0);
    setToken0(token_);
    const _token = await fetchTokenDetails(chainId, token1);
    setToken1(_token);
  };

  const handProgress = (action: string, status: boolean) => {
    setStatus((prev) => ({ ...prev, [action]: status }));
  };

  const handleLoad = (action: string, status: boolean) => {
    setLoad((prev) => ({ ...prev, [action]: status }));
  };

  const fetchPoolByIndex = async (chainId: number, index: number) => {
    const pool_ = await byIndex(chainId, index);
    //@ts-expect-error ignore warn
    setPool(pool_);
  };

  const fetchTokenBalance = async () => {
    if (!token0?.address || !token1?.address || !address) return;
    const balance0 = await erc20Balance(
      chainId,
      token0?.address,
      token0?.decimals,
      address
    );
    const balance1 = await erc20Balance(
      chainId,
      token1?.address,
      token1?.decimals,
      address
    );

    if (token0 && token0.address) {
      setToken0({
        ...token0,
        balance: Number(balance0),
      });
    }

    if (token1 && token1.address) {
      setToken1({
        ...token1,
        balance: Number(balance1),
      });
    }
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

  const checkAllownceStatus = async (chainId: number) => {
    if (!token0?.address || !address || !amount0 || !token1?.address) return;
    const status0_ = await allowance(
      chainId,
      token0?.address,
      address,
      aerodromeContracts[chainId].router,
      Number(amount0),
      token0?.decimals
    );
    handProgress("isAllowanceForToken0", status0_);
    const status1_ = await allowance(
      chainId,
      token1?.address,
      address,
      aerodromeContracts[chainId].router,
      Number(amount1),
      token1?.decimals
    );
    handProgress("isAllowanceForToken1", status1_);
  };

  const swapTokens = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!token0 || !token1) return;

    const newToken0 = { ...token1 };
    const newToken1 = { ...token0 };

    setToken0(newToken0);
    setToken1(newToken1);
  };

  const addLiquidity = async () => {
    try {
      if (!address) return alert("Please connect your wallet");
      if (!amount0 || !amount1 || !token0 || !token1) return;

      handleLoad("addLiquidity", true);
      const amount0Desired = toUnits(amount0, token0?.decimals);
      const amount1Desired = toUnits(amount1, token1?.decimals);
      const amount0Min = 0;
      const amount1Min = 0;
      const to = address;
      const deadline = Math.floor(Date.now() / 1000) + 600;

      const tx0Approve = await approve(
        token0.address,
        await signer,
        aerodromeContracts[chainId].router,
        Number(amount0),
        token0.decimals
      );
      if (tx0Approve) {
        await tx0Approve.wait();
        handProgress("isAllowanceForToken0", true);
      }

      const tx1Approve = await approve(
        token1.address,
        await signer,
        aerodromeContracts[chainId].router,
        Number(amount1),
        token1.decimals
      );
      if (tx1Approve) {
        await tx1Approve.wait();
        handProgress("isAllowanceForToken1", true);
      }

      const aerodromeRouter = new ethers.Contract(
        aerodromeContracts[chainId].router,
        aerodromeRouterAbi,
        await signer
      );

      const tx = await aerodromeRouter.addLiquidity(
        token0.address,
        token1.address,
        stable,
        amount0Desired,
        amount1Desired,
        amount0Min,
        amount1Min,
        to,
        deadline,
        { gasLimit: 5000000 }
      );

      await tx.wait();
      await fetchPoolByIndex(chainId, Number(id));
      handProgress("isCompleted", true);

      handleLoad("addLiquidity", false);
    } catch (error) {
      console.log(error);
      handleLoad("addLiquidity", false);
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
      await fetchPoolByIndex(chainId, Number(id));
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
      await fetchPoolByIndex(chainId, Number(id));
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

      <section className="relative py-5 ">
        <div className="container">
          <div className="grid gap-3 grid-cols-12">
            <div className="col-span-12">
              <div
                className="mx-auto grid gap-3 md:gap-5 grid-cols-12 items-start"
                style={{ maxWidth: 1000 }}
              >
                <div className="md:col-span-5 col-span-12 md:sticky top-0">
                  <div className="cardCstm p-3 md:p-4 rounded-md bg-[var(--backgroundColor2)] opacity-70 relative">
                    <div className="top">
                      <h4 className="m-0 font-semibold text-xl">
                        Deposit Liquidity
                      </h4>
                    </div>
                    <div className="content pt-3">
                      <SwapList className="list-none py-3 relative z-10 pl-0 mb-0">
                        <Progress
                          icon={amount0 == "" ? lock : unlock}
                          symbol={token0?.symbol}
                          text="Enter the amount of"
                        />
                        <Progress
                          icon={status.isAllowanceForToken0 ? unlock : lock}
                          symbol={token0?.symbol}
                          text="Allowed the contracts to access"
                        />
                        <Progress
                          icon={status.isAllowanceForToken1 ? unlock : lock}
                          symbol={token1?.symbol}
                          text="Allowed the contracts to access"
                        />
                        <Progress
                          icon={status.isCompleted ? unlock : lock}
                          symbol={token1?.symbol}
                          text="Deposit Liqidity"
                        />
                      </SwapList>
                      <div className="btnWrpper mt-3">
                        <ActButton
                          label="addLiquidity"
                          onClick={() => addLiquidity()}
                          load={load["addLiquidity"]}
                        />
                      </div>
                    </div>

                    <div className="content pt-3">
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
                        <div className="md:col-span-7 col-span-12">
                          <div className="cardCstm p-3 md:p-4 rounded-md bg-[var(--backgroundColor2)] relative">
                            <form action="">
                              <div className="py-2">
                                <div className="flex items-center justify-between gap-3">
                                  <span className="font-medium text-base">
                                    Add Reward
                                  </span>
                                  <span className="opacity-60 font-light text-xs">
                                    Available {token?.balance} {token?.symbol}
                                  </span>
                                </div>
                                <div className="flex border border-gray-800 rounded mt-1">
                                  <div
                                    className="cursor-pointer left relative flex items-center gap-2 p-3 border-r border-gray-800 w-[180px]"
                                    onClick={() =>
                                      setTokenBeingSelected("token0")
                                    }
                                  >
                                    <span className="icn">
                                      <Logo
                                        chainId={chainId}
                                        token={token?.address}
                                        margin={0}
                                        height={20}
                                      />
                                    </span>
                                    <span className="">{token?.symbol}</span>
                                    <span className="absolute right-2">
                                      {downArrow}
                                    </span>
                                  </div>
                                  <input
                                    type="number"
                                    className="form-control border-0 p-3 h-10 text-xs bg-transparent w-full"
                                    value={amount}
                                    onChange={(e) =>
                                      handleChange(e.target.value)
                                    }
                                  />
                                </div>
                              </div>
                            </form>
                          </div>
                        </div>

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
                    </div>
                    
                  </div>
                </div>
                <div className="md:col-span-7 col-span-12 md:sticky top-0">
                  <div className="py-2">
                    <div className="cardCstm p-3 md:p-10 rounded-2xl bg-[#0b120d] relative border border-[#2a2a2a]">
                      <form action="">
                        <div className="bg-[#00000073] py-5 px-3 rounded-2xl border border-[#141414]">
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-medium text-base">Swap</span>
                            <span className="opacity-60 font-light text-xs">
                              Available {token0?.balance} {token0?.symbol}
                            </span>
                          </div>
                          <div className="flex rounded mt-1">
                            <div className="left relative flex items-center gap-2 p-3 border-r border-gray-800 w-[180px]">
                              <span className="icn">
                                {token0Address ? (
                                  <Logo
                                    chainId={chainId}
                                    token={token0Address}
                                    margin={0}
                                    height={20}
                                  />
                                ) : (
                                  ""
                                )}{" "}
                              </span>
                              <span className="">{token0?.symbol}</span>
                            </div>
                            <input
                              onChange={(e) => setAmount0(e.target.value)}
                              value={amount0}
                              type="number"
                              className="form-control border-0 p-3 h-10 text-xs bg-transparent w-full"
                            />
                          </div>
                        </div>
                        <div className="" style={{ margin: "-10px 0" }}>
                          <div className="text-center">
                            <button
                              onClick={(e) => swapTokens(e)}
                              className="border-0 p-2 text-black rounded bg-[#18b347]"
                            >
                              {transfer}
                            </button>
                          </div>
                        </div>
                        <div className="bg-[#00000073] py-5 px-3 rounded-2xl border border-[#141414]">
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-medium text-base">For</span>
                            <span className="opacity-60 font-light text-xs">
                              Available {token1?.balance} {token1?.symbol}
                            </span>
                          </div>
                          <div className="flex rounded mt-1">
                            <div className="left relative flex items-center gap-2 p-3 border-r border-gray-800 w-[180px]">
                              <span className="icn">
                                {token1Address ? (
                                  <Logo
                                    chainId={chainId}
                                    token={token1Address}
                                    margin={0}
                                    height={20}
                                  />
                                ) : (
                                  ""
                                )}{" "}
                              </span>
                              <span className="">{token1?.symbol}</span>
                            </div>
                            <input
                              onChange={(e) => setAmount1(e.target.value)}
                              value={amount1}
                              type="number"
                              className="form-control border-0 p-3 h-10 text-xs bg-transparent w-full"
                            />
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                  <div className="py-2">
                    <div className="cardCstm p-3 md:p-4 rounded-md bg-[var(--backgroundColor2)] relative">
                      <div className="py-2">
                        <div className="flex items-center justify-between gap-3">
                          <div className="left flex items-center gap-3">
                            <div className="flex-shrink-0">
                              <ul className="list-none pl-0 mb-0 flex items-center">
                                <li className="" style={{ marginLeft: -10 }}>
                                  {token0Address ? (
                                    <Logo
                                      chainId={chainId}
                                      token={token0Address}
                                      margin={0}
                                      height={25}
                                    />
                                  ) : (
                                    ""
                                  )}
                                </li>
                                <li className="" style={{ marginLeft: -10 }}>
                                  {token1Address ? (
                                    <Logo
                                      chainId={chainId}
                                      token={token1Address}
                                      margin={0}
                                      height={25}
                                    />
                                  ) : (
                                    ""
                                  )}
                                </li>
                              </ul>
                            </div>
                            <div className="content">
                              <p className="m-0 font-medium text-white">
                                {pool?.symbol}
                              </p>
                              <ul className="list-none pl-0 mb-0 flex items-center gap-2">
                                <li className="text-yellow-500 text-xs">
                                  (x) Basic Volatile
                                </li>
                                <li className="text-xs flex items-center gap-2">
                                  {Number(pool?.pool_fee) / 100}% {infoIcn}
                                </li>
                              </ul>
                            </div>
                          </div>
                          <div className="right text-right">
                            <p className="m-0 text-gray-500 text-xs">APR</p>
                            <p className="m-0 text-white text-base font-bold">
                              {pool?.apr}%
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="py-2">
                        <ul className="list-none pl-0 mb-0">
                          <li className="py-1 flex items-center justify-between gap-2">
                            <p className="m-0 text-gray-500 text-xs">
                              Liquidity
                            </p>
                            <p className="m-0 text-gray-500 text-xs">
                              Your Liquidity
                            </p>
                          </li>
                          <li className="py-1 flex items-center justify-between gap-2">
                            <p className="m-0 text-white text-base font-bold">
                              {pool?.reserve0
                                ? fromUnits(
                                  pool?.reserve0,
                                  Number(token0?.decimals)
                                )
                                : "0"}{" "}
                              {token0?.symbol}
                            </p>
                            <p className="m-0 text-white text-base font-bold">
                              0.0 {token0?.symbol}
                            </p>
                          </li>
                          <li className="py-1 flex items-center justify-between gap-2">
                            <p className="m-0 text-white text-base font-bold">
                              {pool?.reserve1
                                ? fromUnits(
                                  pool?.reserve1,
                                  Number(token1?.decimals)
                                )
                                : "0"}{" "}
                              {token1?.symbol}
                            </p>
                            <p className="m-0 text-white text-base font-bold">
                              0.0 {token1?.symbol}
                            </p>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Deposit;

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

const downArrow = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
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

const transfer = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m21 16-4 4-4-4"></path>
    <path d="M17 20V4"></path>
    <path d="m3 8 4-4 4 4"></path>
    <path d="M7 4v16"></path>
  </svg>
);

const infoIcn = (
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
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M12 16v-4"></path>
    <path d="M12 8h.01"></path>
  </svg>
);
