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

type ChainContracts = {
    [key: number]: {
        UniswapV3Connector?: string;
        AerodromeRouterConnector?: string;
        NftFarmStrategy?: string;
        SickleImplementation?: string;
        SickleFactory?: string;
        NftSettingsRegistry?: string;
        SickleRegistry?: string;
        ConnectorRegistry?: string;
        NftTransferLib?: string;
        NftSettingsLib?: string;
        FeesLib?: string;
        TransferLib?: string;
        SwapLib?: string;
        NftZapLib?: string;
    };
};

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


export const vfatContracts: ChainContracts = {
    84532: {
        UniswapV3Connector: "0x5d6094F3d68d725153d0938ce5b0E4D7815B42A7",
        AerodromeRouterConnector: "0x43FDB828aD3D705Fc5D25467f078a724fC209c5D",
        NftFarmStrategy: "0xE174bB384365CBD50BF50E8dEeA7DF8b8808dfac",
        SickleImplementation: "0x527A36c3C0e66d10664954cd86B156670e6871E0",
        SickleFactory: "0x62fB598f4a7379Ca36c2d031443F6c97B8F60C3f",
        NftSettingsRegistry: "0xcec6e003108B15FA31A7F5BD80f91aAab3E565CF",
        SickleRegistry: "0xFd8E0705EdCc01A142ed0a8e76F036e38B72Bcc3",
        ConnectorRegistry: "0xdBaE2aA28b83b952f7542F87420897F4e12F1A99",
        NftTransferLib: "0xa2C3056E4150A9Df0459FEd70Bc735702dC6Cc30",
        NftSettingsLib: "0x4FDAd64621cd20CCC94164bF81C299ff75346E6a",
        FeesLib: "0x2c2fC8A1CDa7d853a214e294ea40De03d9fC1d2D",
        TransferLib: "0x64e72a67eaE17aa771D97eA07e3407b171f33Fe5",
        SwapLib: "0xd98634607C1FEc0dfB925c64037a675eb17a2fc2",
        NftZapLib: "0x758a3B49A4Fee14B18CC8dFA5CeB547Acc594f21"
    },
    8453: {
        UniswapV3Connector: "0x5d53c9614C9054E622b1eA35231cEc2049A3a44e",
        AerodromeRouterConnector: "",
        NftFarmStrategy: "0x63B7CB79f503cB9BB154DD3bfFC1095edb272df3",
        SickleImplementation: "0x72a72C80fe211bEaBce5516974fffa2c9aECBb3D",
        SickleFactory: "0x52FFaccCBC6B6854Dd639D31b524CFe7485C8e67",
        NftSettingsRegistry: "0x7e8CfE955e6C747FD3Cd34361410d0933558ff16",
        SickleRegistry: "0xF1Cf2598d89215d15578813aBc04698BB55b8E3F",
        ConnectorRegistry: "0x7d540FC712004c30A288962abAc7b47A86907734",
        NftTransferLib: "0x359A5f4AD8A13cfad7b7C9459929AEDba930BBa8",
        NftSettingsLib: "0x993A70694594B40b6fBa8Bd228111705e5af32fa",
        FeesLib: "0x39318fea5B43BE55615c8c2fa9Ac3913425a8A74",
        TransferLib: "0x20fd03a19Fa0c45f54b8Cc2a0781B10CcE6A1936",
        SwapLib: "0x98dc8aC4a5AcCbc17bBd91E8cFceb9fc2F317802",
        NftZapLib: "0x335f82f20E33400258a1cd235bEC4D6B8E601796"
    },
    56: {

    }
}

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