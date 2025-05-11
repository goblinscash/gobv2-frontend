
export const getPoolDetailQuery = `
  query ($id: String!) {
    pool(id: $id) {
      id
      token0 {
        id
        decimals
        name
        symbol
      }
      token1 {
        id
        decimals
        name
        symbol
      }
      liquidity
      token0Price
      token1Price
      sqrtPrice
      feeTier
      volumeToken0
      volumeToken1
      totalValueLockedUSD
    }
  }
`;

export const getTopPoolsQuery = `
  query ($orderBy: Pool_orderBy, $orderDirection: OrderDirection) {
    pools(
      first: 20
      orderBy: $orderBy
      orderDirection: $orderDirection
      subgraphError: allow
      where: { totalValueLockedUSD_gte: 1000 }
    ) {
      id
      txCount
      totalValueLockedUSD
      feeTier
      tick
      token0 {
        id
        symbol
        decimals
      }
      token1 {
        id
        symbol
        decimals
      }
    }
  }
`;

export const getTokenQuery = `
  query ($id: ID!) {
     token(id: $id) {
        id
        name
        symbol
        decimals
        totalSupply
     }
  }
`;

export const getPoolDayDataQuery = `
  query ($id: String!) {
    pools(where: {id: $id}) {
    collectedFeesUSD
    collectedFeesToken1
    collectedFeesToken0
    totalValueLockedUSD
    poolDayData(orderBy: date, orderDirection: desc) {
      date
      feesUSD
    }
  }
  }
`;