export type UniswapContract = {
    factory?: string;
    nfpm?: string;
    quoterv2: string
};

type UniswapContracts = Record<number, UniswapContract>;

export type AerodromeContract = {
    router: string;
    factory: string;
    lpSugar: string;
    veSugar: string;
    universalRouter: string;
    voter: string;
    votingEscrow: string;
    rewardSugar: string;
    relaySugar: string;

}

type AerodromeContracts = Record<number, AerodromeContract>;

export const uniswapContracts: UniswapContracts = {
    84532: {
        factory: "0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24",
        nfpm: "0x27F971cb582BF9E50F397e4d29a5C7A34f11faA2",
        quoterv2: ""
    },
    8453: {
        factory: "0xE82Fa4d4Ff25bad8B07c4d1ebd50e83180DD5eB8",
        nfpm: "0x3f11feF6633f9aF950426fEe3eaE6e68943E28A0",
        quoterv2: "0xcbf872c837bAd15b0a0283A5C5936FBD1b66BEaf"
    },
    56: {
        factory: "",
        nfpm: "",
        quoterv2: ""
    }
};

export const aerodromeContracts: AerodromeContracts = {
    84532: {
        router: "0x1B683c08f448eA190Dd9B53EA756aB7B00085DE1",
        factory: "0x5F47613A76C1c01BcE11b3D398de16E38c3d4DCb",
        lpSugar: "0x53cAf0F9B280edf9A8393150Bf4e1A0C25094979", 
        veSugar: "0xEBeEF79Ca7eEe38b9a1c26e3035992D8fdE3E77F",
        rewardSugar: "0xe7f902bdB9f279a327F7F29D5b6c8FfA75B87085",
        relaySugar: "0x44491fFF022d5b20B56E8Ce3aC1DFC80C500d197", //"0xe7f1ee125f8b5945d9a6b0338875686a07579675",
        universalRouter: "0xb73C095FE9818B0a75715E5959716faf29d27296",
        voter: "0xc84C4ebbC5671795D4DBf1d8A369897CB471B230",
        votingEscrow: '0xe015feb0B3cDDb683d450Cf698B34E0BeF714B65',        
    },
    8453: {
        router: "0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43",
        factory: "",
        lpSugar: "0x2Efe0713EfA0221070A2202b14bD1a6E3E12CEbE",  //"0x799351F408a51A0Ca5fdB4CD9E93157D8703b70A" //"0x8D1eaAFe47D6b2d560d69Ff44A7e0D48980ab69b"
        veSugar: "0x09b54f38d78468647e0469fc4c64502433c710cf", //"0x4c5d3925fe65DFeB5A079485136e4De09cb664A5",
        rewardSugar: "0xA44600F4DBA6683d8BD99270B1A6a143fB9F1C3B",
        relaySugar: "0x8932B5FE23C07Df06533F8f09E43e7cca6a24143",
        universalRouter: "0x6Cb442acF35158D5eDa88fe602221b67B400Be3E",
        voter: "0x16613524e02ad97eDfeF371bC883F2F5d6C480A5",
        votingEscrow: "0xeBf418Fe2512e7E6bd9b87a8F0f294aCDC67e6B4"
    },
    56: {
        router: "",
        factory: "",
        lpSugar: "",
        veSugar: "",
        rewardSugar: "",
        relaySugar: "",
        universalRouter: "",
        voter: "",
        votingEscrow: ''
    }
};

export type RpcUrls = {
    [key: number]: string;
};

export const rpcUrls: RpcUrls = {
    84532: "https://base-sepolia-rpc.publicnode.com",
    8453: "https://mainnet.base.org",
    56: ""
} as const

export const explorerUrls: RpcUrls = {
    84532: "https://sepolia.basescan.org/tx/",
    8453: "https://basescan.org/tx/",
    56: ""
} as const


export type SubgraphUrls = {
    [key: number]: string;
};

export const subGraphUrls: SubgraphUrls = {
    8453: "https://graph-base.goblins.cash/subgraphs/name/goblins/base-subgraph-v3",
    10000: "https://graph.dfd.cash/subgraphs/name/goblins/subgraph-v3",
    56: "https://graph-bsc.goblins.cash/subgraphs/name/goblins/bsc-subgraph-v3"
} as const

export const zeroAddr = "0x0000000000000000000000000000000000000000"