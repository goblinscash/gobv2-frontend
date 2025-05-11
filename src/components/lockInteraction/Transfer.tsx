import { fromUnits } from '@/utils/math.utils';
import { VeNFT } from '@/utils/sugar.utils';
import React, { useState } from 'react'
import styled, { keyframes } from 'styled-components';
import ActButton from '../common/ActButton';
import { useEthersSigner } from '@/hooks/useEthersSigner';
import { useAccount, useChainId } from 'wagmi';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';
import { aerodromeContracts } from '@/utils/config.utils';
import votingEscrowAbi from "../../abi/aerodrome/votingEscrow.json";
import Notify from '../common/Notify';

interface TransferProps {
    tokenId: number;
    lock: VeNFT | null;
}

const Transfer: React.FC<TransferProps> = ({ tokenId, lock }) => {
    const [wallet, setWallet] = useState("")

    const [load, setLoad] = useState<{ [key: string]: boolean }>({});
    const signer = useEthersSigner();
    const chainId = useChainId();
    const { address } = useAccount();

    const handleLoad = (action: string, status: boolean) => {
        setLoad((prev) => ({ ...prev, [action]: status }));
    };

    const transfer = async () => {
        try {
            if (!address) return toast.warn("Please connect your wallet");
            if (!wallet) return;

            handleLoad("transfer", true);

            const votingEscrow = new ethers.Contract(
                aerodromeContracts[chainId].votingEscrow,
                votingEscrowAbi,
                await signer
            );

            const tx = await votingEscrow.transferFrom(
                address,
                wallet,
                tokenId,
                { gasLimit: 5000000 }
            );

            await tx.wait();
            Notify({ chainId, txhash: tx.hash });
            handleLoad("transfer", false);
        } catch (error) {
            console.log(error);
            handleLoad("transfer", false);
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
                                            Transferring <strong>Lock #{tokenId} </strong>
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
                                            Wallet address where the lock will be transferred
                                        </label>
                                        <div className="flex">
                                            <div className="relative w-full">
                                                <input
                                                    value={wallet}
                                                    onChange={(e) => setWallet(e.target.value)}
                                                    type="text"
                                                    className="block w-full disabled:cursor-not-allowed disabled:text-opacity-50 dark:disabled:text-opacity-30 bg-transparent border border-accent-30 hover:border-accent-40 focus:border-accent-40 placeholder-accent-40 outline-0 p-2.5 text-sm rounded-lg"
                                                    id="toAddress"
                                                    placeholder="0x"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                        <div className="md:col-span-6 col-span-12">
                            {wallet ? <div className="cardCstm p-3 md:p-4 rounded-md bg-[var(--backgroundColor2)] opacity-70 relative h-full flex justify-between flex-col">
                                <div className="top w-full">
                                    <h4 className="m-0 font-semibold text-xl">Transfer</h4>
                                    <div className="content pt-3">
                                        <SwapList className="list-none py-3 relative z-10 pl-0 mb-0">
                                            {(
                                                <>
                                                    {/* <Progress
                                                        icon={
                                                            status.isAllowanceForToken ? unlock : lock
                                                        }
                                                        symbol={gobV2[chainId || 8453]?.symbol}
                                                        text="Allow the contracts to access"
                                                    />
                                                    <Progress
                                                        icon={status.tokenLocked ? unlock : lock}
                                                        symbol={gobV2[chainId || 8453]?.symbol}
                                                        text="Lock Created for"
                                                    /> */}
                                                </>

                                            )}
                                        </SwapList>
                                    </div>
                                </div>
                                <div className="bottom w-full">
                                    <div className="btnWrpper mt-3">
                                        <ActButton
                                            label="Transfer"
                                            onClick={() => transfer()}
                                            load={load["transfer"]}
                                        />
                                    </div>
                                </div>
                            </div> :
                                <div className="md:p-8 p-4 rounded-xl bg-[#00ff4e] h-full">
                                    <div className="flex flex-col justify-between h-full">
                                        <div>
                                            <div className="text-sm text-black pb-8">
                                                Transferring a lock will also transfer any rewards and rebases! Before
                                                continuing, please make sure you have{" "}
                                                <a href="/dash" className="pt-4 underline hover:no-underline">
                                                    claimed all available rewards
                                                </a>
                                                .
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            className="group flex h-min items-center justify-center text-center focus:z-10 focus:outline-none focus:ring-transparent focus-visible:ring-inherit font-semibold border border-transparent bg-white hover:opacity-80 text-black transition rounded-xl focus:ring-2 w-full"
                                        >
                                            <span className="flex items-center rounded-md h-[38px] text-xs py-2 px-4">
                                                Continue
                                            </span>
                                        </button>
                                    </div>

                                </div>}
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

export default Transfer