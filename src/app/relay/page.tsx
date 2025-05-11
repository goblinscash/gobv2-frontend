"use client"
import { fromUnits, getTimeSince, isResetAvailable, shortenPubkey } from '@/utils/math.utils';
import { allRelay, locksByAccount, Relay, VeNFT } from '@/utils/sugar.utils';
import React, { useEffect, useState } from 'react'
import styled, { keyframes } from 'styled-components';
import { useEthersSigner } from '@/hooks/useEthersSigner';
import { useAccount, useChainId } from 'wagmi';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';
import { aerodromeContracts } from '@/utils/config.utils';
import voterAbi from "../../abi/aerodrome/voter.json";
import { gobV2 } from '@/utils/constant.utils';
import { Tooltip } from 'react-tooltip'
import Progress from '@/components/common/Progress';
import ActButton from '@/components/common/ActButton';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { isReset } from '@/utils/web3.utils';
import Notify from '@/components/common/Notify';



const Relays = () => {
    const searchParams = useSearchParams();
    const id_ = searchParams.get("id");
    const [locks, setLocks] = useState<VeNFT[]>([]);
    const [relay, setRelay] = useState<Relay | null>(null)
    const [isChecked, setIsChecked] = useState(false)
    const [isCopied, setIsCopied] = useState(false)


    const [load, setLoad] = useState<{ [key: string]: boolean }>({});
    const [selectedId, setSelectedId] = useState<VeNFT | null>(null);
    const [status, setStatus] = useState<{ [key: string]: boolean }>({
        isReset: false,
        depositCompleted: false,
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

    const handleSelect = async (id: number) => {
        if (id == 0) {
            return setSelectedId(null)
        }
        const _lock = locks.filter((item: VeNFT) => Number(item.id) == id)
        if (_lock?.length) {
            setSelectedId(_lock[0])
        }

        const _isReset = await isReset(chainId, id)
        handProgress("isReset", _isReset)
    }

    const copy = (addr: string) => {
        navigator.clipboard.writeText(addr);
        setIsCopied(true)
    }


    const fetchLocksByAccount = async () => {
        if (!address) return
        let locks_ = await locksByAccount(chainId, address as string)
        locks_ = locks_.filter((item: VeNFT) => item.amount !== "0")
        setLocks(locks_)
    }

    const fetchRelay = async () => {
        let relay_ = await allRelay(chainId, address as string)
        relay_ = relay_.filter((item: Relay) => item.venft_id == id_)
        setRelay(relay_[0])
    }

    useEffect(() => {
        if (chainId && address) {
            fetchLocksByAccount()
            fetchRelay()
        }
    }, [chainId, address]);

    const deposit = async () => {
        try {
            if (!address) return toast.warn("Please connect your wallet");
            if (!isChecked) return toast.warn("Confirm unlock date change")
            if (!selectedId?.id) return toast.warn("Select tokenId first")
            if (!status?.isReset) return toast.warn(`First reset lock ${selectedId?.id} to proceed`)
            handleLoad("deposit", true);

            const voter = new ethers.Contract(
                aerodromeContracts[chainId].voter,
                voterAbi,
                await signer
            );

            const tx = await voter.depositManaged(
                selectedId.id,
                id_,
                { gasLimit: 5000000 }
            );

            await tx.wait();

            await fetchLocksByAccount()
            Notify({ chainId, txhash: tx.hash });
            handleLoad("deposit", false);
            handProgress("depositCompleted", true);
            setSelectedId(null)
        } catch (error) {
            console.log(error);
            handleLoad("deposit", false);
        }
    };

    console.log(selectedId, "selectedId")

    return (
        <>
            <section className="py-8 relative">
                <div className="container">
                    <div className="grid gap-3 grid-cols-12">
                        <div className="md:col-span-6 col-span-12">
                            <div className="cardCstm p-3 md:p-10 rounded-2xl bg-[#000e0e] relative border border-[#2a2a2a]">
                                <div className="space-y-12">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <label
                                                className="font-medium dark:text-gray-300 text-xs text-accent-50"
                                                data-testid="flowbite-label"
                                                htmlFor="toAddress"
                                            >
                                                Select the Lock you want to deposit
                                            </label>
                                            <Link href="/lock" className='themeClr font-medium'>Create new lock</Link>
                                        </div>
                                        <div className="flex">
                                            <select
                                                id="options"
                                                className='px-3 py-2 bg-[#000] rounded w-full h-[45px] pr-3 outline-0'
                                                name="options"
                                                onChange={(e) => handleSelect(Number(e.target.value))}
                                            >
                                                <option value="">Select tokenId</option>
                                                {
                                                    locks.map((item) => (
                                                        <option key={item.id} value={item.id}>
                                                            Lock #{item.id} with {fromUnits(item.amount, Number(item.decimals))} {gobV2[chainId || 8453]?.symbol}
                                                        </option>
                                                    ))
                                                }
                                            </select>
                                        </div>
                                    </div>
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
                                                <div className="font-semibold">{relay?.name}</div>
                                                <span
                                                    className="flex items-center gap-1 font-semibold text-accent-60 border border-transparent bg-[#000] border border-[#242424] cursor-default rounded-full h-[16px] px-2 text-[9px] uppercase"
                                                    data-testid="flowbite-badge"
                                                >
                                                    <span>ID {relay?.venft_id}</span>
                                                </span>
                                            </div>
                                            <div className="text-xs text-accent-50 flex gap-2 items-center">
                                                <span content="[object Object]">
                                                    {
                                                        relay &&
                                                        <>
                                                            {Number(relay.run_at) === 0 ? "Never updated" :
                                                                <> Updated {getTimeSince(Number(relay.run_at)).relative}</>}
                                                        </>
                                                    }
                                                </span>
                                                <span className="hidden sm:inline-block opacity-30">·</span>
                                                <div className="hidden sm:flex items-center gap-2 text-[11px]">
                                                    <span className="font-mono">{relay ? shortenPubkey(relay?.relay) : ""}</span>
                                                    <div
                                                        className="inline-block cursor-pointer"
                                                        data-testid="flowbite-tooltip-target"
                                                    >
                                                        <Tooltip id="my-tooltip" />
                                                        <div
                                                            role="button"
                                                            data-tooltip-id="my-tooltip" data-tooltip-content={isCopied ? "Copied" : "Copy"}
                                                            onClick={
                                                                //@ts-expect-error ignore
                                                                () => copy(relay?.relay)
                                                            }
                                                        >
                                                            {copyIcn}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="py-2">
                                        <div className="flex p-4 rounded-xl itmes-center gap-2 bg-[#1c1d2a] text-[#a55e10]">
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    className="form-check"
                                                    checked={isChecked}
                                                    onChange={() => setIsChecked(!isChecked)}
                                                />
                                                <p className="m-0">
                                                    I understand that by depositing my Lock into a Relay strategy, the Lock unlock date will be extended to 4 years.
                                                </p>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="md:col-span-6 col-span-12">
                            <div className="cardCstm p-3 md:p-4 rounded-md bg-[var(--backgroundColor2)] opacity-70 relative h-full flex justify-between flex-col">
                                <div className="top w-full">
                                    <h4 className="m-0 font-semibold text-xl">Relay Deposit</h4>
                                    <div className="content pt-3">
                                        <SwapList className="list-none py-3 relative z-10 pl-0 mb-0">
                                            {(
                                                <>
                                                    <Progress
                                                        icon={selectedId ? unlock : lockIcon}
                                                        symbol={""}
                                                        text="Select the Lock you want to deposit"
                                                    />

                                                    <Progress
                                                        icon={isResetAvailable(Number(selectedId?.voted_at), chainId) ? unlock : lockIcon}
                                                        symbol={""}
                                                        text={isResetAvailable(Number(selectedId?.voted_at), chainId) ? "Reset is available for this lock" : "Reset is not available after a vote, wait for the next epoch."}
                                                    />

                                                    <Progress
                                                        icon={status?.isReset ? unlock : lockIcon}
                                                        symbol={""}
                                                        text={status?.isReset ? `Reset is done for tokenId: ${selectedId?.id}` : `First reset the lock ${selectedId?.id} to proceed.`}
                                                    />

                                                    <Progress
                                                        icon={isChecked ? unlock : lockIcon}
                                                        symbol={""}
                                                        text="Confirm unlock date change"
                                                    />

                                                    <Progress
                                                        icon={status?.depositCompleted ? unlock : lockIcon}
                                                        symbol={""}
                                                        text="deposit lock completed"
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
                                            onClick={() => deposit()}
                                            load={load["deposit"]}
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

export default Relays

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