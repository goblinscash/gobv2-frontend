"use client";
import React from "react";

const PriceRangeGraph = ({ lowerPrice, upperPrice, currentPrice, widthPercentage, apr }) => {
  // Store values and sort them in ascending order
  const prices = [
    { value: lowerPrice, color: "bg-green-500", labelBg: "bg-[#15803dbf]" },
    { value: currentPrice, color: "bg-blue-500", labelBg: "bg-[#1d4ed8b3]" },
    { value: upperPrice, color: "bg-green-500", labelBg: "bg-[#15803dbf]" }
  ].sort((a, b) => a.value - b.value);

  // Get relative positions
  const minPrice = prices[0].value;
  const maxPrice = prices[2].value;
  const range = maxPrice - minPrice;

  return (
    <div className="w-full pt-4 bg-black text-white rounded-lg shadow-md">
      <div className="flex px-4 justify-between text-sm mb-2">
        <span>Current position</span>
        <span>Width: {widthPercentage}%</span>
        <span>APR: {apr}%</span>
      </div>
      
      <div className="relative w-full h-14 bg-green-900 rounded-md">
        {prices.map(({ value, color, labelBg }, index) => {
          // Compute position relative to min/max
          const position = range === 0 ? 50 : ((value - minPrice) / range) * 100;

          return (
            <React.Fragment key={index}>
              {/* Vertical Line */}
              <div
                className={`absolute w-0.5 h-full ${color}`}
                style={{ left: `${position}%`, transform: "translateX(-50%)" }}
              ></div>
              {/* Label */}
              <div
                className={`absolute text-xs ${labelBg} px-1 py-0.5 rounded`}
                style={{ left: `${position}%`, transform: "translateX(-50%)" }}
              >
                {value}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default PriceRangeGraph;
