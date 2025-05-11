import { fromUnits, toUnits } from '@/utils/math.utils';
import { lockById, VeNFT } from '@/utils/sugar.utils';
import React, { useEffect, useState } from 'react'
import styled, { keyframes } from 'styled-components';
import ActButton from '../common/ActButton';
import { useEthersSigner } from '@/hooks/useEthersSigner';
import { useAccount, useChainId } from 'wagmi';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';
import { aerodromeContracts } from '@/utils/config.utils';
import votingEscrowAbi from "../../abi/aerodrome/votingEscrow.json";
import Notify from '../common/Notify';
import { gobV2 } from '@/utils/constant.utils';
import { allowance, approve } from '@/utils/web3.utils';
import Progress from '../common/Progress';

interface IncreaseProps {
    tokenId: number;
}

const Increase: React.FC<IncreaseProps> = ({ tokenId }) => {
    const [lock, setLock] = useState<VeNFT | null>(null);
    const [load, setLoad] = useState<{ [key: string]: boolean }>({});
    const [amount, setAmount] = useState("");
    const [status, setStatus] = useState<{ [key: string]: boolean }>({
        isAllowanceForToken: false,
        tokenLocked: false,
    });

    const signer = useEthersSigner();
    const chainId = useChainId();
    const { address } = useAccount();

    const handleLoad = (action: string, status: boolean) => {
        setLoad((prev) => ({ ...prev, [action]: status }));
    };

    const handProgress = (action: string, status: boolean) => {
        setStatus((prev) => ({ ...prev, [action]: status }));
    };

    const checkAllownceStatus = async (chainId: number) => {
        if (!address) return;
        console.log(chainId, amount, status)
        const status0_ = await allowance(
            chainId,
            gobV2[chainId]?.address,
            address,
            aerodromeContracts[chainId].votingEscrow,
            Number(amount),
            gobV2[chainId]?.decimals
        );
        handProgress("isAllowanceForToken", status0_);
    };

    const fetchLocksById = async () => {
        if (!tokenId) return
        const locks_ = await lockById(chainId, Number(tokenId))
        //@ts-expect-error ignore
        setLock(locks_)
    }

    useEffect(() => {
        if (chainId && tokenId) {
            fetchLocksById()
        }
    }, [chainId, tokenId]);

    useEffect(() => {
        if (chainId && amount) {
            checkAllownceStatus(chainId);
        }
    }, [chainId, amount]);

    const increase = async () => {
        try {
            if (!address) return toast.warn("Please connect your wallet");
            handProgress("tokenLocked", false);
            handleLoad("increase", true);

            const txApprove = await approve(
                gobV2[chainId]?.address,
                await signer,
                aerodromeContracts[chainId].votingEscrow,
                Number(amount),
                gobV2[chainId]?.decimals
            );
            if (txApprove) {
                await txApprove.wait();
            }
            handProgress("isAllowanceForToken", true);

            const votingEscrow = new ethers.Contract(
                aerodromeContracts[chainId].votingEscrow,
                votingEscrowAbi,
                await signer
            );

            const tx = await votingEscrow.increaseAmount(
                tokenId,
                toUnits(amount, gobV2[chainId]?.decimals),
                { gasLimit: 5000000 }
            );

            await tx.wait();
            await fetchLocksById()
            Notify({ chainId, txhash: tx.hash });
            handleLoad("increase", false);
            handProgress("tokenLocked", true);
        } catch (error) {
            console.log(error);
            handleLoad("increase", false);
        }
    };

    return (
        <>
            <section className="py-8 relative">
                <div className="container">
                    <div className="grid gap-3 grid-cols-12">
                    
                        <div className="md:col-span-6 col-span-12">
                            <div className="cardCstm p-3 md:p-10 rounded-2xl bg-[#000e0e] relative border border-[#2a2a2a]">
                                <div className="space-y-12">
                                    <div className="space-y-3">
                                        <div className="text-lg">
                                            Increasing <strong>Lock #{tokenId} </strong>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-accent-50 text-xs">
                                                <div
                                                    className="inline-block cursor-pointer"
                                                    data-testid="flowbite-tooltip-target"
                                                >
                                                    <span
                                                        data-testid=""
                                                        data-test-amount="2.5156102566030962"
                                                        className="tabular-nums"
                                                    >
                                                        {lock && fromUnits(lock?.amount, Number(lock?.decimals))}<span className="opacity-70">&nbsp;GOB</span>
                                                    </span>
                                                </div>
                                                <div
                                                    data-testid="flowbite-tooltip"
                                                    tabIndex={-1}
                                                    className="absolute inline-block z-10 rounded-lg py-2 px-3 text-sm font-medium transition-opacity duration-300 invisible opacity-0 bg-black text-white shadow-xl"
                                                    id=":r6au:"
                                                    role="tooltip"
                                                    style={{ position: "absolute", top: 180, left: "201.523px" }}
                                                >
                                                    <div className="relative z-20">~$1.31498</div>
                                                    <div
                                                        className="absolute z-10 h-2 w-2 rotate-45 bg-black"
                                                        data-testid="flowbite-tooltip-arrow"
                                                        style={{ bottom: "-4px", left: 43 }}
                                                    >
                                                        &nbsp;
                                                    </div>
                                                </div>
                                                &nbsp;
                                                <div
                                                    className="inline-block cursor-pointer"
                                                    data-testid="flowbite-tooltip-target"
                                                >
                                                    locked for 4 years
                                                </div>
                                                <div
                                                    data-testid="flowbite-tooltip"
                                                    tabIndex={-1}
                                                    className="absolute inline-block z-10 rounded-lg py-2 px-3 text-sm font-medium transition-opacity duration-300 invisible opacity-0 bg-black text-white shadow-xl"
                                                    id=":r6b0:"
                                                    role="tooltip"
                                                    style={{ position: "absolute", top: 184, left: "159.289px" }}
                                                >
                                                    <div className="relative z-20">
                                                        <p className="text-xs w-52 sm:w-auto">
                                                            Thu Jan 25 2029 05:30:00 GMT+0530 (India Standard Time)
                                                        </p>
                                                    </div>
                                                    <div
                                                        className="absolute z-10 h-2 w-2 rotate-45 bg-black"
                                                        data-testid="flowbite-tooltip-arrow"
                                                        style={{ bottom: "-4px", left: "182.5px" }}
                                                    >
                                                        &nbsp;
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-accent-50 text-xs">
                                                <div
                                                    className="inline-block cursor-pointer"
                                                    data-testid="flowbite-tooltip-target"
                                                >
                                                    <span
                                                        data-testid=""
                                                        data-test-amount="2.4148573975035372"
                                                        className="tabular-nums"
                                                    >
                                                        {lock && fromUnits(lock?.voting_amount, Number(lock?.decimals))}<span className="opacity-70">&nbsp;veGOB</span>
                                                    </span>
                                                </div>
                                                <div
                                                    data-testid="flowbite-tooltip"
                                                    tabIndex={-1}
                                                    className="absolute inline-block z-10 rounded-lg py-2 px-3 text-sm font-medium transition-opacity duration-300 invisible opacity-0 bg-black text-white shadow-xl"
                                                    id=":r6b2:"
                                                    role="tooltip"
                                                    style={{ position: "absolute", top: 200, left: "206.867px" }}
                                                >
                                                    <div className="relative z-20">~$1.26232</div>
                                                    <div
                                                        className="absolute z-10 h-2 w-2 rotate-45 bg-black"
                                                        data-testid="flowbite-tooltip-arrow"
                                                        style={{ bottom: "-4px", left: 44 }}
                                                    >
                                                        &nbsp;
                                                    </div>
                                                </div>{" "}
                                                voting power granted
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label
                                            className="font-medium dark:text-gray-300 text-xs text-accent-50"
                                            data-testid="flowbite-label"
                                            htmlFor="toAddress"
                                        >
                                            Enter amount to lock
                                        </label>
                                        <div className="flex">
                                            <div className="relative w-full">
                                                <input
                                                    onChange={(e) => setAmount(e.target.value)}
                                                    value={amount}
                                                    type="number"
                                                    className="block w-full disabled:cursor-not-allowed disabled:text-opacity-50 dark:disabled:text-opacity-30 bg-transparent border border-accent-30 hover:border-accent-40 focus:border-accent-40 placeholder-accent-40 outline-0 p-2.5 text-sm rounded-lg"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="py-2">
                                        <div className="flex p-4 rounded-xl itmes-center gap-2 bg-[#1c1d2a] text-[#a55e10]">
                                            <span className="icn">{inforicn}</span>
                                            <p className="m-0">
                                                Locking will give you an NFT , referred to as a
                                                veNFT. You can increase the Lock amount or
                                                extend the Lock time at any point after.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="md:col-span-6 col-span-12">
                            <div className="cardCstm p-3 md:p-4 rounded-md bg-[var(--backgroundColor2)] opacity-70 relative h-full flex justify-between flex-col">
                                <div className="top w-full">
                                    <h4 className="m-0 font-semibold text-xl">Lock Increase</h4>
                                    <div className="content pt-3">
                                        <SwapList className="list-none py-3 relative z-10 pl-0 mb-0">
                                            {(
                                                <>
                                                    <li className="py-1 flex itmes-start gap-3 ">
                                                        <span className="flex bg-[var(--backgroundColor)] h-6 w-6 text-green-500 items-center justify-center rounded-full">
                                                            1
                                                        </span>
                                                        <div className="content text-xs text-gray-400">
                                                            <p className="m-0">
                                                                Depositing {amount ? amount : 0.0} {gobV2[chainId || 8453]?.symbol}
                                                            </p>
                                                        </div>
                                                    </li>

                                                    <Progress
                                                        icon={
                                                            status?.isAllowanceForToken ? unlock : lockIcon
                                                        }
                                                        symbol={gobV2[chainId || 8453]?.symbol}
                                                        text="Allow the contracts to access"
                                                    />
                                                    <Progress
                                                        icon={status?.tokenLocked ? unlock : lockIcon}
                                                        symbol={gobV2[chainId || 8453]?.symbol}
                                                        text="Lock Increased for"
                                                    />
                                                </>

                                            )}
                                        </SwapList>
                                    </div>
                                </div>
                                <div className="bottom w-full">
                                    <div className="btnWrpper mt-3">
                                        <ActButton
                                            label="Deposit"
                                            onClick={() => increase()}
                                            load={load["increase"]}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}


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

export default Increase

const inforicn = (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
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

const lockIcon = (
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

