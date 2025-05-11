"use client";
import React, { useEffect, useState } from "react";
import { ToggleSwitch } from "@/components/common";
import { components } from "react-select";
import { useEthersSigner } from "@/hooks/useEthersSigner";
import { useAccount, useChainId } from "wagmi";
import { subGraphUrls, uniswapContracts, vfatContracts } from "@/utils/config.utils";
import { getCompoundParams, getHarvestParams, getIncreaseParams, getRebalanceParms, getWithdrawParams } from "@/utils/vfat/farmData.utils";
import { ethers } from "ethers";
import farmStrategyAbi from "../../../abi/farmStrategy.json";
import BtnLoader from "@/components/common/BtnLoader";
import Logo from "@/components/common/Logo";
import { approve, calculatePriceRange, calculatePricesFromChanges, encodeData, getClaimableAmount, getPredictedSickle, getUniswapPool } from "@/utils/web3.utils";
import { toUnits } from "@/utils/math.utils";
import PriceRangeGraph from "@/components/priceRange"
import { getPoolDayData } from "@/utils/requests.utils";
import { fetchSwapRoute } from "@/utils/vfat/kyberswap.utils";
import ActButton from "@/components/common/ActButton";


// Custom styles
const customStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: "#1a1919", // Background color of select
    borderColor: state.isFocused ? "#353231" : "#353231", // Border color
    color: "#333", // Text color
    boxShadow: state.isFocused ? "none" : "none",
    "&:hover": {
      borderColor: "unset", // Border color on hover
    },
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "#007bff", // Color of selected value
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: "#353231",
    borderRadius: 10,
  }),
  menuList: (provided) => ({
    ...provided,
    backgroundColor: "#353231", // Change menu list background color
    color: "#fff", // Text color of menu list
    borderRadius: 6,
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "#1a1919" // Background of selected option
      : state.isFocused
        ? "#1a1919" // Background on hover
        : "#353231", // Default background

    color: state.isSelected ? "#fff" : "#fff", // Text color
    "&:hover": {
      backgroundColor: "#1a1919",
      color: "#fff",
    },
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    padding: 0,
  }),
};

// Custom Dropdown Indicator component
const CustomDropdownIndicator = (props) => {
  return (
    //@ts-expect-error warning
    <components.DropdownIndicator {...props}>
      <div className="pr-1">{exhangeIcn}</div>
    </components.DropdownIndicator>
  );
};

//@ts-expect-error warning
const SingleValue = ({ data }) => (
  <div className="flex items-center gap-2 text-white">
    <img
      src={data.image}
      alt={data.label}
      style={{ width: 20, height: 20, marginRight: 8 }}
    />
    {data.label}
  </div>
);

const CustomOption = (props) => {
  //@ts-expect-error any type
  const { data, innerRef, innerProps } = props;
  return (
    <div
      ref={innerRef}
      {...innerProps}
      style={{ display: "flex", alignItems: "center", padding: "10px" }}
    >
      <img
        src={data.image}
        alt={data.label}
        style={{ width: 20, height: 20, marginRight: 8 }}
      />
      {data.label}
    </div>
  );
};

const options = [
  {
    value: "apple",
    label: "Apple",
    image: "https://via.placeholder.com/20/FF0000/FFFFFF?text=A",
  },
  {
    value: "banana",
    label: "Banana",
    image: "https://via.placeholder.com/20/FFD700/000000?text=B",
  },
  {
    value: "cherry",
    label: "Cherry",
    image: "https://via.placeholder.com/20/8B0000/FFFFFF?text=C",
  },
];

const exhangeIcn = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m3 16 4 4 4-4"></path>
    <path d="M7 20V4"></path>
    <path d="m21 8-4-4-4 4"></path>
    <path d="M17 4v16"></path>
  </svg>
);

const icn1 = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 8V4H8"></path>
    <rect width="16" height="12" x="4" y="8" rx="2"></rect>
    <path d="M2 14h2"></path>
    <path d="M20 14h2"></path>
    <path d="M15 13v2"></path>
    <path d="M9 13v2"></path>
  </svg>
);

const cross = (
  <svg
    width="12"
    height="12"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M17 17L1 1M17 1L1 17"
      stroke="#fff"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const PositionManagementPopup = ({ position, setPosition, nftPosition }) => {
  const signer = useEthersSigner();
  const chainId = useChainId();
  const { address } = useAccount();
  const [load, setLoad] = useState({});
  const [apr, setApr] = useState({});
  const [claimInfo, setClaimInfo] = useState(null);
  const [formStatus, setFormStatus] = useState({ Increase: true });
  const [priceRange, setPriceRange] = useState({
    currentPriceNum: "",
    maxPriceChange: "",
    minPriceChange: "",
    priceLowerNum: "",
    priceUpperNum: "",
    widthPercentage: "",
    tickLower: "",
    tickUpper: ""
  });

  const [data, setData] = useState({
    amount0Desired: "",
    amount1Desired: "",
  });

  const fetchPoolData = async () => {
    const token0 = nftPosition.position.token0;
    const token1 = nftPosition.position.token1;
    const fee = nftPosition.position.fee
    const pool = await getUniswapPool(chainId, token0, token1, fee)
    const poolFc = getPoolDayData(subGraphUrls[Number(chainId) || 8453]);
    const _apr = await poolFc(pool.toLowerCase());
    setApr(_apr)
  };

  const swapRootInfo = async () => {
    const token0 = nftPosition.position.token0;
    const token1 = nftPosition.position.token1;
    const fee = nftPosition.position.fee
    const pool = await getUniswapPool(chainId, token0, token1, fee)
    const _info = await getClaimableAmount(
      chainId,
      nftPosition.nftId.toString(),
      address,
      pool,
      parseInt(nftPosition.position.tickLower),
      parseInt(nftPosition.position.tickUpper),
      nftPosition.position.liquidity,
      parseInt(nftPosition.token0.decimals),
      parseInt(nftPosition.token1.decimals),
      token0,
      token1,
      fee
    )
    setClaimInfo(_info)
  }

  const handleChange = (e) => {
    const { name, value } = e.target;

    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLoad = (action, status) => {
    setLoad((prev) => ({ ...prev, [action]: status }));
  };

  const handleFormStatus = (activeForm) => {
    setFormStatus({ [activeForm]: true });
  };

  useEffect(() => {
    if (chainId && nftPosition) {
      getPriceRange()
      fetchPoolData()
    }
  }, [chainId, nftPosition])

  useEffect(() => {
    if (chainId && nftPosition) {
      swapRootInfo()
    }
  }, [chainId, nftPosition])

  const handlePriceChange = (e) => {
    const { name, value } = e.target;

    const numericValue = value === "" ? 0 : parseFloat(value);

    setPriceRange((prev) => {
      const updatedRange = {
        ...prev,
        [name]: value,
      };

      const currentPrice = parseFloat(prev.currentPriceNum) || 0;
      const newMinPriceChange = parseFloat(updatedRange.minPriceChange) || 0;
      const newMaxPriceChange = parseFloat(updatedRange.maxPriceChange) || 0;

      if (currentPrice > 0) {
        const calculatedPrices = calculatePricesFromChanges(
          currentPrice,
          newMinPriceChange,
          newMaxPriceChange
        );

        return {
          ...updatedRange,
          priceLowerNum: calculatedPrices.priceLower,
          priceUpperNum: calculatedPrices.priceUpper,
          widthPercentage: calculatedPrices.widthPercentage,
          tickLower: calculatedPrices.newTickLower,
          tickUpper: calculatedPrices.newTickUpper
        };
      }

      return updatedRange;
    });
  };


  const getPriceRange = async () => {
    const token0 = nftPosition.token0.id;
    const token1 = nftPosition.token1.id;
    const fee = nftPosition.position.fee
    const pool = await getUniswapPool(chainId, token0, token1, fee)
    const _priceRange = await calculatePriceRange(
      chainId,
      nftPosition.nftId,
      pool,
      token0,
      token1,
      parseInt(nftPosition.token0.decimals),
      parseInt(nftPosition.token1.decimals),
      nftPosition.token0.symbol,
      nftPosition.token1.symbol,
      nftPosition.token0.name,
      nftPosition.token1.name,
    )
    setPriceRange(_priceRange)
    console.log(_priceRange, "priceRange")
  }

  const harvest = async () => {
    if (!address) return;
    try {
      handleLoad("Harvest", true)
      const uniswapContract = uniswapContracts[Number(chainId)];
      const token0 = nftPosition.token0.id;
      const token1 = nftPosition.token1.id;
      const sweepTokens = [token0, token1]

      const param = {
        stakingContract: uniswapContract.nfpm,
        tokenId: nftPosition.nftId.toString(),
        rewardTokens: sweepTokens,
        outputTokens: sweepTokens,
        sweepTokens: sweepTokens
      }

      const { position, params } = getHarvestParams(param)

      const nftFarmStrategy = new ethers.Contract(
        vfatContracts[Number(chainId)].NftFarmStrategy,
        farmStrategyAbi,
        await signer
      );

      const tx = await nftFarmStrategy.harvest(
        position,
        params,
        { gasLimit: 5000000 }
      );

      await tx.wait();
      handleLoad("Harvest", false)
    } catch (error) {
      console.log(error)
      handleLoad("Harvest", false)
    }
  }

  const rebalance = async () => {
    try {
      if (!address) return;
      handleLoad("Rebalance", true)
      const router= "0xE29A829a1C86516b1d24b7966AF14Eb1BE2cD5d4"
      const uniswapContract = uniswapContracts[Number(chainId)];
      const token0 = nftPosition.token0.id;
      const token1 = nftPosition.token1.id;
      const sweepTokens = [token0, token1]
      const pool = await getUniswapPool(chainId, token0, token1, nftPosition.position.fee)
      //@ts-expect-error ts warning
      const predictedSickle = await getPredictedSickle(chainId, address);

      const tx0Approve = await approve(
        token0,
        await signer,
        predictedSickle,
        parseInt(claimInfo.removeLp.rawSwapAmount),
        parseInt(nftPosition.token0.decimals)
      );
      if (tx0Approve) {
        await tx0Approve.wait();
      }

      const tx1Approve = await approve(
        token1,
        await signer,
        predictedSickle,
        5,
        parseInt(nftPosition.token1.decimals)
      );
      if (tx1Approve) {
        await tx1Approve.wait();
      }

      const route = await fetchSwapRoute(
        claimInfo.removeLp.token0,
        token1,
        parseInt(claimInfo.removeLp.rawSwapAmount),
        100,
        predictedSickle
      )

      const { params } = getRebalanceParms(
        pool,
        token0,
        token1,
        nftPosition.nftId.toString(),
        nftPosition.position.liquidity,
        uniswapContract.nfpm,
        nftPosition.position.fee,
        -299600, //nftPosition.position.tickLower.toString() * 2,
        -215200, //nftPosition.position.tickUpper.toString() * 2,
        sweepTokens,
        sweepTokens,
        route.data.amountIn,
        route.data.amountOut,
        claimInfo.removeLp.token0,
        claimInfo.removeLp.extraData,//route.data?.data,
        router //route.data?.routerAddress
      )

      const nftFarmStrategy = new ethers.Contract(
        vfatContracts[Number(chainId)].NftFarmStrategy,
        farmStrategyAbi,
        await signer
      );

      const tx = await nftFarmStrategy.rebalance(
        params,
        sweepTokens,
        { gasLimit: 8000000 }
      );

      await tx.wait();
      handleLoad("Rebalance", false)
    } catch (error) {
      console.log(error)
      handleLoad("Rebalance", false)
    }
  }

  const increase = async () => {
    try {
      if (!address) return;
      handleLoad("Increase", true)
      const uniswapContract = uniswapContracts[Number(chainId)];
      const token0 = nftPosition.token0.id;
      const token1 = nftPosition.token1.id;
      const sweepTokens = [token0, token1]
      const inPlace = true;

      const { position, harvestParams, increaseParams } = getIncreaseParams(
        token0,
        token1,
        nftPosition.nftId.toString(),
        uniswapContract.nfpm,
        nftPosition.position.fee,
        nftPosition?.position.tickLower,
        nftPosition?.position.tickUpper,
        sweepTokens,
        toUnits(data.amount0Desired, parseInt(nftPosition.token0.decimals)).toString(),
        toUnits(data.amount1Desired, parseInt(nftPosition.token1.decimals)).toString(),
      )

      //@ts-expect-error ts warning
      const predictedSickle = await getPredictedSickle(chainId, address);
      const tx0Approve = await approve(
        token0,
        await signer,
        predictedSickle,
        parseFloat(data.amount0Desired),
        parseInt(nftPosition.token0.decimals)
      );
      if (tx0Approve) {
        await tx0Approve.wait();
      }

      const tx1Approve = await approve(
        token1,
        await signer,
        predictedSickle,
        parseFloat(data.amount1Desired),
        parseInt(nftPosition.token1.decimals)
      );
      if (tx1Approve) {
        await tx1Approve.wait();
      }

      const nftFarmStrategy = new ethers.Contract(
        vfatContracts[Number(chainId)].NftFarmStrategy,
        farmStrategyAbi,
        await signer
      );

      const tx = await nftFarmStrategy.increase(
        position,
        harvestParams,
        increaseParams,
        inPlace,
        sweepTokens,
        { gasLimit: 5000000 }
      );

      await tx.wait();
      handleLoad("Increase", false)
    } catch (error) {
      console.log(error)
      handleLoad("Increase", false)
    }
  }

  const compound = async () => {
    try {
      if (!address) return;
      handleLoad("Compound", true)
      const uniswapContract = uniswapContracts[Number(chainId)];
      const token0 = nftPosition.token0.id;
      const token1 = nftPosition.token1.id;
      const sweepTokens = [token0, token1]
      const inPlace = true

      const { position, params } = getCompoundParams(
        token0,
        token1,
        nftPosition.nftId.toString(),
        uniswapContract.nfpm,
        nftPosition.position.fee,
        nftPosition?.position.tickLower.toString(),
        nftPosition?.position.tickUpper.toString(),
        sweepTokens
      )

      //@ts-expect-error ts warning
      const predictedSickle = await getPredictedSickle(chainId, address);
      const tx0Approve = await approve(
        token0,
        await signer,
        predictedSickle,
        parseFloat(1),
        parseInt(nftPosition.token0.decimals)
      );
      if (tx0Approve) {
        await tx0Approve.wait();
      }

      const tx1Approve = await approve(
        token1,
        await signer,
        predictedSickle,
        parseFloat(1),
        parseInt(nftPosition.token1.decimals)
      );
      if (tx1Approve) {
        await tx1Approve.wait();
      }

      const nftFarmStrategy = new ethers.Contract(
        vfatContracts[Number(chainId)].NftFarmStrategy,
        farmStrategyAbi,
        await signer
      );

      const tx = await nftFarmStrategy.compound(
        position,
        params,
        inPlace,
        sweepTokens,
        { gasLimit: 5000000 }
      );

      await tx.wait();
      console.log("Compound Successful!");
      handleLoad("Compound", false)
    } catch (error) {
      console.log(error)
      handleLoad("Compound", false)
    }
  }


  const exit = async () => {
    if (!address) return;
    handleLoad("Exit", true)
    const uniswapContract = uniswapContracts[Number(chainId)];
    const token0 = nftPosition.token0.id;
    const token1 = nftPosition.token1.id;

    const params = {
      stakingContract: uniswapContract.nfpm,
      tokenId: nftPosition.nftId.toString(),
      liquidity: nftPosition.position.liquidity,
      rewardTokens: [token0, token1],
      outputTokens: [token0, token1],
      sweepTokens: [token0, token1],
    };

    const { position, harvestParams, withdrawParams, sweepTokens } =
      getWithdrawParams(params);

    try {
      const nftFarmStrategy = new ethers.Contract(
        vfatContracts[Number(chainId)].NftFarmStrategy,
        farmStrategyAbi,
        await signer
      );

      const tx = await nftFarmStrategy.exit(
        position,
        harvestParams,
        withdrawParams,
        sweepTokens,
        { gasLimit: 5000000 }
      );

      await tx.wait();
      handleLoad("Exit", false)
    } catch (error) {
      handleLoad("Exit", false)
      //@ts-expect-error warning
      console.error("Transaction Failed:", error?.message);
    }
  };

  console.log(nftPosition, "nftPosition", claimInfo, "priceRange", priceRange);

  return (
    <>
      <div
        className={` fixed z-[9999] inset-0 flex items-center justify-center cstmModal`}
      >
        <div className="absolute inset-0 bg-black z-[9] opacity-70"></div>
        <div
          className={`modalDialog relative p-4 px-lg-5 mx-auto rounded-lg z-[9999] bg-[#272625] w-full max-w-[500px] overflow-scroll `}
        >
          <button
            onClick={() => setPosition(!position)}
            className="border-0 p-0 absolute top-1 right-1 "
          >
            {cross}
          </button>
          <div className="top">
            <div className="flex items-center justify-between gap-2">
              <div className="left">
                <h4 className="font-bold text-white text-base">
                  {nftPosition.token0?.symbol}/{nftPosition.token1?.symbol} on Base
                </h4>
                <ul className="list-none pl-0 mb-0 flex items-center gap-1">
                  <li className="">
                    <button className="text-xs bg-[#4f4b4a] px-2 py-1 rounded font-semibold text-white flex items-center justify-center hover:bg-secondary/80">
                      Aerodrome
                    </button>
                  </li>
                  <li className="">
                    <button className="text-xs bg-[#4f4b4a] px-2 py-1 rounded font-semibold text-white flex items-center justify-center hover:bg-secondary/80">
                      0.04%
                    </button>
                  </li>
                </ul>
              </div>
              <div className="right">
                <button className="btn flex items-center justify-center font-semibold text-white bg-[#4f4b4a] rounded shadow h-[40px] hover:bg-secondary/80">
                  View Farm
                </button>
              </div>
            </div>
            <div className="mt-2">
              <div className="p-1 inline-flex items-center rounded bg-[#353231]">
                <button
                  onClick={() => handleFormStatus("Increase")}
                  className={`${formStatus.Increase && "bg-[#000]"} flex items-center rounded  justify-center px-3 py-1 text-xs font-medium `}
                >
                  Increase
                </button>
                <button
                  onClick={() => handleFormStatus("Rebalance")}
                  className={`${formStatus.Rebalance && "bg-[#000]"} flex items-center rounded  justify-center px-3 py-1 text-xs font-medium `}
                >
                  Rebalance
                </button>
                {/* formStatus */}
                <button
                  onClick={() => handleFormStatus("Exit")}
                  className={`${formStatus.Exit && "bg-[#000]"} flex items-center rounded  justify-center px-3 py-1 text-xs font-medium `}
                >
                  Exit
                </button>
                <button
                  onClick={() => handleFormStatus("Compound")}
                  className={`${formStatus.Compound && "bg-[#000]"} flex items-center rounded  justify-center px-3 py-1 text-xs font-medium `}
                >
                  Compound
                </button>
                <button
                  onClick={() => handleFormStatus("Harvest")}
                  className={`${formStatus.Harvest && "bg-[#000]"} flex items-center rounded  justify-center px-3 py-1 text-xs font-medium `}
                >
                  Harvest
                </button>
              </div>
            </div>
            {/* <div className="mt-2">
              <div className="p-1 inline-flex items-center rounded bg-[#353231]">
                <button className="flex items-center rounded bg-[#000] justify-center px-3 py-1 text-xs font-medium ">
                  Price in USD
                </button>
                <button className="flex items-center justify-center px-3 py-1 font-medium text-xs">
                  Price in ETH
                </button>
              </div>
            </div> */}
          </div>
          <div className="cstmBody">
            {/* <div className="py-2">
              <span className="text-xs font-medium">Token to send</span>
              <div className="relative iconWithText">
                <span className="icn absolute">{exhangeIcn}</span>
                <Select
                  components={{
                    DropdownIndicator: CustomDropdownIndicator,
                    IndicatorSeparator: () => null, 
                    Option: CustomOption,
                    SingleValue,
                  }}
                  styles={customStyles}
                  classNamePrefix={"goblin"}
                  options={options}
                />
              </div>
            </div> */}

            <PriceRangeGraph
              lowerPrice={priceRange?.priceLowerNum}
              upperPrice={priceRange?.priceUpperNum}
              currentPrice={priceRange?.currentPriceNum}
              widthPercentage={priceRange?.widthPercentage}
              apr={apr?.apr}
            />


            {formStatus.Increase && <>
              <div className="py-2">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-xs font-medium">
                    {nftPosition?.token0?.symbol} Amount
                  </span>
                  <span className="text-xs text-gray-400">Balance: 0</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <input
                    name="amount0Desired"
                    onChange={handleChange}
                    type="text"
                    className="form-control bg-[#1a1919] text-xs h-[40px] w-full px-2 text-white font-medium"
                  />
                  <input
                    type="text"
                    className="form-control bg-[#1a1919] text-xs h-[40px] px-2 text-white font-medium"
                    style={{ maxWidth: 60 }}
                  />
                </div>
              </div>

              <div className="py-2">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-xs font-medium">
                    {nftPosition?.token1?.symbol} Amount
                  </span>
                  <span className="text-xs text-gray-400">Balance: 0</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <input
                    name="amount1Desired"
                    onChange={handleChange}
                    type="text"
                    className="form-control bg-[#1a1919] text-xs h-[40px] w-full px-2 text-white font-medium"
                  />
                  <input
                    type="text"
                    className="form-control bg-[#1a1919] text-xs h-[40px] px-2 text-white font-medium"
                    style={{ maxWidth: 60 }}
                  />
                </div>
              </div>
            </>}


            {formStatus.Rebalance && <div className="py-2">
              <div className="grid gap-3 grid-cols-12">
                <div className="col-span-6">
                  <label htmlFor="" className="form-label m-0 text-xs">
                    Min price {priceRange?.priceLowerNum} ({priceRange?.minPriceChange}%)
                  </label>
                  <div className="relative iconWithText">
                    <button className="border-0 px-0 absolute left-2 absolute icn text-base font-bold">
                      -
                    </button>
                    <input
                      type="text"
                      name="minPriceChange"
                      value={priceRange?.minPriceChange}
                      onChange={handlePriceChange}
                      className="form-control rounded bg-[#1a1919] h-[45px] w-full px-14 text-center"
                    />
                    <button className="border-0 px-2 absolute right-2 absolute icn text-base font-bold">
                      +
                    </button>
                  </div>
                </div>
                <div className="col-span-6">
                  <label htmlFor="" className="form-label m-0 text-xs">
                    Max price {priceRange?.priceUpperNum} ({priceRange?.maxPriceChange}%)
                  </label>
                  <div className="relative iconWithText">
                    <button className="border-0 px-0 absolute left-2 absolute icn text-base font-bold">
                      -
                    </button>
                    <input
                      type="text"
                      name="maxPriceChange"
                      onChange={handlePriceChange}
                      value={priceRange?.maxPriceChange}
                      className="form-control rounded bg-[#1a1919] h-[45px] w-full px-14 text-center"
                    />
                    <button className="border-0 px-2 absolute right-2 absolute icn text-base font-bold">
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>}

            <div className="py-2">
              <div className="py-2">
                <div className="my-1 flex items-center justify-between gap-10 rounded p-2 bg-[#1a1919]">
                  <div className="left flex items-center gap-2">
                    <span className="icn">{icn1}</span>
                    <span className="">Automate Rebalancing</span>
                  </div>
                  <ToggleSwitch />
                </div>
                <div className="my-1 flex items-center justify-between gap-10 rounded p-2 bg-[#1a1919]">
                  <div className="left flex items-center gap-2">
                    <span className="icn">{icn1}</span>
                    <span className="">Automate Rebalancing</span>
                  </div>
                  <ToggleSwitch />
                </div>
              </div>
              {formStatus.Increase && <ActButton label="Increase" onClick={() => increase()} load={load["Increase"]} />}
              {formStatus.Rebalance && <ActButton label="Rebalance" onClick={() => rebalance()} load={load["Rebalance"]} />}
              {formStatus.Harvest && <ActButton label="Harvest" onClick={() => harvest()} load={load["Harvest"]} />}
              {formStatus.Exit && <ActButton label="Exit" onClick={() => exit()} load={load["Exit"]} />}
              {formStatus.Compound && <ActButton label="Compound" onClick={() => compound()} load={load["Compound"]} />}
            </div>
          </div>

          {
            !formStatus.Increase && <div className="py-2">
              <div className="lg:p-4 p-3 bg-[#1a1919] rounded">
                <h4 className="m-0 text-base font-semibold border-b border-[#353231] pb-1">
                  {formStatus.Rebalance && "Rebalance"} {formStatus.Harvest && "Harvest"} {formStatus.Exit && "Exit"} {formStatus.Compound && "Compound"}
                </h4>
                <ul className="list-none pl-0 mb-0">
                  <li className="flex items-center justify-between gap-2 flex-wrap py-2 ">
                    <div className="flex flex-wrap items-center gap-1 min-h-[24px]">
                      Claim{" "}
                      <div className="flex items-center justify-end gap-2">
                        <div className="flex items-center justify-end gap-1 text-foreground">
                          {" "}
                          <button
                            aria-describedby="b8HlRM1m5D"
                            id="PuHO6WGvWP"
                            data-state="closed"
                            data-melt-tooltip-trigger=""
                            data-tooltip-trigger=""
                            type="button"
                            className=""
                          >
                            <span slot="trigger">{claimInfo?.amount0}</span>
                          </button>{" "}
                        </div>{" "}
                        <div className="flex items-center gap-2">
                          <Logo chainId={chainId} token={nftPosition?.position?.token0} margin={0} height={20} /> {" "}{" "}
                        </div>
                      </div>
                      for
                      <div className="flex items-center justify-end gap-2">
                        <div className="flex items-center justify-end gap-1 text-foreground">
                          {" "}
                          <button
                            aria-describedby="BUPumbPTOV"
                            id="Rcr8xfnLI2"
                            data-state="closed"
                            data-melt-tooltip-trigger=""
                            data-tooltip-trigger=""
                            type="button"
                            className=""
                          >
                            <span slot="trigger">{claimInfo?.amount1}</span>
                          </button>{" "}
                        </div>{" "}
                        <div className="flex items-center gap-2">
                          <Logo chainId={chainId} token={nftPosition?.position?.token1} margin={0} height={20} /> {" "}{" "}{" "}
                        </div>
                      </div>
                    </div>
                  </li>

                  {(formStatus.Rebalance || formStatus.Exit) && <li className="flex items-center justify-between gap-2 flex-wrap py-2">
                    <div className="flex flex-wrap items-center gap-1 min-h-[24px]">
                      Unstake{" "}
                      <button
                        aria-describedby="US-axoI8KX"
                        id="Bgk_P07Eev"
                        data-state="closed"
                        data-melt-tooltip-trigger=""
                        data-tooltip-trigger=""
                        type="button"
                      >
                        <span className="focus:ring-ring inline-flex select-none items-center rounded-md border py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 text-primary-foreground hover:bg-primary/80 border-transparent shadow bg-green-500 gap-1 px-1">
                          NFT{" "}
                          #{nftPosition?.nftId}
                        </span>
                      </button>
                    </div>
                  </li>}

                  {(formStatus.Rebalance || formStatus.Exit) && <li className="flex items-center justify-between gap-2 flex-wrap py-2">
                    <div className="flex flex-wrap items-center gap-1 min-h-[24px]">
                      Remove Liquidity{" "}
                      <div className="flex items-center justify-end gap-2">
                        <div className="flex items-center justify-end gap-1 text-foreground">
                          {" "}
                          <button
                            aria-describedby="b8HlRM1m5D"
                            id="PuHO6WGvWP"
                            data-state="closed"
                            data-melt-tooltip-trigger=""
                            data-tooltip-trigger=""
                            type="button"
                            className=""
                          >
                            <span slot="trigger">{claimInfo?.removeLp?.amount0 || 0}</span>
                          </button>{" "}
                        </div>{" "}
                        <div className="flex items-center gap-2">
                          <Logo chainId={chainId} token={nftPosition?.position?.token0} margin={0} height={20} /> {" "}{" "}
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <div className="flex items-center justify-end gap-1 text-foreground">
                          {" "}
                          <button
                            aria-describedby="BUPumbPTOV"
                            id="Rcr8xfnLI2"
                            data-state="closed"
                            data-melt-tooltip-trigger=""
                            data-tooltip-trigger=""
                            type="button"
                            className=""
                          >
                            <span slot="trigger">{claimInfo?.removeLp?.amount1 || 0}</span>
                          </button>{" "}
                        </div>{" "}
                        <div className="flex items-center gap-2">
                          <Logo chainId={chainId} token={nftPosition?.position?.token1} margin={0} height={20} /> {" "}{" "}{" "}
                        </div>
                      </div>
                    </div>
                  </li>}

                  {(formStatus.Rebalance) && <li className="border-b flex items-center justify-between gap-2 flex-wrap py-2 border-[#353231]">
                    <div className="flex flex-wrap items-center gap-1 min-h-[24px]">
                      Swap{" "}
                      <div className="flex items-center justify-end gap-2">
                        <div className="flex items-center justify-end gap-1 text-foreground">
                          {" "}
                          <button
                            aria-describedby="BUPumbPTOV"
                            id="Rcr8xfnLI2"
                            data-state="closed"
                            data-melt-tooltip-trigger=""
                            data-tooltip-trigger=""
                            type="button"
                            className=""
                          >
                            <span slot="trigger">{claimInfo?.removeLp?.swapAmount}</span>
                          </button>{" "}
                        </div>{" "}
                        <div className="flex items-center gap-2">
                          <Logo chainId={chainId} token={nftPosition?.position?.token0} margin={0} height={20} /> {" "}{" "}{" "}
                        </div>
                      </div>
                      for
                      <div className="flex items-center justify-end gap-2">
                        <div className="flex items-center justify-end gap-1 text-foreground">
                          {" "}
                          <button
                            aria-describedby="BUPumbPTOV"
                            id="Rcr8xfnLI2"
                            data-state="closed"
                            data-melt-tooltip-trigger=""
                            data-tooltip-trigger=""
                            type="button"
                            className=""
                          >
                            <span slot="trigger">{claimInfo?.removeLp?.receivedAmount}</span>
                          </button>{" "}
                        </div>{" "}
                        <div className="flex items-center gap-2">
                          <Logo chainId={chainId} token={nftPosition?.position?.token1} margin={0} height={20} /> {" "}{" "}{" "}
                        </div>
                      </div>
                      via
                      <img
                        src="https://imagedelivery.net/tLQGX6fO2lhA7EXY2jvPQQ/project-openocean/public"
                        className="border bg-muted logo square h-[20px] rounded-full"
                        alt="openocean logo"
                        title="openocean"
                      />{" "}
                      <button
                        aria-describedby="US-axoI8KX"
                        id="Bgk_P07Eev"
                        data-state="closed"
                        data-melt-tooltip-trigger=""
                        data-tooltip-trigger=""
                        type="button"
                      >
                        <span className="focus:ring-ring inline-flex select-none items-center rounded-md border py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 text-primary-foreground hover:bg-primary/80 border-transparent shadow bg-green-500 gap-1 px-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width={16}
                            height={16}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide-icon lucide lucide-activity"
                          >
                            <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
                          </svg>{" "}
                          0.11%
                        </span>
                      </button>
                    </div>

                  </li>}

                  {(formStatus.Rebalance || formStatus.compound) && <li className="flex items-center justify-between gap-2 flex-wrap py-2">
                    <div className="flex flex-wrap items-center gap-1 min-h-[24px]">
                      Add Liquidity{" "}
                      <div className="flex items-center justify-end gap-2">
                        <div className="flex items-center justify-end gap-1 text-foreground">
                          {" "}
                          <button
                            aria-describedby="b8HlRM1m5D"
                            id="PuHO6WGvWP"
                            data-state="closed"
                            data-melt-tooltip-trigger=""
                            data-tooltip-trigger=""
                            type="button"
                            className=""
                          >
                            <span slot="trigger">{claimInfo?.removeLp?.finalAmount0 || 0}</span>
                          </button>{" "}
                        </div>{" "}
                        <div className="flex items-center gap-2">
                          <Logo chainId={chainId} token={nftPosition?.position?.token0} margin={0} height={20} /> {" "}{" "}
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <div className="flex items-center justify-end gap-1 text-foreground">
                          {" "}
                          <button
                            aria-describedby="BUPumbPTOV"
                            id="Rcr8xfnLI2"
                            data-state="closed"
                            data-melt-tooltip-trigger=""
                            data-tooltip-trigger=""
                            type="button"
                            className=""
                          >
                            <span slot="trigger">{claimInfo?.removeLp?.finalAmount1 || 0}</span>
                          </button>{" "}
                        </div>{" "}
                        <div className="flex items-center gap-2">
                          <Logo chainId={chainId} token={nftPosition?.position?.token1} margin={0} height={20} /> {" "}{" "}{" "}
                        </div>
                      </div>
                    </div>
                  </li>}

                  {(formStatus.Rebalance) && <li className="flex items-center justify-between gap-2 flex-wrap py-2 ">
                    <div className="flex flex-wrap items-center gap-1 min-h-[24px]">
                      Withdraw{" "}
                      <div className="flex items-center justify-end gap-2">
                        <div className="flex items-center justify-end gap-1 text-foreground">
                          {" "}
                          <button
                            aria-describedby="b8HlRM1m5D"
                            id="PuHO6WGvWP"
                            data-state="closed"
                            data-melt-tooltip-trigger=""
                            data-tooltip-trigger=""
                            type="button"
                            className=""
                          >
                            <span slot="trigger">{claimInfo?.amount0}</span>
                          </button>{" "}
                        </div>{" "}
                        <div className="flex items-center gap-2">
                          <Logo chainId={chainId} token={nftPosition?.position?.token0} margin={0} height={20} /> {" "}{" "}
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <div className="flex items-center justify-end gap-1 text-foreground">
                          {" "}
                          <button
                            aria-describedby="BUPumbPTOV"
                            id="Rcr8xfnLI2"
                            data-state="closed"
                            data-melt-tooltip-trigger=""
                            data-tooltip-trigger=""
                            type="button"
                            className=""
                          >
                            <span slot="trigger">{claimInfo?.amount1}</span>
                          </button>{" "}
                        </div>{" "}
                        <div className="flex items-center gap-2">
                          <Logo chainId={chainId} token={nftPosition?.position?.token1} margin={0} height={20} /> {" "}{" "}{" "}
                        </div>
                      </div>
                    </div>
                  </li>}



                </ul>
              </div>
            </div>
          }



          <div className="py-2">
            <div className="lg:p-4 p-3 bg-[#1a1919] rounded">
              <h4 className="m-0 text-base font-semibold border-b border-[#353231] pb-1">
                Your Position
              </h4>
              <ul className="list-none pl-0 mb-0">
                <li className="border-b flex items-center justify-between gap-2 flex-wrap py-2 border-[#353231]">
                  <span className="text-white">Swap Fees</span>
                  <div className="flex items-center">
                    <Logo chainId={chainId} token={nftPosition?.position?.token0} /> {" "}
                    <Logo chainId={chainId} token={nftPosition?.position?.token1} /> {" "}
                    <div className="hidden items-center whitespace-nowrap text-sm text-foreground sm:flex">
                      {nftPosition?.token0?.symbol}/{nftPosition?.token1?.symbol}
                    </div>{" "}
                    <div className="tags svelte-1n2akg9 flex items-center">
                      <button className="hidden sm:flex">
                        <img
                          src="https://imagedelivery.net/tLQGX6fO2lhA7EXY2jvPQQ/project-uniswap/public"
                          alt="Uniswap logo"
                          title="Uniswap"
                          style={{ height: 30 }}
                        />
                      </button>{" "}
                      <button className="hidden sm:flex">
                        <span className="focus:ring-ring inline-flex select-none items-center rounded-md border py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 border-transparent px-1.5">
                          {nftPosition?.position?.fee.toString() / 10000}%
                        </span>
                      </button>{" "}
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div >
    </>
  );
};

export default PositionManagementPopup;


