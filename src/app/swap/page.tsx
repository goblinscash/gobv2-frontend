"use client";
import { useEthersSigner } from "@/hooks/useEthersSigner";
import {
  allowance,
  approve,
  encodedRoute,
  erc20Balance,
  fetchAmountsOut,
} from "@/utils/web3.utils";
import { ethers } from "ethers";
import styled, { keyframes } from "styled-components";
import { useAccount, useChainId } from "wagmi";
import { tokens } from "@myswap/token-list";
import universalRouterAbi from "../../abi/aerodrome/universalRouter.json";
import { aerodromeContracts } from "@/utils/config.utils";
import { useCallback, useEffect, useState } from "react";
import { Token } from "../pools/page";
import { useSearchParams } from "next/navigation";
import { createPortal } from "react-dom";
import SelectTokenPopup from "@/components/modals/SelectTokenPopup";
import Logo from "@/components/common/Logo";
import { CommandType, RoutePlanner } from "@/utils/planner";
import { toUnits } from "@/utils/math.utils";
import axios from "axios";
//@ts-expect-error ignore
import debounce from "lodash.debounce";
import BtnLoader from "@/components/common/BtnLoader";
import { ROUTE_API_URI, stableTokens } from "@/utils/constant.utils";

interface SwapStep {
  from: string;
  to: string;
  stable: boolean;
}
interface QuoteData {
  data: SwapStep;
  command_type: string;
}

const Swap = () => {
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const [amountOut, setAmountOut] = useState("");
  const [load, setLoad] = useState<{ [key: string]: boolean }>({});

  const signer = useEthersSigner();
  const chainId = useChainId();
  const { address } = useAccount();

  const searchParams = useSearchParams();
  const [tokenBeingSelected, setTokenBeingSelected] = useState<
    "token0" | "token1" | null
  >(null);
  const [token0, setToken0] = useState<Token | null>(null);
  const [token1, setToken1] = useState<Token | null>(null);
  const [amount0, setAmount0] = useState<string>("");

  const [filteredTokenList, setFilteredTokenList] = useState([]);

  const handleTokenSelect = (token: Token) => {
    const newQueryParams = new URLSearchParams(searchParams.toString());
    if (tokenBeingSelected === "token0") {
      setAmount0("");
      setToken0(token);
      newQueryParams.set("token0", token.address);
    } else if (tokenBeingSelected === "token1") {
      setToken1(token);
      setAmount0("");
      newQueryParams.set("token1", token.address);
    }
    setTokenBeingSelected(null);
  };

  const setInitialToken = () => {
    let tokens_ = tokens.filter((item) => item.chainId == chainId);
    tokens_ = [...tokens_, ...stableTokens(chainId)];
    //@ts-expect-error ignore
    setFilteredTokenList(tokens_);
    if (tokens_?.length == 0) {
      setToken0(null);
      setToken1(null);
      return;
    }
    setToken0({
      address: tokens_[0].address,
      symbol: tokens_[0].symbol,
      decimals: tokens_[0].decimals,
      balance: 0
    });
    setToken1({
      address: tokens_[1].address,
      symbol: tokens_[1].symbol,
      decimals: tokens_[1].decimals,
      balance: 0
    });
  };

  const swapTokens = () => {
    if (!token0 || !token1) return;

    const newToken0 = { ...token1 };
    const newToken1 = { ...token0 };

    setToken0(newToken0);
    setToken1(newToken1);
    setAmountOut("")
    handleChange(amount0, newToken0, newToken1)
  };

  const handleLoad = (action: string, status: boolean) => {
    setLoad((prev) => ({ ...prev, [action]: status }));
  };

  useEffect(() => {
    if (chainId) {
      setInitialToken();
    }
  }, [chainId]);

  useEffect(() => {
    if (chainId && amount0 && token0) {
      checkAllownceStatus(chainId);
    }
  }, [amount0, token0]);

  useEffect(() => {
    if (chainId && token0?.address && token1?.address && address) {
      fetchTokenBalance()
    }

  }, [token0?.address, token1?.address, address]);


  const fetchQuote = async (
    tokenOne: string,
    tokenTwo: string,
    amount: number
  ) => {
    const params = {
      token0: tokenOne,
      token1: tokenTwo,
      chainId: chainId,
      amount: amount,
    };

    try {
      const response = await axios.get(ROUTE_API_URI, { params });
      return response.data;
    } catch (err) {
      console.error("Error fetching quote:", err);
    }
  };

  const fetchToken = useCallback(
    debounce(async (tokenOne: Token, tokenTwo: Token, value: number) => {
      handleLoad("FetchRoute", true);
      try {
        const quote = await fetchQuote(
          tokenOne.address,
          tokenTwo.address,
          value
        );
        if (quote?.data != null) {
          if (tokenOne.address === tokenTwo.address) {
            setAmountOut(amount0);
            setQuoteData(quote);
          }
          else if (quote.command_type === "V2_SWAP_EXACT_IN") {
            const outAmount = await fetchAmountsOut(
              chainId,
              value,
              tokenOne.decimals,
              tokenTwo.decimals,
              quote?.data
            );
            setAmountOut(outAmount);
            setQuoteData(quote);
          } else if (quote.command_type === "V3_SWAP_EXACT_IN") {
            setAmountOut("");
            setQuoteData(quote);
          }
        } else {
          setAmountOut("");
          setQuoteData(null);
        }
      } catch (err) {
        handleLoad("FetchRoute", false);
        console.error("Error in fetchRoute:", err);
        setQuoteData(null);
      } finally {
        handleLoad("FetchRoute", false);
      }
    }, 500),
    []
  );

  const handleChange = (value: string, token0_: Token, token1_: Token) => {
    setAmount0(value);
    if (!token0_ || !token1_) {
      console.error("Token0 or Token1 is missing");
      return;
    }

    if (parseFloat(value) > 0) {
      fetchToken(token0_, token1_, parseFloat(value));
    }
  };

  const checkAllownceStatus = async (chainId: number) => {
    if (!token0?.address || !address || !amount0) return
    const status0_ = await allowance(
      chainId,
      token0?.address,
      address,
      aerodromeContracts[chainId].universalRouter,
      Number(amount0),
      token0?.decimals
    );
    handleLoad(token0?.symbol, status0_);
  };

  const fetchTokenBalance = async () => {
    if (!token0?.address || !token1?.address || !address) return
    const balance0 = await erc20Balance(chainId, token0?.address, token0?.decimals, address)
    const balance1 = await erc20Balance(chainId, token1?.address, token1?.decimals, address)

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
  }


  //@ts-expect-error ignore
  const root: string[] = quoteData?.data?.length && quoteData?.data?.reduce((acc: string[], step: SwapStep) => {
    // Add the "from" address if it's not already in the array
    if (!acc.includes(step.from)) {
      acc.push(step.from);
    }
    // Add the "to" address if it's not already in the array
    if (!acc.includes(step.to)) {
      acc.push(step.to);
    }
    return acc;
  }, []);

  const rootLength = root?.length;

  const swap = async () => {
    try {
      if (quoteData?.command_type === undefined) return;
      if (token0?.address === undefined) return;
      if (!address) return;
      const decimal = token0?.decimals;
      //@ts-expect-error ignore warn
      const command = CommandType[quoteData?.command_type];
      const swapRoutes = quoteData?.data;
      const planner = new RoutePlanner();

      planner.addCommand(command, [
        address,
        toUnits(amount0, decimal),
        0,
        //@ts-expect-error ignore
        command == 0 ? encodedRoute(swapRoutes) : swapRoutes,
        address,
      ]);

      const { commands, inputs } = planner;

      handleLoad("Pending", true);
      const tx0Approve = await approve(
        token0?.address,
        await signer,
        aerodromeContracts[chainId].universalRouter,
        parseFloat(amount0),
        decimal
      );
      if (tx0Approve) {
        handleLoad("Pending", true);
        await tx0Approve.wait();
        await checkAllownceStatus(chainId);
        handleLoad("Pending", false);
      }
      handleLoad("Pending", false);

      const universalRouter = new ethers.Contract(
        aerodromeContracts[chainId].universalRouter,
        universalRouterAbi,
        await signer
      );

      const deadline = Math.floor(Date.now() / 1000) + 600;
      handleLoad("Pending", true);
      const tx = await universalRouter["execute(bytes,bytes[],uint256)"](
        commands,
        inputs,
        deadline,
        {
          value: 0,
          gasLimit: 500000,
        }
      );

      await tx.wait();
      handleLoad("Pending", false);
    } catch (error) {
      handleLoad("Pending", false);
      console.log(error, "error+");
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
      <section
        className="py-5 relative flex items-center justify-center"
        style={{ minHeight: "calc(100vh - 152px)" }}
      >
        <div className="container">
          <div className="grid gap-3 grid-cols-12">
            <div className="col-span-12">
              <div
                className="mx-auto grid gap-3 md:gap-5 grid-cols-12"
                style={{ maxWidth: 1000 }}
              >
                <div className="md:col-span-7 col-span-12">
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
                          <div
                            className="cursor-pointer left relative flex items-center gap-2 p-3 border-r border-gray-800 w-[180px]"
                            onClick={() => setTokenBeingSelected("token0")}
                          >
                            <span className="icn">
                              <Logo
                                chainId={chainId}
                                token={token0?.address}
                                margin={0}
                                height={20}
                              />
                            </span>
                            <span className="">{token0?.symbol}</span>
                            <span className="absolute right-2">
                              {downArrow}
                            </span>
                          </div>
                          <input
                            type="number"
                            className="form-control border-0 p-3 h-10 text-xs bg-transparent w-full"
                            value={amount0 ?? ""}
                            onChange={(e) => {
                              if (token0 && token1) {
                                handleChange(e.target.value, token0, token1);
                              }
                            }}
                          />
                        </div>
                      </div>
                      <div className="" style={{ margin: "-10px 0" }}>
                        <div className=" text-center">
                          <button
                            type="button"
                            onClick={() => swapTokens()}
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
                          <div
                            className="cursor-pointer left relative flex items-center gap-2 p-3 border-r border-gray-800 w-[180px]"
                            onClick={() => setTokenBeingSelected("token1")}
                          >
                            <span className="icn">
                              <Logo
                                chainId={chainId}
                                token={token1?.address}
                                margin={0}
                                height={20}
                              />
                            </span>
                            <span className="">{token1?.symbol}</span>
                            <span className="absolute right-2">
                              {downArrow}
                            </span>
                          </div>
                          <input
                            value={amountOut}
                            readOnly
                            className="form-control border-0 p-3 h-10 text-xs bg-transparent w-full"
                          />
                        </div>
                      </div>
                      <div className="py-2">
                        <div className="flex items-center justify-between relative h-[60px]">
                          {load["FetchRoute"] ? "fetching route" : "Route"}

                          {load["FetchRoute"] ? (
                            <div
                              className="absolute left-0 right-0 mx-auto top-[50%]"
                              style={{ maxWidth: "max-content" }}
                            >
                              <BtnLoader />
                            </div>
                          ) : (
                            <div className="flex items-start justify-center my-4 gap-2">
                              {root?.length
                                ? root.map((item: string, index: number) => (
                                  <div
                                    className="grow flex items-center justify-center"
                                    key={item}
                                  >
                                    <Logo
                                      chainId={chainId}
                                      token={item}
                                      margin={0}
                                      height={20}
                                    />{" "}
                                    {index + 1 != rootLength ? (
                                      <>
                                        <div className="relative grow flex justify-center items-center text-gray-600 dark:text-gray-400">
                                          <div className="relative z-20 rounded-full bg-[var(--backgroundColor)] p-px sm:p-1">
                                            <svg
                                              xmlns="http://www.w3.org/2000/svg"
                                              width={10}
                                              height={10}
                                              viewBox="0 0 24 24"
                                              fill="none"
                                              stroke="currentColor"
                                              strokeWidth={2}
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              className="lucide lucide-chevrons-right"
                                            >
                                              <path d="m6 17 5-5-5-5" />
                                              <path d="m13 17 5-5-5-5" />
                                            </svg>
                                          </div>

                                          <div className="absolute z-10 top-1.5 sm:top-2 border-t border-dashed border-gray-700 dark:border-gray-900 w-10/12" />
                                          {/* <div className="absolute z-10 top-6 border-r-2 border-gray-700 h-3" /> */}
                                          {/* <div className="absolute top-10">
                                        <div className="w-20 sm:w-28 text-[10px] md:text-xs bg-[var(--backgroundColor)] dark:bg-gray-850 px-3 py-2.5 rounded-md">
                                          <div className=" delay-75 text-center">
                                            {" "}
                                            0.05%<div>Stable</div>
                                          </div>
                                        </div>
                                      </div> */}
                                        </div>
                                      </>
                                    ) : (
                                      ""
                                    )}
                                  </div>
                                ))
                                : "No route found"}
                            </div>
                          )}
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
                <div className="md:col-span-5 col-span-12">
                  <div className="cardCstm h-full flex flex-col justify-between p-3 md:p-10 rounded-xl bg-[var(--backgroundColor2)] opacity-70 relative">
                    <div className="top w-full">
                      <h4 className="m-0 font-semibold text-xl">Swap</h4>
                      <div className="content pt-3">
                        <SwapList className="list-none py-3 relative z-10 pl-0 mb-0">
                          {amountOut && (
                            <li className="py-1 flex itmes-start gap-3 ">
                              <span className="flex bg-[var(--backgroundColor)] h-6 w-6 text-green-500 items-center justify-center rounded-full">
                                {calculate}
                              </span>
                              <div className="content text-xs text-gray-400">
                                <p className="m-0">
                                  Exchange rate found...{" "}
                                  <button className="border-0 p-0">
                                    Refresh
                                  </button>
                                </p>
                                <p className="m-0 flex items-center mt-1 gap-1 font-medium">
                                  1 {token0?.symbol} {exchange} {amountOut}{" "}
                                  {token1?.symbol}
                                </p>
                              </div>
                            </li>
                          )}
                          {/* <li className="py-1 flex itmes-start gap-3 ">
                          <span className="flex bg-[var(--backgroundColor)] h-6 w-6 text-green-500 items-center justify-center rounded-full">
                            {plus}
                          </span>
                          <div className="content text-xs text-gray-400">
                            <p className="m-0">
                              1.0% slippage applied...
                              <button className="border-0 p-0">Adjust</button>
                            </p>
                          </div>
                        </li>
                        <li className="py-1 flex itmes-start gap-3 ">
                          <span className="flex bg-[var(--backgroundColor)] h-6 w-6 text-green-500 items-center justify-center rounded-full">
                            {icn}
                          </span>
                          <div className="content text-xs text-gray-400">
                            <p className="m-0">
                              Minimum received 2,503.03 AERO
                            </p>
                          </div>
                        </li>
                        <li className="py-1 flex itmes-start gap-3 ">
                          <span className="flex bg-[var(--backgroundColor)] h-6 w-6 text-green-500 items-center justify-center rounded-full">
                            {check}
                          </span>
                          <div className="content text-xs text-gray-400">
                            <p className="m-0">0.61814% price impact is safe</p>
                          </div>
                        </li> */}
                          <li className="py-1 flex itmes-start gap-3 ">
                            <span className="flex bg-[var(--backgroundColor)] h-6 w-6 text-green-500 items-center justify-center rounded-full">
                              {load[token0?.symbol || ""] ? unlock : lock}
                            </span>
                            <div className="content text-xs text-gray-400">
                              <p className="m-0">
                                {load[token0?.symbol || ""]
                                  ? "Allowed"
                                  : "Allow"}{" "}
                                the contracts to access {token0?.symbol}
                              </p>
                            </div>
                          </li>
                          {load["Pending"] && (
                            <li className="py-1 flex itmes-start gap-3 ">
                              <span className="flex bg-[var(--backgroundColor)] h-6 w-6 text-yellow-500 items-center justify-center rounded-full">
                                {waiting}
                              </span>
                              <div className="content text-xs text-gray-400">
                                <p className="m-0 animate">
                                  Waiting for pending actions...
                                </p>
                              </div>
                            </li>
                          )}
                        </SwapList>
                      </div>
                    </div>
                    <div className="btnWrpper mt-3">
                      <button
                        disabled={load["Pending"]}
                        onClick={swap}
                        className="btn flex items-center font-medium justify-center w-full rounded btn commonBtn"
                      >
                        Swap {token0?.symbol} for {token1?.symbol}
                      </button>
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

export default Swap;

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

const calculate = (
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
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
    <line x1="3" x2="21" y1="9" y2="9"></line>
    <line x1="3" x2="21" y1="15" y2="15"></line>
    <line x1="9" x2="9" y1="9" y2="21"></line>
    <line x1="15" x2="15" y1="9" y2="21"></line>
  </svg>
);

const exchange = (
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
    <path d="m16 3 4 4-4 4"></path>
    <path d="M20 7H4"></path>
    <path d="m8 21-4-4 4-4"></path>
    <path d="M4 17h16"></path>
  </svg>
);

// const plus = (
//   <svg
//     xmlns="http://www.w3.org/2000/svg"
//     width="12"
//     height="12"
//     viewBox="0 0 24 24"
//     fill="none"
//     stroke="currentColor"
//     strokeWidth="2"
//     strokeLinecap="round"
//     strokeLinejoin="round"
//   >
//     <path d="M12 3v14"></path>
//     <path d="M5 10h14"></path>
//     <path d="M5 21h14"></path>
//   </svg>
// );

// const icn = (
//   <svg
//     xmlns="http://www.w3.org/2000/svg"
//     width="12"
//     height="12"
//     viewBox="0 0 24 24"
//     fill="none"
//     stroke="currentColor"
//     strokeWidth="2"
//     strokeLinecap="round"
//     strokeLinejoin="round"
//   >
//     <circle cx="8" cy="8" r="6"></circle>
//     <path d="M18.09 10.37A6 6 0 1 1 10.34 18"></path>
//     <path d="M7 6h1v4"></path>
//     <path d="m16.71 13.88.7.71-2.82 2.82"></path>
//   </svg>
// );

// const check = (
//   <svg
//     xmlns="http://www.w3.org/2000/svg"
//     width="12"
//     height="12"
//     viewBox="0 0 24 24"
//     fill="none"
//     stroke="currentColor"
//     strokeWidth="2"
//     strokeLinecap="round"
//     strokeLinejoin="round"
//   >
//     <polyline points="20 6 9 17 4 12"></polyline>
//   </svg>
// );

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

const waiting = (
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
    <path d="M5 22h14"></path>
    <path d="M5 2h14"></path>
    <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"></path>
    <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"></path>
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
