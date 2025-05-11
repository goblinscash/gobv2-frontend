import { useMemo } from "react";
import { tokenLogos } from "@myswap/token-list";

const SUPPORTED_CHAINS: number[] = [10000, 8453, 56];

interface TokenLogos {
  [address: string]: string;
}

const useTokenLogoUrl = (chainId: number, checksummedAddress: string | null): string | null => {
  return useMemo(() => {
    if (!checksummedAddress || !SUPPORTED_CHAINS.includes(chainId)) {
      return null;
    }
    const logos = tokenLogos as TokenLogos;
    return logos[checksummedAddress.toLowerCase()] ?? null;
  }, [chainId, checksummedAddress]);
};

export default useTokenLogoUrl;
