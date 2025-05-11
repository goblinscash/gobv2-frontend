
interface RouteResponse {
    //@ts-expect-error ignore warning
    data;
    error?: string;
}

async function fetchKyberSwapRoute(
    tokenIn: string,
    tokenOut: string,
    amountIn: string,
    slippage: number,
    spender: string
): Promise<RouteResponse> {
    try {
        const response = await fetch(`https://aggregator-api.kyberswap.com/base/api/v1/routes?tokenIn=${tokenIn}&tokenOut=${tokenOut}&amountIn=${amountIn}&gasInclude=true`, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "x-client-id": "MyAwesomeApp"
            },
        });

        const data_ = await response.json();

        const response_ = await fetch('https://aggregator-api.kyberswap.com/base/api/v1/route/build', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "x-client-id": "MyAwesomeApp"
            },
            body: JSON.stringify({
                "sender": spender,
                "recipient": spender,
                "deadline": Date.now() + 20 * 60,
                "slippageTolerance": 100,
                // "enableGasEstimation": false,
                // "ignoreCappedSlippage": true,
                "routeSummary": data_?.data?.routeSummary
            })
        });

       

        console.log(data_, "++++data_")

        const data = await response_.json();

        // const abiCoder = new AbiCoder();
        // const decodedData = abiCoder.decode(
        //     ["address", "uint256", "bytes"], 
        //     data.data
        // );

        // console.log(decodedData);;


        return data;
    } catch (error) {
        console.error('Error fetching KyberSwap route:', error);
        //@ts-expect-error ignore warning
        return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
}



export const fetchSwapRoute = async (
    tokenIn: string,
    tokenOut: string,
    amountIn: string,
    slippage: number,
    spender: string
) => {

    const route = await fetchKyberSwapRoute(tokenIn, tokenOut, amountIn, slippage, spender);
    return route;
}
