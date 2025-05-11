import { useState, useEffect, useRef } from "react";
// css
import { CstmDropdown, YellowBtn } from "./commonStyled";
import { useRouter } from "next/router";

// accordion item
export const AccordionItem = ({
  title,
  children,
  btnClass,
  svg,
  btnIcnClass,
  isOpen,
  onClick,
  wrpperClass,
}) => {
  return (
    <div className={`${styles.AccordionItem} ${wrpperClass} AccordionItem`}>
      <button
        className={`${btnClass} ${isOpen && styles.active} ${
          isOpen && "active"
        } ${styles.accordionBtn} accordionBtn w-full `}
        onClick={onClick}
      >
        <span className={`${btnIcnClass}`}>{svg}</span>
        <span>{title}</span>
        <span
          className={`${styles.accordionIcn} arrow inline-flex items-center justify-center absolute right-2`}
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 67 67"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g filter="url(#filter0_d_0_3064)">
              <circle
                cx="33.5"
                cy="29.5"
                r="25.5"
                fill="#545454"
                fillOpacity="0.1"
                shape-rendering="crispEdges"
              />
              <circle
                cx="33.5"
                cy="29.5"
                r="25"
                stroke="#404040"
                shape-rendering="crispEdges"
              />
            </g>
            <path
              d="M24.2729 29.5454H42.8184"
              stroke="#F1F1F1"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M33.5454 38.8181V20.2726"
              stroke="#F1F1F1"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <defs>
              <filter
                id="filter0_d_0_3064"
                x="0"
                y="0"
                width="67"
                height="67"
                filterUnits="userSpaceOnUse"
                color-interpolation-filters="sRGB"
              >
                <feFlood flood-opacity="0" result="BackgroundImageFix" />
                <feColorMatrix
                  in="SourceAlpha"
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                  result="hardAlpha"
                />
                <feOffset dy="4" />
                <feGaussianBlur stdDeviation="4" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"
                />
                <feBlend
                  mode="normal"
                  in2="BackgroundImageFix"
                  result="effect1_dropShadow_0_3064"
                />
                <feBlend
                  mode="normal"
                  in="SourceGraphic"
                  in2="effect1_dropShadow_0_3064"
                  result="shape"
                />
              </filter>
            </defs>
          </svg>
        </span>
      </button>
      {isOpen && <div className="relative accordionBody  py-2">{children}</div>}
    </div>
  );
};

// dropdown
export const Dropdown = ({
  drpButtonContent,
  isOpen,
  onClick,
  btnClass,
  dropdownMenuClass,
  children,
  width,
}) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClick(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClick]);

  return (
    <CstmDropdown className={` relative flex-shrink-0`} ref={dropdownRef}>
      <button onClick={() => onClick(!isOpen)} className={`${btnClass}`}>
        {drpButtonContent}
      </button>
      {isOpen && (
        <div
          style={{ minWidth: width || "200px" }}
          className={`${dropdownMenuClass} dropdownMenu absolute mt-2 `}
        >
          {children}
        </div>
      )}
    </CstmDropdown>
  );
};

export const CstmPagination = () => {
  return (
    <>
      <div className="flex items-center justify-between gap-1">
        <p className="m-0 text-gray-400 font-normal text-xs">
          Showing 1 to 8 of 32
        </p>
        <ul
          className={`${styles.paginationWrp} list-none pl-0 mb-0 flex items-center gap-2`}
        >
          <li className="px-1">
            <button className="border-0 p-0 transparent flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="36"
                height="36"
                viewBox="0 0 36 36"
                fill="none"
              >
                <g filter="url(#filter0_d_46_1503)">
                  <rect
                    x="2"
                    y="2"
                    width="32"
                    height="32"
                    rx="8"
                    fill="white"
                  />
                  <rect
                    x="2.5"
                    y="2.5"
                    width="31"
                    height="31"
                    rx="7.5"
                    stroke="#C8C8D0"
                  />
                </g>
                <path
                  d="M20.3337 22.6668L15.667 18.0002L20.3337 13.3335"
                  stroke="#131316"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <defs>
                  <filter
                    id="filter0_d_46_1503"
                    x="0"
                    y="0"
                    width="36"
                    height="36"
                    filterUnits="userSpaceOnUse"
                    color-interpolation-filters="sRGB"
                  >
                    <feFlood flood-opacity="0" result="BackgroundImageFix" />
                    <feColorMatrix
                      in="SourceAlpha"
                      type="matrix"
                      values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                      result="hardAlpha"
                    />
                    <feOffset />
                    <feGaussianBlur stdDeviation="1" />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix
                      type="matrix"
                      values="0 0 0 0 0.898039 0 0 0 0 0.905882 0 0 0 0 0.921569 0 0 0 1 0"
                    />
                    <feBlend
                      mode="normal"
                      in2="BackgroundImageFix"
                      result="effect1_dropShadow_46_1503"
                    />
                    <feBlend
                      mode="normal"
                      in="SourceGraphic"
                      in2="effect1_dropShadow_46_1503"
                      result="shape"
                    />
                  </filter>
                </defs>
              </svg>
            </button>
          </li>
          <li className="px-1">
            <button
              className={`${styles.paginationBtn} ${styles.active}  flex items-center justify-center rounded`}
            >
              1
            </button>
          </li>
          <li className="px-1">
            <button
              className={`${styles.paginationBtn}  flex items-center justify-center rounded`}
            >
              ...
            </button>
          </li>
          <li className="px-1">
            <button
              className={`${styles.paginationBtn}  flex items-center justify-center rounded`}
            >
              10
            </button>
          </li>
          <li className="px-1">
            <button className="border-0 p-0 transparent flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="36"
                height="36"
                viewBox="0 0 36 36"
                fill="none"
              >
                <g filter="url(#filter0_d_46_1504)">
                  <rect
                    x="2"
                    y="2"
                    width="32"
                    height="32"
                    rx="8"
                    fill="white"
                  />
                  <rect
                    x="2.5"
                    y="2.5"
                    width="31"
                    height="31"
                    rx="7.5"
                    stroke="#C8C8D0"
                  />
                </g>
                <path
                  d="M15.667 22.6668L20.3337 18.0002L15.667 13.3335"
                  stroke="#131316"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <defs>
                  <filter
                    id="filter0_d_46_1504"
                    x="0"
                    y="0"
                    width="36"
                    height="36"
                    filterUnits="userSpaceOnUse"
                    color-interpolation-filters="sRGB"
                  >
                    <feFlood flood-opacity="0" result="BackgroundImageFix" />
                    <feColorMatrix
                      in="SourceAlpha"
                      type="matrix"
                      values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                      result="hardAlpha"
                    />
                    <feOffset />
                    <feGaussianBlur stdDeviation="1" />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix
                      type="matrix"
                      values="0 0 0 0 0.898039 0 0 0 0 0.905882 0 0 0 0 0.921569 0 0 0 1 0"
                    />
                    <feBlend
                      mode="normal"
                      in2="BackgroundImageFix"
                      result="effect1_dropShadow_46_1504"
                    />
                    <feBlend
                      mode="normal"
                      in="SourceGraphic"
                      in2="effect1_dropShadow_46_1504"
                      result="shape"
                    />
                  </filter>
                </defs>
              </svg>
            </button>
          </li>
        </ul>
        <div className="flex items-center gap-1">
          <p className="m-0 text-gray-400 font-normal text-xs">Show</p>
          <select className="block w-full pr-4 font-semibold ps-2 text-xs  py-2 mt-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-indigo-500 focus:ring focus:ring-indigo-200">
            <option value="">10 rows</option>
            <option value="option1">Option 1</option>
            <option value="option2">Option 2</option>
            <option value="option3">Option 3</option>
          </select>
        </div>
      </div>
    </>
  );
};

export const AutoCounter = ({
  targetNumber,
  classStyle,
  postFix,
  interval = 1000,
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const counterInterval = setInterval(() => {
      setCount((prevCount) => {
        if (prevCount >= targetNumber) {
          clearInterval(counterInterval);
          return prevCount;
        }
        return prevCount + 1;
      });
    }, interval);

    // Clean up the interval when the component unmounts
    return () => clearInterval(counterInterval);
  }, [targetNumber, interval]);

  return (
    <h2 className={`${classStyle} `}>
      {count} {postFix}
    </h2>
  );
};

export const SocialLogin = () => {
  return (
    <>
      <div
        className={`${styles.socialLogin} flex items-center justify-between gap-3`}
      >
        <button className="border rounded btn bg-white flex items-center justify-center font-medium w-50">
          <span className="icn">{googleIcn}</span>
          <p className="m-0 sm:block hidden">Sign in with Google</p>
        </button>
        <button className="border rounded btn bg-white flex items-center justify-center font-medium w-50">
          <span className="icn">{fb}</span>
          <p className="m-0 sm:block hidden">Sign in with Facebook</p>
        </button>
      </div>
    </>
  );
};

export const ToggleSwitch = () => {
  const [isOn, setIsOn] = useState(false);
  return (
    <>
      <label className="relative inline-block w-12 h-6">
        <input
          type="checkbox"
          checked={isOn}
          onChange={() => setIsOn(!isOn)}
          className="opacity-0 w-0 h-0 absolute"
          style={{ height: 0, width: 0 }}
        />
        <span
          className={`slider block w-full h-full rounded-full cursor-pointer transition-all duration-300 ease-in-out ${
            isOn ? "bg-blue-500" : "bg-gray-500"
          }`}
        ></span>
        <span
          className={`dot absolute left-1 top-1 w-4 h-4 rounded-full transition-all duration-300 ease-in-out ${
            isOn ? "translate-x-6 bg-white" : "bg-white"
          }`}
        ></span>
      </label>
    </>
  );
};

const googleIcn = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
  >
    <path
      d="M14.537 6.69431H14V6.66665H7.99998V9.33331H11.7676C11.218 10.8856 9.74098 12 7.99998 12C5.79098 12 3.99998 10.209 3.99998 7.99998C3.99998 5.79098 5.79098 3.99998 7.99998 3.99998C9.01965 3.99998 9.94731 4.38465 10.6536 5.01298L12.5393 3.12731C11.3486 2.01765 9.75598 1.33331 7.99998 1.33331C4.31831 1.33331 1.33331 4.31831 1.33331 7.99998C1.33331 11.6816 4.31831 14.6666 7.99998 14.6666C11.6816 14.6666 14.6666 11.6816 14.6666 7.99998C14.6666 7.55298 14.6206 7.11665 14.537 6.69431Z"
      fill="#FFC107"
    />
    <path
      d="M2.10199 4.89698L4.29232 6.50331C4.88499 5.03598 6.32032 3.99998 7.99999 3.99998C9.01966 3.99998 9.94732 4.38465 10.6537 5.01298L12.5393 3.12731C11.3487 2.01765 9.75599 1.33331 7.99999 1.33331C5.43932 1.33331 3.21866 2.77898 2.10199 4.89698Z"
      fill="#FF3D00"
    />
    <path
      d="M8 14.6667C9.722 14.6667 11.2867 14.0077 12.4697 12.936L10.4063 11.19C9.737 11.697 8.905 12 8 12C6.266 12 4.79367 10.8943 4.239 9.35132L2.065 11.0263C3.16834 13.1853 5.409 14.6667 8 14.6667Z"
      fill="#4CAF50"
    />
    <path
      d="M14.537 6.69435H14V6.66669H8V9.33335H11.7677C11.5037 10.079 11.024 10.722 10.4053 11.1904L10.4063 11.1897L12.4697 12.9357C12.3237 13.0684 14.6667 11.3334 14.6667 8.00002C14.6667 7.55302 14.6207 7.11669 14.537 6.69435Z"
      fill="#1976D2"
    />
  </svg>
);

const fb = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
  >
    <path
      d="M20 10.0613C20 4.50378 15.5225 -0.0012207 10 -0.0012207C4.475 2.9297e-05 -0.00250244 4.50378 -0.00250244 10.0625C-0.00250244 15.0838 3.655 19.2463 8.435 20.0013V12.97H5.8975V10.0625H8.4375V7.84378C8.4375 5.32253 9.93125 3.93003 12.215 3.93003C13.31 3.93003 14.4537 4.12628 14.4537 4.12628V6.60128H13.1925C11.9512 6.60128 11.5637 7.37753 11.5637 8.17378V10.0613H14.3362L13.8937 12.9688H11.5625V20C16.3425 19.245 20 15.0825 20 10.0613Z"
      fill="#484848"
    />
  </svg>
);
