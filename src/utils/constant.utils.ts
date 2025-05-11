export const MAX_UINT_128 = "340282366920938463463374607431768211455"; // 2^128 - 1
export const UNI_ROUTING_API_URL = "https://vo7hqx6hkl.execute-api.us-east-1.amazonaws.com/prod";
export const ROUTE_API_URI = "https://fastapi.goblins.cash/quote"
export const SUPPORTED_CHAIN = [8453, 84532]

type TokenInfo = {
    address: string;
    symbol: string;
    decimals: number;
};

type StableTokenMap = {
    [key: number]: {
        name: string;
        symbol: string;
        address: string;
        chainId: number;
        decimals: number;
        logoURI: string;
    }[];
};

export const gobV2: Record<number, TokenInfo> = {
    8453: {
        address: "0xcDBa3E4C5c505F37CfbBB7aCCF20D57e793568E3",
        symbol: "AERO",
        decimals: 18
    },
    84532: {
        address: "0xe0D6d4649e27882A8C235C27634F8cC4683c4DAc",
        symbol: "GOBV2",
        decimals: 18
    }
}

export const stableToken: StableTokenMap = {
    8453: [
        {
            "name": "USD Token",
            "symbol": "USDC",
            "address": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
            "chainId": 8453,
            "decimals": 6,
            "logoURI": "https://raw.githubusercontent.com/goblinscash/goblins-icons/main/icons/usdc.png"
        },
        {
            "name": "Bridged Tether USD",
            "symbol": "USDT",
            "address": "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2",
            "chainId": 8453,
            "decimals": 6,
            "logoURI": "https://basescan.org/token/images/tether_128.png"
        }
    ],
    84532: [
        {
            "name": "BCH Token",
            "symbol": "BCH",
            "address": "0x0a3bAc370a60061A5939c72D5165f94FBed18A76",
            "chainId": 84532,
            "decimals": 18,
            "logoURI": "https://raw.githubusercontent.com/goblinscash/goblins-icons/main/icons/bch.png"
        },
        {
            "name": "Bridged Tether USD",
            "symbol": "USDT",
            "address": "0xc7CFD173944b435405c7196DDca63aC08ae39720",
            "chainId": 84532,
            "decimals": 18,
            "logoURI": "https://basescan.org/token/images/tether_128.png"
        },
        // {
        //     "name": "Bridged Tether USD",
        //     "symbol": "Usdt",
        //     "address": "0xf1220b3Bb3839e6f4e5dF59321fbaD2981c1CE89",
        //     "chainId": 84532,
        //     "decimals": 18,
        //     "logoURI": "https://basescan.org/token/images/tether_128.png"
        // },
        // {
        //     "name": "USDC",
        //     "symbol": "USDC",
        //     "address": "0x8B56D59cd9b1Ce5dd1Fb2A4e3cA7FBE3043Be42F",
        //     "chainId": 84532,
        //     "decimals": 18,
        //     "logoURI": "https://basescan.org/token/images/tether_128.png"
        // }
    ]
}

export const stableTokens = (chainId: number) => {
    const SUPPORTED_CHAIN = [8453, 84532];
    const id = SUPPORTED_CHAIN.includes(chainId) ? chainId : 8453;
    return (stableToken)[id] || []
}