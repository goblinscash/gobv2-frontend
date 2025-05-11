import { ethers, AbiCoder, ZeroAddress } from "ethers";
import { aerodromeContracts, RpcUrls, rpcUrls, subGraphUrls, uniswapContracts, vfatContracts } from "./config.utils";

import poolFactoryAbi from "../abi/aerodrome/poolFactoy.json"
import poolAbi from "../abi/aerodrome/pool.json"
import nfpmAbi from "../abi/nfpm.json"
import sickleFactoryAbi from "../abi/sickleFactory.json"
import erc20Abi from "../abi/erc20.json"
import uniPoolAbi from "../abi/uniPool.json"
import uniswapFactoryAbi from "../abi/uniswapFactory.json"
import routerAbi from "../abi/aerodrome/router.json";
import voterAbi from "../abi/aerodrome/voter.json";

import { fromUnits, toUnits } from "./math.utils";
import { getTokenDetails } from "./requests.utils";

import { Price, Token } from '@uniswap/sdk-core'
import { TickMath, nearestUsableTick } from '@uniswap/v3-sdk';
import JSBI from "jsbi";

import { MAX_UINT_128 } from "./constant.utils";
import { getUniswapQuote } from "./quote.utils";

type SwapRoute = {
    from: string;
    fee: number;
    to: string;
};

type Route = {
    from: string;
    to: string;
    stable: boolean;
    factory: string;
};

function isValidChainId(chainId: number): chainId is keyof typeof uniswapContracts & keyof RpcUrls {
    return chainId in uniswapContracts && chainId in rpcUrls;
}

export const erc20Balance = async (chainId: number, token: string, decimals: number, wallet: string) => {
    try {
        const tokenContract = new ethers.Contract(token, erc20Abi, new ethers.JsonRpcProvider(rpcUrls[chainId]));
        const balance = await tokenContract.balanceOf(wallet);
        const _balance = Number(fromUnits(balance, decimals))
        return _balance.toFixed(4)
    } catch (error) {
        console.log(error)
        return "0"
    }
}

export const fetchPosition = async (chainId: number, tokenId: number) => {
    try {
        if (!isValidChainId(chainId)) {
            throw new Error(`Invalid chainId: ${chainId}`);
        }

        const instance = new ethers.Contract(
            uniswapContracts[chainId].nfpm as string,
            nfpmAbi,
            new ethers.JsonRpcProvider(rpcUrls[chainId])
        );


        let position = await instance.positions(tokenId)
        position = {
            nonce: position[0].toString(),
            operator: ethers.getAddress(position[1]),
            token0: ethers.getAddress(position[2]),
            token1: ethers.getAddress(position[3]),
            fee: position[4].toString(),
            tickLower: position[5].toString(),
            tickUpper: position[6].toString(),
            liquidity: position[7].toString(),
            feeGrowthInside0LastX128: position[8].toString(),
            feeGrowthInside1LastX128: position[9].toString(),
            tokensOwed0: position[10].toString(),
            tokensOwed1: position[11].toString()
        };
        return position
    } catch (error) {
        console.log(error, "error")
    }
};

export const fetchNftBalance = async (chainId: number, wallet: string) => {
    try {
        if (!isValidChainId(chainId)) {
            throw new Error(`Invalid chainId: ${chainId}`);
        }

        const instance = new ethers.Contract(
            uniswapContracts[chainId].nfpm as string,
            nfpmAbi,
            new ethers.JsonRpcProvider(rpcUrls[chainId])
        );
        const sickle = await getSickle(chainId, wallet)
        const totalNft = Number(await instance.balanceOf(sickle))
        const ids = [...Array(totalNft)].map((_, i) => {
            return instance.tokenOfOwnerByIndex(sickle, i)
        });

        let nftIds = await Promise.all(ids)
        nftIds = nftIds.map((item) => parseInt(item))
        return nftIds
    } catch (error) {
        console.log(error)
        return []
    }
}

export const getSickle = async (chainId: number, wallet: string) => {
    if (!isValidChainId(chainId)) {
        throw new Error(`Invalid chainId: ${chainId}`);
    }
    const instance = new ethers.Contract(
        vfatContracts[chainId].SickleFactory as string,
        sickleFactoryAbi,
        new ethers.JsonRpcProvider(rpcUrls[chainId])
    );
    const sickle = await instance.sickles(wallet)
    return sickle
}

export const userDeposits = async (chainId: number, wallet: string) => {
    try {
        if (!isValidChainId(chainId)) {
            throw new Error(`Invalid chainId: ${chainId}`);
        }
        const nfts = await fetchNftBalance(chainId, wallet);
        if (nfts?.length == 0) return []

        const positionPromises = nfts?.map(async (id) => {
            const position = await fetchPosition(chainId, id);
            return {
                nftId: id,
                position,
            };
        });

        const _positions = await Promise.all(positionPromises)

        const tokenFc = getTokenDetails(subGraphUrls[Number(chainId)])
        const positions = await Promise.all(
            _positions.map(async (item) => {
                const _token0 = await tokenFc(item?.position?.token0?.toLowerCase());
                const _token1 = await tokenFc(item?.position?.token1?.toLowerCase());

                return {
                    ...item,
                    token0: _token0.token,
                    token1: _token1.token,
                };
            })
        );

        return positions
    } catch (error) {
        console.log(error)
    }
}

export const getPredictedSickle = async (chainId: number, wallet: string) => {
    if (!isValidChainId(chainId)) {
        throw new Error(`Invalid chainId: ${chainId}`);
    }
    const instance = new ethers.Contract(
        vfatContracts[chainId].SickleFactory as string,
        sickleFactoryAbi,
        new ethers.JsonRpcProvider(rpcUrls[chainId])
    );
    const sickle = await instance.predict(wallet)
    return sickle
}

//@ts-expect-error skip the warning
export const approve = async (token: string, signer, spendor: string, amount: number, decimals: number) => {
    const _amount = BigInt(toUnits(amount, decimals));
    const tokenContract = new ethers.Contract(token, erc20Abi, signer);
    const allowance = await tokenContract.allowance(signer.address, spendor);
    if (allowance < _amount) {
        const tx1 = await tokenContract.approve(spendor, _amount);
        return tx1;
    } else {
        return null
    }
}

export const allowance = async (chainId: number, token: string, signer: string, spendor: string, amount: number, decimals: number) => {
    const _amount = BigInt(toUnits(amount, decimals));
    const tokenContract = new ethers.Contract(token, erc20Abi, new ethers.JsonRpcProvider(rpcUrls[chainId]));
    const allowance = await tokenContract.allowance(signer, spendor);
    if (allowance >= _amount) {
        return true;
    } else {
        return false
    }
}

export const getTickSpacing = async (chainId: number, pool: string) => {
    if (!isValidChainId(chainId)) {
        throw new Error(`Invalid chainId: ${chainId}`);
    }
    const instance = new ethers.Contract(
        pool,
        uniPoolAbi,
        new ethers.JsonRpcProvider(rpcUrls[chainId])
    );
    const spacing = await instance.tickSpacing()
    return parseFloat(spacing)
}

export const getSlot = async (chainId: number, pool: string) => {
    if (!isValidChainId(chainId)) {
        throw new Error(`Invalid chainId: ${chainId}`);
    }
    const instance = new ethers.Contract(
        pool,
        uniPoolAbi,
        new ethers.JsonRpcProvider(rpcUrls[chainId])
    );
    const slot = await instance.slot0()
    return slot
}

export const getUniswapPool = async (chainId: number, token0: string, token1: string, feeTier: number) => {
    if (!isValidChainId(chainId)) {
        throw new Error(`Invalid chainId: ${chainId}`);
    }
    const instance = new ethers.Contract(
        uniswapContracts[chainId].factory as string,
        uniswapFactoryAbi,
        new ethers.JsonRpcProvider(rpcUrls[chainId])
    );
    const pool = await instance.getPool(token0, token1, feeTier)


    // await PriceRange(8453);
    // const currentPrice = 2725.91; // Example current price
    // const newMinPriceChange = -14;
    // const newMaxPriceChange = 14;

    // const newPrices = calculatePricesFromChanges(currentPrice, newMinPriceChange, newMaxPriceChange);
    // console.log("New Prices & Ticks:", newPrices);


    return pool
}

export const calculatePriceRange = async (
    chainId: number,
    nftId: number,
    pool: string,
    token0: string,
    token1: string,
    token0Decimal: number,
    token1Decimal: number,
    token0Symbol: string,
    token1Symbol: string,
    token0Name: string,
    token1Name: string
) => {
    const tokenA = new Token(chainId, token0, token0Decimal, token0Symbol, token0Name)
    const tokenB = new Token(chainId, token1, token1Decimal, token1Symbol, token1Name)

    const position = await fetchPosition(chainId, nftId)
    const slot = await getSlot(chainId, pool)
    // Compute price range
    const priceLower = tickToPrice(parseFloat(position.tickLower), tokenA, tokenB)
    const priceUpper = tickToPrice(parseFloat(position.tickUpper), tokenA, tokenB)
    const currentPrice = tickToPrice(parseFloat(slot.tick), tokenA, tokenB)

    const priceLowerNum = parseFloat(priceLower.toSignificant(6));
    const priceUpperNum = parseFloat(priceUpper.toSignificant(6));
    const currentPriceNum = parseFloat(currentPrice.toSignificant(6));

    // Compute percentages
    const widthPercentage = ((priceUpperNum - priceLowerNum) / currentPriceNum) * 100;
    const minPriceChange = ((priceLowerNum - currentPriceNum) / currentPriceNum) * 100;
    const maxPriceChange = ((priceUpperNum - currentPriceNum) / currentPriceNum) * 100;

    console.log(`Current Price: ${currentPriceNum}`)
    console.log(`Lower Bound : ${priceLowerNum}`)
    console.log(`Upper Bound: ${priceUpperNum}`)

    console.log(`Width: ${widthPercentage.toFixed(2)}%`);
    console.log(`Min Price Change: ${minPriceChange.toFixed(2)}%`);
    console.log(`Max Price Change: ${maxPriceChange.toFixed(2)}%`);
    return {
        currentPriceNum,
        priceLowerNum,
        priceUpperNum,
        widthPercentage: widthPercentage.toFixed(2),
        minPriceChange: minPriceChange.toFixed(2),
        maxPriceChange: maxPriceChange.toFixed(2),
    }
}

export function tickToPrice(tick: number, baseToken: Token, quoteToken: Token): Price<Token, Token> {
    if (tick < TickMath.MIN_TICK || tick > TickMath.MAX_TICK) {
        throw new Error('Tick out of range');
    }

    const sqrtPriceX96 = TickMath.getSqrtRatioAtTick(tick);

    return new Price(
        baseToken,
        quoteToken,
        JSBI.BigInt(2 ** 192).toString(),  // Convert JSBI to string
        JSBI.multiply(sqrtPriceX96, sqrtPriceX96).toString()  // Convert JSBI to string
    );
}

export const PriceRange = async (chainId: number) => {
    const tokenA = new Token(chainId, '0x4200000000000000000000000000000000000006', 18, 'WETH', 'Ethereum');
    const tokenB = new Token(chainId, '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', 6, 'USDC', 'USD Coin');

    // Compute price range
    const priceLower = tickToPrice(-198470, tokenA, tokenB);
    const priceUpper = tickToPrice(-195970, tokenA, tokenB);
    const currentPrice = tickToPrice(-197171, tokenA, tokenB);

    // Convert price objects to numbers
    const priceLowerNum = parseFloat(priceLower.toSignificant(6));
    const priceUpperNum = parseFloat(priceUpper.toSignificant(6));
    const currentPriceNum = parseFloat(currentPrice.toSignificant(6));

    // Compute percentages
    const widthPercentage = ((priceUpperNum - priceLowerNum) / currentPriceNum) * 100;
    const minPriceChange = ((priceLowerNum - currentPriceNum) / currentPriceNum) * 100;
    const maxPriceChange = ((priceUpperNum - currentPriceNum) / currentPriceNum) * 100;

    console.log("++++++++++++++++++++++++++++++++++++++");
    console.log(`Current Price: ${currentPriceNum}`);
    console.log(`Lower Bound: ${priceLowerNum}`);
    console.log(`Upper Bound: ${priceUpperNum}`);
    console.log(`Width: ${widthPercentage.toFixed(2)}%`);
    console.log(`Min Price Change: ${minPriceChange.toFixed(2)}%`);
    console.log(`Max Price Change: ${maxPriceChange.toFixed(2)}%`);
    console.log("++++++++++++++++++++++++++++++++++++++");
};

export const calculatePricesFromChanges = (
    currentPrice: number,
    newMinPriceChange: number,
    newMaxPriceChange: number
) => {
    console.log(nearestUsableTick(-198304, 200), "nearestUsableTick")
    // Calculate priceLower and priceUpper from the given percentage changes
    const priceLower = currentPrice * (1 + newMinPriceChange / 100);
    const priceUpper = currentPrice * (1 + newMaxPriceChange / 100);

    // Calculate new width percentage
    const widthPercentage = ((priceUpper - priceLower) / currentPrice) * 100;
    const minPriceChange = ((priceLower - currentPrice) / currentPrice) * 100;
    const maxPriceChange = ((priceUpper - currentPrice) / currentPrice) * 100;

    // Convert prices to tick values
    const newTickLower = Math.floor(Math.log(priceLower) / Math.log(1.0001));
    const newTickUpper = Math.floor(Math.log(priceUpper) / Math.log(1.0001));

    return {
        priceLower: priceLower.toFixed(6),
        priceUpper: priceUpper.toFixed(6),
        widthPercentage: widthPercentage.toFixed(2),
        minPriceChange,
        maxPriceChange,
        newTickLower,
        newTickUpper
    };
};

export const getClaimableAmount = async (
    chainId: number,
    nftId: number,
    wallet: string,
    pool: string,
    tickLower: number,
    tickUpper: number,
    liquidity: number,
    token0Decimal: number,
    token1Decimal: number,
    tokenIn: string,
    tokenOut: string,
    fee: number
) => {
    if (!isValidChainId(chainId)) {
        throw new Error(`Invalid chainId: ${chainId}`);
    }

    const instance = new ethers.Contract(
        uniswapContracts[chainId].nfpm as string,
        nfpmAbi,
        new ethers.JsonRpcProvider(rpcUrls[chainId])
    );

    const sickle = await getSickle(chainId, wallet)
    const results = await instance.collect.staticCall(
        {
            tokenId: nftId,
            recipient: sickle,
            amount0Max: MAX_UINT_128,
            amount1Max: MAX_UINT_128,
        }, { from: sickle }
    )

    const slot0 = await getSlot(chainId, pool)

    const sqrtPriceX96 = slot0.sqrtPriceX96;

    const tickCurrent = slot0.tick;

    // Convert sqrtPriceX96 to float
    const sqrtPrice = Number(sqrtPriceX96) / (2 ** 96);
    const sqrtPriceLower = Math.sqrt(1.0001 ** tickLower);
    const sqrtPriceUpper = Math.sqrt(1.0001 ** tickUpper);

    let amount0 = 0, amount1 = 0;

    if (tickCurrent < tickLower) {
        amount0 = liquidity * (1 / sqrtPriceLower - 1 / sqrtPriceUpper);
    } else if (tickCurrent > tickUpper) {
        amount1 = liquidity * (sqrtPriceUpper - sqrtPriceLower);
    } else {
        amount0 = liquidity * (1 / sqrtPrice - 1 / sqrtPriceUpper);
        amount1 = liquidity * (sqrtPrice - sqrtPriceLower);
    }

    amount0 = amount0 / 10 ** token0Decimal
    amount1 = amount1 / 10 ** token1Decimal
    const result = await getUniswapQuote(chainId, tokenIn, tokenOut, token0Decimal, 1)
    //@ts-expect-error ignore the warning
    const quote = parseFloat(result?.quoteDecimals)

    const a0 = amount0 * quote;
    const a1 = amount1;
    let swapAmount = 0;
    let token0 = "";
    let token1 = "";
    let receivedAmount = 0;
    let decimals = 0;
    let decimals1 = 0;

    if (a0 > a1) {
        // Swap Token0 into Token1
        swapAmount = (a0 - a1) / 2;
        token0 = tokenIn;
        token1 = tokenOut;
        decimals = token0Decimal;
        decimals1 = token1Decimal;
        // Convert from Token1 terms to Token0
        swapAmount = swapAmount / quote;
    } else if (a1 > a0) {
        // Swap Token1 into Token0
        swapAmount = (a1 - a0) / 2;
        token0 = tokenIn;
        token1 = tokenOut;
        decimals = token1Decimal;
        decimals1 = token0Decimal;
    }

    const result_ = await getUniswapQuote(chainId, token0, token1, decimals, swapAmount)
    console.log(chainId, token0, token1, typeof (decimals), decimals, typeof (swapAmount), swapAmount)
    //@ts-expect-error ignore the warning
    receivedAmount = parseFloat(result_?.quoteDecimals)

    let finalAmount0 = amount0;
    let finalAmount1 = amount1;

    if (token0 === tokenIn) {
        finalAmount0 -= swapAmount;
        finalAmount1 += receivedAmount;
    } else {
        finalAmount1 -= swapAmount;
        finalAmount0 += receivedAmount;
    }

    return {
        amount0: results.amount0.toString(),
        amount1: results.amount1.toString(),
        removeLp: {
            amount0: amount0.toFixed(4),
            amount1: amount1.toFixed(4),
            sqrtPrice,
            quote,
            receivedAmount,
            //@ts-expect-error ingore the warning
            route: result_?.route || "",
            swapAmount: swapAmount.toFixed(5),
            token0,
            token1,
            rawSwapAmount: toUnits(swapAmount.toFixed(5), decimals),
            rawReceivedAmount: toUnits(receivedAmount.toFixed(6), decimals1),
            extraData: encodeData(token0, fee, token1),
            finalAmount0: finalAmount0.toFixed(5),
            finalAmount1: finalAmount1.toFixed(5),

        }
    }
}

export const encodeData = (tokenIn: string, fee: number, tokenOut: string) => {
    const abiCoder = new AbiCoder();

    const routerAddress = '0xE29A829a1C86516b1d24b7966AF14Eb1BE2cD5d4';
    // Encode the path
    const path = ethers.solidityPacked(
        ['address', 'uint24', 'address'],
        [tokenIn, fee, tokenOut]
    );

    // Encode the UniswapV3SwapExtraData struct
    const extraData = abiCoder.encode(
        ['tuple(address, bytes)'],
        [[routerAddress, path]]
    );
    return extraData;
}

export const encodeInput = (swapRoutes: SwapRoute[], signer: string, amountIn: number, amountOut: number, decimals: number) => {
    const abiCoder = new AbiCoder();

    const path = ethers.solidityPacked(
        Array(swapRoutes.length).fill(['address', 'uint24']).flat().concat('address'),
        swapRoutes.flatMap(route => [route.from, route.fee]).concat(swapRoutes[swapRoutes.length - 1].to)
    );

    const inputData = abiCoder.encode(
        ["address", "uint256", "uint256", "bytes", "address"],
        [signer, toUnits(amountIn, decimals), amountOut, path, signer]
    );

    return [inputData];
};

export const encodedRoute = (swapRoutes: SwapRoute[]) => {

    const path = ethers.solidityPacked(
        Array(swapRoutes.length).fill(['address', 'uint24']).flat().concat('address'),
        swapRoutes.flatMap(route => [route.from, route.fee / 100]).concat(swapRoutes[swapRoutes.length - 1].to)
    );

    return path
}

export const fetchTokenDetails = async (chainId: number, token: string) => {
    const tokenContract = new ethers.Contract(token, erc20Abi, new ethers.JsonRpcProvider(rpcUrls[chainId]));
    const symbol = await tokenContract.symbol();
    const decimals = await tokenContract.decimals();

    return {
        address: token,
        symbol,
        decimals: Number(decimals),
        balance: 0
    }
}

export const fetchAmountsOut = async (chainId: number, amount: number, decimal0: number, decimal1: number, routes: Route[]) => {
    if (!isValidChainId(chainId)) {
        throw new Error(`Invalid chainId: ${chainId}`);
    }

    const router = new ethers.Contract(
        aerodromeContracts[chainId].router,
        routerAbi,
        new ethers.JsonRpcProvider(rpcUrls[chainId])
    );

    const amounts = await router.getAmountsOut(toUnits(amount, decimal0), routes)
    return fromUnits(amounts[amounts.length - 1], decimal1) || "0"
}

// aerodrome //

export const fetchGuage = async (chainId: number, pool: string) => {
    if (!isValidChainId(chainId)) {
        throw new Error(`Invalid chainId: ${chainId}`);
    }

    const voter = new ethers.Contract(
        aerodromeContracts[chainId].voter,
        voterAbi,
        new ethers.JsonRpcProvider(rpcUrls[chainId])
    );

    const guage = await voter.gauges(pool)
    if (guage === ZeroAddress) {
        return ""
    }
    return guage
}

export const fetchV2Pools = async (chainId: number, token0: string, token1: string, stable: boolean) => {
    if (!isValidChainId(chainId)) {
        throw new Error(`Invalid chainId: ${chainId}`);
    }

    const poolFactory = new ethers.Contract(
        aerodromeContracts[chainId].factory,
        poolFactoryAbi,
        new ethers.JsonRpcProvider(rpcUrls[chainId])
    );

    const pool = await poolFactory['getPool(address,address,bool)'](token0, token1, stable);

    if (pool === ZeroAddress) {
        const _token0 = await fetchTokenDetails(chainId, token0)
        const _token1 = await fetchTokenDetails(chainId, token1)
        const _symbol = stable ? "s" : "v"
        return [{
            stable,
            chainId,
            pool: ZeroAddress,
            token0,
            token1,
            symbol: _symbol + "AMM - " + `${_token0.symbol}/${_token1.symbol}`,
            status: false,
            action: "New Deposit",
        }]
    }

    const poolInstance = new ethers.Contract(
        pool,
        poolAbi,
        new ethers.JsonRpcProvider(rpcUrls[chainId])
    );

    const symbol = await poolInstance.name()
    // const metadata = await poolInstance.metadata() 

    return [{
        chainId,
        pool,
        symbol,
        token0,
        token1,
        tvl: 0,
        apr: 0,
        stable,
        poolBalance: 0,
        action: "Deposit",
        status: true,
        // r0: metadata[2].toString(),
        // r1: metadata[3].toString()
    }]
}

export const findIndex = async (chainId: number, pool: string) => {
    if (!isValidChainId(chainId)) {
        throw new Error(`Invalid chainId: ${chainId}`);
    }

    const poolFactory = new ethers.Contract(
        aerodromeContracts[chainId].factory,
        poolFactoryAbi,
        new ethers.JsonRpcProvider(rpcUrls[chainId])
    );

    let index_ = 0
    const totalPool = await poolFactory.allPoolsLength()
    for (let index = 0; index < totalPool; index++) {
        const _pool = await poolFactory.allPools(index)
        if (_pool.toLowerCase() === pool.toLocaleLowerCase()) {
            index_ = index
            break;
        }
    }
    return index_
}

export const isReset = async (chainId: number, tokenId: number) => {
    if (!isValidChainId(chainId)) {
        throw new Error(`Invalid chainId: ${chainId}`);
    }

    const voter = new ethers.Contract(
        aerodromeContracts[chainId].voter,
        voterAbi,
        new ethers.JsonRpcProvider(rpcUrls[chainId])
    );

    const isWeight = await voter.usedWeights(tokenId)
    if (Number(isWeight) === 0) {
        return true
    } else {
        return false
    }
}

// aerodrome //