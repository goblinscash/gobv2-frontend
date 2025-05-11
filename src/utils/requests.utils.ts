import axios from "axios"
import { getPoolDayDataQuery, getPoolDetailQuery, getTokenQuery, getTopPoolsQuery } from "./queries.utils";

export function getPoolDetails(subgraphUrl: string) {
    return async function (id: string) {
        const variables = { id };
        try {
            const response = await axios.post(
                subgraphUrl,
                {
                    query: getPoolDetailQuery,
                    variables: variables,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            const { data } = response.data;
            return data;
        } catch (error) {
            //@ts-expect-error ts warning
            throw new Error(`Error fetching data: ${error.message || error}`);
        }
    };
}

export function getTokenDetails(subgraphUrl: string) {
    return async function (id: string) {
        const variables = { id };
        try {
            const response = await axios.post(
                subgraphUrl,
                {
                    query: getTokenQuery,
                    variables: variables,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            const { data } = response.data;
            return data;
        } catch (error) {
            //@ts-expect-error ts warning
            throw new Error(`Error fetching data: ${error.message || error}`);
        }
    };
}

export function getTopPools(subgraphUrl: string) {
    return async (orderBy: string, orderDirection: string) => {
        const variables = { orderBy, orderDirection };
        try {
            const response = await axios.post(
                subgraphUrl,
                {
                    query: getTopPoolsQuery,
                    variables,
                },
                {
                    headers: { "Content-Type": "application/json" },
                }
            );
            if (response.data.errors) {
                throw new Error(`GraphQL Error: ${JSON.stringify(response.data.errors)}`);
            }
            return response.data.data;
        } catch (error) {
            console.error("Error fetching top pools:", error);
            //@ts-expect-error warning
            throw new Error(`Error fetching data: ${error.message || error}`);
        }
    };
}

export function getPoolDayData(subgraphUrl: string) {
    return async function (id: string) {
        const variables = { id };
        try {
            const response = await axios.post(
                subgraphUrl,
                {
                    query: getPoolDayDataQuery,
                    variables: variables,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            const { data } = response.data;
            if (!data?.pools?.[0]?.poolDayData?.length) {
                return {
                    feesUSD: 0,
                    data,
                };
            }
            const poolDayData = data.pools[0].poolDayData;
            //@ts-expect-error ts warning
            const feesUSD = poolDayData.reduce((max, obj) => obj.date > max.date ? obj : max, poolDayData[0])

            const apr = (parseFloat(feesUSD.feesUSD) / parseFloat(data.pools[0].totalValueLockedUSD)) * 100;
            return {
                feesUSD,
                apr: apr? apr.toFixed(3) : 0,
            };
        } catch (error) {
            //@ts-expect-error ts warning
            throw new Error(`Error fetching data: ${error.message || error}`);
        }
    };
}