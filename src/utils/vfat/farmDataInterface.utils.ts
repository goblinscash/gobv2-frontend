export interface DepositParams {
    farm: {
        stakingContract: string;
        poolIndex: number;
    };
    nft: string;
    increase: {
        zap: {
            swaps: [];
            addLiquidityParams: {
                nft: string;
                tokenId: number;
                pool: {
                    token0: string;
                    token1: string;
                    fee: number;
                };
                tickLower: number;
                tickUpper: number;
                amount0Desired: string;
                amount1Desired: string;
                amount0Min: string;
                amount1Min: string;
                deadline: number;
                extraData: string;
            };
        };
        tokensIn: string[];
        amountsIn: string[];
        extraData: string;
    };
}

export interface RewardConfig {
    rewardBehavior: number;
    harvestTokenOut: string;
}

export interface ExitConfig {
    triggerTickLow: number;
    triggerTickHigh: number;
    exitTokenOutLow: string;
    exitTokenOutHigh: string;
    priceImpactBP: number;
    slippageBP: number;
}

export interface RebalanceConfig extends RewardConfig {
    rewardConfig: RewardConfig;
    tickSpacesBelow: number;
    tickSpacesAbove: number;
    bufferTicksBelow: number;
    bufferTicksAbove: number;
    dustBP: number;
    priceImpactBP: number;
    slippageBP: number;
    cutoffTickLow: number;
    cutoffTickHigh: number;
    delayMin: number;
}

export interface SettingsConfig {
    pool: string;
    autoRebalance: boolean;
    rebalanceConfig: RebalanceConfig;
    automateRewards: boolean;
    rewardConfig: RewardConfig;
    autoExit: boolean;
    exitConfig: ExitConfig;
}

export interface DepositReturn {
    params: DepositParams;
    settings: SettingsConfig;
    sweepTokens: string[];
    approved: string;
    referralCode: string;
}

export interface HarvestParams {
    stakingContract: string;
    tokenId: number;
    rewardTokens: string[];
    outputTokens: string[];
    sweepTokens: string[];
    amount0Max?: string;
    amount1Max?: string;
  }

 export interface WithdrawParams {
    stakingContract: string;
    tokenId: string;
    liquidity: string;
    rewardTokens?: string[];
    outputTokens?: string[];
    sweepTokens?: string[];
  }