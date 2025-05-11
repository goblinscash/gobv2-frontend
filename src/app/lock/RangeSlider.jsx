import React from "react";
import styled from "styled-components";

const RangeSlider = ({ value, onChange, title }) => {
  const labels = [
    "1 Day", "7 Days", "14 Days", "21 Days", "30 Days",
    "1 Month", "2 Months", "3 Months", "4 Months", "5 Months", "6 Months", "7 Months", "8 Months", "9 Months", "10 Months", "11 Months", "12 Months",
    "1 Year", "2 Years", "3 Years", "4 Years"
  ];

  const values = [
    1, 7, 14, 21, 30,
    30 * 1, 30 * 2, 30 * 3, 30 * 4, 30 * 5, 30 * 6, 30 * 7, 30 * 8, 30 * 9, 30 * 10, 30 * 11, 30 * 12,
    365 * 1, 365 * 2, 365 * 3, 365 * 4
  ];

  const displayLabels = ["7 Days", "1 Year", "2 Years", "3 Years", "4 Years"];
  const displayValues = [7, 365 * 1, 365 * 2, 365 * 3, 365 * 4];

  const handleChange = (event) => {
    const sliderValue = Number(event.target.value);
    onChange(values[sliderValue]);
  };

  return (
    <div className="flex flex-col items-center p-4 w-full rounded-xl px-4 pb-4 bg-[#0b120d] border-[#2a2a2a] pt-6 border">
      <div className="mt-3 pb-8 text-xs text-start">
        {title} <span className="themeClr">{labels[values.indexOf(value)]}</span> for 0.0 veAERO voting power
      </div>
      <Slider
        type="range"
        min="0"
        max={values.length - 1}
        step="1"
        value={values.indexOf(value)}
        onChange={handleChange}
        className="w-full appearance-none bg-gray-300 h-2 rounded-lg"
      />
      <div className="flex justify-between w-full text-gray-400 mt-1">
        {displayLabels.map((item, index) => (
          <span
            key={index}
            className="text-[10px] "

          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};

const Slider = styled.input`
  -webkit-appearance: none;
  background: linear-gradient(90deg, #ffffff, #26d962);
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 20px;
    height: 20px;
    background: #00ff4e;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.3);
  }

  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    background: #00ff4e;
    border-radius: 50%;
    cursor: pointer;
  }
`;

export default RangeSlider;
