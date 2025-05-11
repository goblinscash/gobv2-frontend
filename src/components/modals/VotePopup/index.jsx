"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Logo from "@/components/common/Logo";
import { formatTimestamp, fromUnits, toUnits } from "@/utils/math.utils";
import { gobV2 } from "@/utils/constant.utils";
import ListLayout from "@/components/lockRow";
import { useEthersSigner } from "@/hooks/useEthersSigner";
import { useAccount } from "wagmi";
import Notify from "@/components/common/Notify";
import voterAbi from "../../../abi/aerodrome/voter.json"
import { aerodromeContracts } from "@/utils/config.utils";
import { ethers } from "ethers";
import ActButton from "@/components/common/ActButton";
import { toast } from "react-toastify";

const VotePopup = ({ chainId, vote, setVote, data, setData }) => {
  const handleVote = () => {
    setVote(!vote);
  };
  const [load, setLoad] = useState({});
  const signer = useEthersSigner();
  const { address } = useAccount();

  const [selectedNft, setSelectedNft] = useState({})

  const clearNft = (nftId) => {
    setData((prevLocks) =>
      prevLocks.map((lock) =>
        Number(lock.id) === nftId ? { ...lock, pool: [] } : lock
      )
    );
  };

  const handleSelectPool = (nftId, poolAddress, percentage) => {
    setSelectedNft((prev) => {
      let nft = prev[nftId] || { total: 100, pool: [], percentage: [] };

      const poolIndex = nft.pool.indexOf(poolAddress);
      let currentTotalUsed = nft.percentage.reduce((sum, p) => sum + p, 0);
      let newTotalAvailable = 100 - currentTotalUsed;

      if (poolIndex !== -1) {
        // ✅ Pool exists, update its percentage
        const newPercentages = [...nft.percentage];
        const oldPercentage = newPercentages[poolIndex];

        // Calculate the new total allocation
        let newTotalUsed = currentTotalUsed - oldPercentage + percentage;

        if (newTotalUsed > 100) {
          toast.warn("Total allocation cannot exceed 100%")
          return prev; // Prevent update
        }

        newPercentages[poolIndex] = percentage; // Update the percentage

        return {
          ...prev,
          [nftId]: {
            ...nft,
            percentage: newPercentages,
            total: 100 - newTotalUsed, // ✅ Update remaining percentage
          },
        };
      } else {
        // ✅ Pool doesn't exist, check if there's enough remaining percentage
        if (percentage > newTotalAvailable) {
          toast.warn("Not enough remaining percentage to allocate")
          return prev; // Prevent adding this pool
        }

        return {
          ...prev,
          [nftId]: {
            ...nft,
            pool: [...nft.pool, poolAddress],
            percentage: [...nft.percentage, percentage], // ✅ Ensuring array length matches
            total: newTotalAvailable - percentage, // ✅ Update remaining percentage
          },
        };
      }
    });
  };


  const handleLoad = (action, status) => {
    setLoad((prev) => ({ ...prev, [action]: status }));
  };

  useEffect(() => {
    setSelectedNft((prev) => {
      const updatedState = { ...prev };

      data.forEach((item) => {
        if (!updatedState[item.id]) {
          updatedState[item.id] = { total: 100, pool: [], percentage: [] };
        }
      });

      return updatedState;
    });
  }, [data]);

  const vote_ = async (id) => {
    try {
      if (!address) return alert("Please connect your wallet");
      handleLoad(id, true);

      const voter = new ethers.Contract(
        aerodromeContracts[chainId].voter,
        voterAbi,
        await signer
      );

      const tx = await voter.vote(
        id,
        selectedNft[id].pool,
        selectedNft[id].percentage.map((item) => toUnits(item, 18)),
        { gasLimit: 5000000 }
      );

      await tx.wait();
      Notify({ chainId, txhash: tx.hash });
      handleLoad(id, false);
    } catch (error) {
      console.log(error);
      handleLoad(id, false);
    }
  };


  const column = [
    {
      head: "Pools",
      accessor: "Pools",
      component: (item) => {
        return (
          <div>
            <div className="flex items-center gap-3 border-b pb-3 border-[#2a2a2a] mb-3">
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
                </li>{" "}
                <li className="" style={{ marginLeft: -10 }}>
                  <div className="flex-shrink-0 flex items-center shadow-sm border border-gray-800 justify-center rounded-full bg-[#000] p-1">
                    <Logo
                      chainId={item.chainId}
                      token={item.token1}
                      margin={0}
                      height={20}
                    />
                  </div>
                </li>
              </ul>
              <div className="content">
                <p className="m-0 text-muted">{item.symbol}</p>
                <div className="flex items-center gap-2 mt-2 ">
                  <p className="m-0 text-xs text-yellow-500">
                    <span className="me-2"> (x)</span> Basic{" "}
                    {Number(item.type) == 0 ? "Stable" : "Volatile"}
                  </p>
                  {item.pool_fee}
                </div>
              </div>
            </div>
            <p className="m-0 text-[#757575] pt-2 text-xs">
              TVL ~{item.poolBalance}
            </p>
          </div>
        );
      },
    },
    {
      head: "Fees",
      accessor: "fees",
      component: (item) => {
        const symbol = item.symbol?.split("-")[1]?.split("/");
        return (
          <div className="rounded p-3 bg-[#091616] text-xs h-full pb-5 text-right min-w-[200px]">
            <p className="m-0 pb-3 border-b border-[#2a2a2a]">~$ --</p>
            <div className="pt-3">
              <p className="m-0 text-[#7e7e7e] ">
                {fromUnits(Number(item.token0_fees), Number(item.decimals))} {symbol[0]}
              </p>
              <p className="m-0 text-[#7e7e7e] ">
                {fromUnits(Number(item.token1_fees), Number(item.decimals))} {symbol[1]}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      head: "Incentives",
      accessor: "incentives",
      component: () => {
        return (
          <div className="rounded p-3 bg-[#091616] text-xs h-full pb-5 text-right min-w-[200px]">
            <p className="m-0 pb-3 border-b border-[#2a2a2a]">
              No available incentives
            </p>
            <Link href="/incentivize" className="m-0 text-blue-500 pt-3">
              Add incentives
            </Link>
          </div>
        );
      },
    },
    {
      head: "Total Reward",
      accessor: "Total_Reward",
      component: (item) => {
        const nftData = selectedNft[item.nftId] || { total: 100, pool: [], percentage: [] };
        const poolIndex = nftData.pool.indexOf(item.lp);
        const existingPercentage = poolIndex !== -1 ? nftData.percentage[poolIndex] : 0;

        const [inputValue, setInputValue] = useState(existingPercentage.toString());

        const handleInputChange = (e) => {
          let value = e.target.value;

          // Ensure only numbers are entered
          if (!/^\d*$/.test(value)) return;

          let percentage = Number(value);

          // Ensure percentage is within 0-100 range
          if (percentage > 100) {
            percentage = 100;
          }

          setInputValue(value);
          handleSelected(value)
        };

        const handleSelected = (inputValue_) => {
          let percentage = Number(inputValue_);
          if (percentage >= 0 && percentage <= 100) {
            handleSelectPool(Number(item.nftId), item.lp, percentage);
          }
        };

        const handleBlur = () => {
          let percentage = Number(inputValue);
          if (percentage >= 0 && percentage <= 100) {
            handleSelectPool(Number(item.nftId), item.lp, percentage);
          }
        };

        return (
          <div className="rounded p-3 bg-[#091616] text-xs h-full pb-5 text-right min-w-[200px]">
            <div className="top mb-4 flex items-center justify-center gap-3">
              <div className="">
                <p className="m-0 text-xs">Voting Power</p>
                <p className="m-0 text-xs">{0} {gobV2[chainId || 8453]?.symbol}</p>
              </div>
              <div className="relative">
                <span className="absolute icn right-2 top-[50%]  transform translate-y-[-50%]">
                  %
                </span>
                <input
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className="form-control rounded-xl border border-[#3c3c3c] text-xs bg-transparent max-w-[150px] p-3"
                />
              </div>
            </div>
            <div className="bottom pt-4">
              <ul className="list-none pl-0 mb-0 flex items-center justify-center gap-2">
                {[0, 10, 25, 50, 75, 100].map((percent) => (
                  <li key={percent} className="">
                    <button
                      className="p-1 text-xs bg-[#000e0e] rounded-xl px-3"
                      onClick={() => {
                        setInputValue(percent.toString());
                        handleSelectPool(Number(item.nftId), item.lp, percent);
                      }}
                    >
                      {percent}%
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <div className="fixed z-[9999] inset-0 flex items-center justify-center cstmModal">
      <div className="absolute inset-0 bg-black z-[9] opacity-70"></div>
      <div className="modalDialog relative p-4 px-lg-5 mx-auto rounded-lg z-[9999] bg-[#272625] w-full max-w-[1200px] overflow-scroll">
        <div className="top border-b border-[#3c3c3c] flex items-center justify-between pb-3">
          <h6 className="m-0 font-semibold text-xl">Vote</h6>
          <button onClick={handleVote} className="border-0 p-0 ">
            {cross}
          </button>
        </div>
        <div className="modalBody pt-3">
          {data ? data.map((item) => (
            <div className="py-2" key={item.id}>
              <div className="sticky top-0 z-[999]">
                <div className="cardCstm p-3 rounded-xl bg-[#0b120d] relative border border-[#2a2a2a] flex items-center justify-between  gap-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-shrink-0 flex items-center shadow-sm border border-gray-800 justify-center rounded-full bg-[#000] p-1">
                      <Logo
                        chainId={chainId}
                        token={item.token}
                        margin={0}
                        height={20}
                      />
                    </div>
                    <div className="content">
                      <h6 className="m-0 text-white text-xs font-medium flex items-center gap-1">
                        Lock #{item.id} <span className="icn">{lockIcn}</span>
                      </h6>
                      <div className="flex items-center gap-3">
                        <p className="m-0 text-[10px]">
                          {fromUnits(Number(item.amount), Number(item.decimals))} {gobV2[chainId || 8453]?.symbol}
                          {"  "}{item.expires_at === "0" ? "-" : formatTimestamp(Number(item.expires_at))}
                        </p>
                        <ul className="list-none pl-0 mb-0 flex items-center gap-2">
                          <li className="">
                            <Link
                              href={`lock?increase=true&id=${item.id}`}
                              className="themeClr text-[10px] font-medium"
                            >
                              Increase
                            </Link>
                          </li>
                          <li className="">
                            <Link
                              href={`lock?extend=true&id=${item.id}`}
                              className="themeClr text-[10px] font-medium"
                            >
                              Extend
                            </Link>
                          </li>
                          <li className="">
                            <button
                              onClick={() => clearNft(Number(item.id))}
                              className="themeClr text-[10px] font-medium"
                            >
                              Clear Votes
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="right text-right">
                    <p className="m-0 text-base">
                      {selectedNft ? Number(selectedNft[item.id]?.total) === 0 ?
                        <div className="bottom w-full">
                          <div className="btnWrpper mt-3">
                            <ActButton
                              label="Vote"
                              onClick={() => vote_(item.id)}
                              load={load[item.id]}
                            />
                          </div>
                        </div> : selectedNft[item.id]?.total + "%" : ""
                      }</p>
                    <p className="m-0 text-green-500 text-xs">{item.pool?.length} Pools Selected</p>
                  </div>
                </div>
              </div>
              <div className="mt-3">
                {item.pool?.length ?
                  <ListLayout column={column} data={item.pool.map(pool => ({ ...pool, nftId: item.id }))} />
                  :
                  <div className="text-center mb-5 py-3">
                    You haven't selected any pools for this lock yet.
                  </div>
                }
              </div>
            </div>
          )) : ""}
        </div>
      </div>
    </div>
  );
};

export default VotePopup;

const cross = (
  <svg
    width="12"
    height="12"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M17 17L1 1M17 1L1 17"
      stroke="#fff"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const lockIcn = (
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
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

const deleteIcn = (
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
    <path d="M3 6h18"></path>
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
  </svg>
);
