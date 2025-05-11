import { ethers } from "ethers";

interface TimeResult {
  humanDate: string;
  relative: string;
  originalTimestamp: number;
}


export const shortenPubkey = (address: string): string => {
  if (!address) {
    return ''
  }
  return `${address.slice(0, 5)}...${address.slice(-5)}`;
};


export const fromUnits = (value: string | number | bigint, decimals: number): string | undefined => {
  if (value === undefined || value === null || isNaN(Number(value))) {
    return;
  }

  if (!decimals && decimals !== 0) {
    return;
  }

  // Convert to a safe BigInt format
  let bigIntValue: bigint;
  try {
    if (typeof value === "number") {
      bigIntValue = BigInt(Math.floor(value)); // Ensure integer
    } else {
      bigIntValue = BigInt(value.toString()); // Safe conversion for string/bigint
    }
  } catch (error) {
    console.error("Error converting to BigInt:", error);
    return;
  }

  const formatValue = ethers.formatUnits(bigIntValue, decimals)
  return Number(formatValue).toFixed(4);
};


export const toUnits = (value: string | number, decimals: number): bigint => {
  return ethers.parseUnits(value.toString(), decimals);
}

export const formatValue = (value: bigint | string | number | boolean | null | undefined) => (typeof value === "bigint" ? value.toString() : value);

export const formatTimestamp = (timestamp: number) => {
  const now = Math.floor(Date.now() / 1000);
  const diff = timestamp - now; // Positive if in the future, negative if in the past
  const secondsInMinute = 60;
  const secondsInHour = 3600;
  const secondsInDay = 86400;
  const secondsInMonth = 2592000;
  const secondsInYear = 31536000;

  const getTimeString = (value: number, unit: string) =>
    `${value} ${unit}${value !== 1 ? "s" : ""}`;

  let result = "";

  if (Math.abs(diff) < secondsInHour) {
    const minutes = Math.floor(Math.abs(diff) / secondsInMinute);
    result = getTimeString(minutes, "minute");
  } else if (Math.abs(diff) < secondsInDay) {
    const hours = Math.floor(Math.abs(diff) / secondsInHour);
    result = getTimeString(hours, "hour");
  } else if (Math.abs(diff) < secondsInMonth) {
    const days = Math.floor(Math.abs(diff) / secondsInDay);
    result = getTimeString(days, "day");
  } else if (Math.abs(diff) < secondsInYear) {
    const months = Math.floor(Math.abs(diff) / secondsInMonth);
    result = getTimeString(months, "month");
  } else {
    const years = Math.floor(Math.abs(diff) / secondsInYear);
    result = getTimeString(years, "year");
  }

  return diff > 0 ? `Unlocks in ${result}` : `Unlocked ${result} ago`;
};



export const getTimeSince = (timestamp: number): TimeResult => {
  const date = new Date(timestamp * 1000);
  const now = new Date();

  const diffMs = now.getTime() - date.getTime();

  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  const humanDate = date.toLocaleString();

  // Determine appropriate relative time
  let relativeTime: string;
  if (diffDays > 0) {
    relativeTime = `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  } else if (diffHours > 0) {
    relativeTime = `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  } else if (diffMinutes > 0) {
    relativeTime = `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
  } else {
    relativeTime = `${diffSeconds} second${diffSeconds === 1 ? '' : 's'} ago`;
  }

  return {
    humanDate,
    relative: relativeTime,
    originalTimestamp: timestamp
  };
}

export const isResetAvailable = (timestamp: number, chainId: number): boolean => {
  const now: number = Math.floor(Date.now() / 1000);

  const day = chainId === 8453 ? 7 : 1
  const dayInSeconds: number = day * 24 * 60 * 60;

  return (now - timestamp) > dayInSeconds;
}


// export const calculateRebaseAPR = (
//     rebaseAmount: string,
//     lockedAmount: string,
//     decimals: string
//   ) => {
//     const rebase = parseFloat(rebaseAmount) / 10 ** parseInt(decimals);
//     const locked = parseFloat(lockedAmount) / 10 ** parseInt(decimals);

//     if (locked === 0) return 0;

//     const yearlyRebase = rebase * 52;
//     const apr = (yearlyRebase / locked) * 100;
//     return apr.toFixed(5);
//   };

export const calculateRebaseAPR = (
  rebaseAmount: string,
  lockedAmount: string,
  decimals: string
) => {
  // const rebase = parseFloat(rebaseAmount) / 10 ** parseInt(decimals);
  const locked = parseFloat(lockedAmount) / 10 ** parseInt(decimals);

  if (locked === 0) return 0;

  // const yearlyApr = ((rebase) / 78811) * 7 * 24* 60* 60

  return 7 //yearlyApr.toFixed(5);
};

