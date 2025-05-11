import { BigNumberish, ethers } from "ethers";
import {
    DepositParams,
    DepositReturn,
    HarvestParams,
    RewardConfig,
    SettingsConfig,
    WithdrawParams
} from "./farmDataInterface.utils";
import { MAX_UINT_128 } from "../constant.utils";

export const getDepositParams = (
    nfpm: string,
    tokenId: number,
    token0: string,
    token1: string,
    amount0Desired: string,
    amount1Desired: string,
    amount0Min: BigNumberish,
    amount1Min: BigNumberish,
    pool: string,
    zero: string,
    tickLower: number,
    tickUpper: number,
    fee: number
): DepositReturn => {
    const rewardConfig: RewardConfig = {
        rewardBehavior: 0,
        harvestTokenOut: zero
    };

    const params: DepositParams = {
        farm: {
            stakingContract: nfpm,
            poolIndex: 0
        },
        nft: nfpm,
        increase: {
            zap: {
                swaps: [],
                addLiquidityParams: {
                    nft: nfpm,
                    tokenId: tokenId,
                    pool: {
                        token0: token0,
                        token1: token1,
                        fee: fee
                    },
                    tickLower: tickLower,
                    tickUpper: tickUpper,
                    amount0Desired: amount0Desired,
                    amount1Desired: amount1Desired,
                    amount0Min: amount0Min.toString(),
                    amount1Min: amount1Min.toString(),
                    deadline: Math.floor(Date.now() / 1000) + 600,
                    extraData: "0x"
                }
            },
            tokensIn: [token0, token1],
            amountsIn: [amount0Desired, amount1Desired],
            extraData: "0x"
        }
    };

    const settings: SettingsConfig = {
        pool: pool,
        autoRebalance: false,
        rebalanceConfig: {
            rewardBehavior: 0,
            harvestTokenOut: zero,
            rewardConfig: {
                rewardBehavior: 0,
                harvestTokenOut: zero
            },
            tickSpacesBelow: 0,
            tickSpacesAbove: 0,
            bufferTicksBelow: 0,
            bufferTicksAbove: 0,
            dustBP: 0,
            priceImpactBP: 0,
            slippageBP: 0,
            cutoffTickLow: 0,
            cutoffTickHigh: 0,
            delayMin: 0
        },
        automateRewards: false,
        rewardConfig,
        autoExit: false,
        exitConfig: {
            triggerTickLow: 0,
            triggerTickHigh: 0,
            exitTokenOutLow: zero,
            exitTokenOutHigh: zero,
            priceImpactBP: 0,
            slippageBP: 0
        }
    };

    const sweepTokens = [token0, token1];
    const referralCode = ethers.encodeBytes32String("REF123");

    return { params, settings, sweepTokens, approved: zero, referralCode };
};

export const getWithdrawParams = ({
    stakingContract,
    tokenId,
    liquidity,
    rewardTokens,
    outputTokens,
    sweepTokens
}: WithdrawParams) => {
    const amount0Max = MAX_UINT_128
    const amount1Max = MAX_UINT_128
    const position = {
        farm: {
            stakingContract,
            poolIndex: 0
        },
        nft: stakingContract,
        tokenId
    };

    const harvestParams = {
        harvest: {
            rewardTokens,
            amount0Max,
            amount1Max,
            extraData: "0x00"
        },
        swaps: [],
        outputTokens,
        sweepTokens
    };

    const withdrawParams = {
        zap: {
            removeLiquidityParams: {
                nft: stakingContract,
                tokenId,
                liquidity,
                amount0Min: "0",
                amount1Min: "0",
                amount0Max,
                amount1Max,
                extraData: "0x00"
            },
            swaps: []
        },
        tokensOut: outputTokens,
        extraData: "0x00"
    };

    return { position, harvestParams, withdrawParams, sweepTokens };
};

export const getHarvestParams = ({
    stakingContract,
    tokenId,
    rewardTokens,
    outputTokens,
    sweepTokens
}: HarvestParams) => {
    return {
        position: {
            farm: {
                stakingContract,
                poolIndex: 0
            },
            nft: stakingContract,
            tokenId
        },
        params: {
            harvest: {
                rewardTokens,
                amount0Max: MAX_UINT_128,
                amount1Max: MAX_UINT_128,
                extraData: "0x00"
            },
            swaps: [],
            outputTokens,
            sweepTokens
        }
    };
};

export const getRebalanceParms = (
    pool: string,
    token0: string,
    token1: string,
    tokenId: number,
    liquidity: number,
    nfpm: string,
    feeTier: number,
    tickLower: number,
    tickUpper: number,
    rewardTokens: [],
    sweepTokens: [],
    rawSwapAmount: number,
    rawReceivedAmount: number,
    tokenSwapIn: string,
    extraData: string,  
    router: string,
    amount0Max = MAX_UINT_128,
    amount1Max = MAX_UINT_128
) => {
    const params = {
        pool: pool,
        position: {
            farm: {
                stakingContract: nfpm,
                poolIndex: 0
            },
            nft: nfpm,
            tokenId: tokenId
        },
        harvest: {
            harvest: {
                rewardTokens: rewardTokens,
                amount0Max: amount0Max,
                amount1Max: amount1Max,
                extraData: "0x00"
            },
            swaps: [],
            outputTokens: [],
            sweepTokens: sweepTokens
        },
        withdraw: {
            zap: {
                removeLiquidityParams: {
                    nft: nfpm,
                    tokenId: tokenId,
                    liquidity: liquidity,
                    amount0Min: "0",
                    amount1Min: "0",
                    amount0Max: amount0Max,
                    amount1Max: amount0Max,
                    extraData: "0x00"
                },
                swaps: []
            },
            tokensOut: sweepTokens,
            extraData: "0x00"
        },
        increase: {
            tokensIn: [],
            amountsIn: [],
            zap: {
                swaps: [{
                    router: router, 
                    amountIn: rawSwapAmount,
                    minAmountOut: 0, //rawReceivedAmount, 
                    tokenIn: tokenSwapIn,
                    extraData: extraData
                }],
                addLiquidityParams: {
                    nft: nfpm,
                    tokenId: 0,
                    pool: {
                        token0: token0,
                        token1: token1,
                        fee: feeTier
                    },
                    tickLower: tickLower,
                    tickUpper: tickUpper,
                    amount0Desired: "0",
                    amount1Desired: "0",
                    amount0Min: "0",
                    amount1Min: "0",
                    extraData: "0x00"
                }
            },
            extraData: "0x00"
        }
    }

    return { params }
}

export const getIncreaseParams = (
    token0: string,
    token1: string,
    tokenId: number,
    nfpm: string,
    feeTier: number,
    tickLower: number,
    tickUpper: number,
    sweepTokens: [],
    amount0Desired: number,
    amount1Desired: number
) => {
    const position = {
        farm: {
            stakingContract: nfpm,
            poolIndex: 0
        },
        nft: nfpm,
        tokenId: tokenId
    }

    const harvestParams = {
        harvest: {
            rewardTokens: [],
            amount0Max: MAX_UINT_128,
            amount1Max: MAX_UINT_128,
            extraData: "0x00"
        },
        swaps: [],
        outputTokens: [],
        sweepTokens: sweepTokens
    }

    const increaseParams = {
        tokensIn: [token0, token1],
        amountsIn: [amount0Desired, amount1Desired],
        zap: {
            swaps: [],
            addLiquidityParams: {
                nft: nfpm,
                tokenId: tokenId,
                pool: {
                    token0: token0,
                    token1: token1,
                    fee: feeTier
                },
                tickLower: tickLower,
                tickUpper: tickUpper,
                amount0Desired: amount0Desired,
                amount1Desired: amount1Desired,
                amount0Min: "0",
                amount1Min: "0",
                deadline: Math.floor(Date.now() / 1000) + 600,
                extraData: "0x00"
            }
        },
        extraData: "0x00"
    }

    return { position, harvestParams, increaseParams }
}

export const getCompoundParams = (
    token0: string,
    token1: string,
    tokenId: number,
    nfpm: string,
    fee: number,
    tickLower: number,
    tickUpper:number,
    rewardTokens: []
) => {
    const position = {
        farm: {
            stakingContract: nfpm,
            poolIndex: 0
        },
        nft: nfpm,
        tokenId: tokenId
    }

    const params = {
        harvest: {
            rewardTokens: rewardTokens,
            amount0Max: MAX_UINT_128,
            amount1Max: MAX_UINT_128,
            extraData: "0x00"
        },
        zap: {
            swaps: [],
            addLiquidityParams: {
                nft: nfpm,
                tokenId: tokenId,
                pool: {
                    token0: token0,
                    token1: token1,
                    fee: fee
                },
                tickLower: tickLower,
                tickUpper: tickUpper,
                amount0Desired: "0",
                amount1Desired: "0",
                amount0Min: "0",
                amount1Min: "0",
                extraData: "0x00"
            }
        },
    }

    return { position, params }
}