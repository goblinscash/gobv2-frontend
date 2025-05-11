"use client";
import React, { useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { VeNFT } from "@/utils/sugar.utils";
import Link from "next/link";
import Image from "next/image";
import logo from "@/assets/Images/logo.png"
import { useEthersSigner } from "@/hooks/useEthersSigner";
import { ethers } from "ethers";
import { aerodromeContracts } from "@/utils/config.utils";
import voterAbi from "../../abi/aerodrome/voter.json"
import votingEscrowAbi from "../../abi/aerodrome/votingEscrow.json"
import Notify from "@/components/common/Notify";
import { toast } from "react-toastify";


const LockInteraction = ({ item }: { item: VeNFT }) => {
  const signer = useEthersSigner();
  const chainId = useChainId();
  const { address } = useAccount();
  const [load, setLoad] = useState<{ [key: string]: boolean }>({});

  const handleLoad = (action: string, status: boolean) => {
    setLoad((prev) => ({ ...prev, [action]: status }));
  };

  const withdraw = async (tokenId: number) => {
    try {
      if (!address) return toast.warn("Please connect your wallet");
      if (!tokenId) return;
      handleLoad("WithdrawLock", true);

      const votingEscrow = new ethers.Contract(
        aerodromeContracts[chainId].votingEscrow,
        votingEscrowAbi,
        await signer
      );

      const tx = await votingEscrow.withdraw(tokenId, { gasLimit: 5000000 });
      await tx.wait();
      Notify({ chainId, txhash: tx.hash });
      handleLoad("WithdrawLock", false);
    } catch (error) {
      console.log(error);
      handleLoad("WithdrawLock", false);
    }
  };

  const reset = async (tokenId: number) => {
    try {
      if (!address) return toast.warn("Please connect your wallet");
      if (!tokenId) return;
      handleLoad("Reset", true);

      const voter = new ethers.Contract(
        aerodromeContracts[chainId].voter,
        voterAbi,
        await signer
      );

      const tx = await voter.reset(tokenId, { gasLimit: 5000000 });
      await tx.wait();
      Notify({ chainId, txhash: tx.hash });
      handleLoad("Reset", false);
    } catch (error) {
      console.log(error);
      handleLoad("Reset", false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="bg-black rounded-xl p-2 flex items-center justify-center">
        <Image
          src={logo}
          alt=""
          height={10000}
          width={10000}
          className="max-w-full h-[30px] mx-auto w-auto object-contain"
        />
      </div>
      <div className="content">
        <h6 className="m-0 font-medium text-base">Lock #{item.id}</h6>
        <ul className="list-none pl-0 mb-0 flex items-center justify-start gap-2 mt-2">
          <li>
            <Link
              href={`/lock?increase=true&id=${item.id}`}
              className="font-medium text-xs text-blue-500"
            >
              Increase
            </Link>
          </li>
          <li>
            <Link
              href={`/lock?extend=true&id=${item.id}`}
              className="font-medium text-xs text-blue-500"
            >
              Extend
            </Link>
          </li>
          <li>
            <Link
              href={`/lock?merge=true&id=${item.id}`}
              className="font-medium text-xs text-blue-500"
            >
              Merge
            </Link>
          </li>
          <li>
            <Link
              href={`/lock?transfer=true&id=${item.id}`}
              className="font-medium text-xs text-blue-500"
            >
              Transfer
            </Link>
          </li>
        </ul>
        <ul className="list-none pl-0 mb-0 flex items-center justify-start gap-2 mt-2">
          <li className="">
            <button
              className="font-medium text-xs text-blue-500"
              onClick={() => reset(parseInt(item.id))}
              disabled={load["Reset"]}
            >
              {load["Reset"] ? <>PROCESSING...</> : "Reset"}
            </button>
          </li>
          <li className="">

            <button
              className="font-medium text-xs text-blue-500"
              onClick={() => withdraw(parseInt(item.id))}
              disabled={load["WithdrawLock"]}
            >
              {load["WithdrawLock"] ? <>PROCESSING...</> : "Withdraw"}
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default LockInteraction
