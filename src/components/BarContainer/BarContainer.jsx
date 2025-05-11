import React, { useState } from "react";
import styled from "styled-components";

const BarContainer = ({ bar }) => {
  const calculatePercentage = (bar) => {
    if (bar <= 5) return 25;
    return 25 + ((bar - 5) / 12.5) * 100;
  };

  const percentage = calculatePercentage(bar.length);

  return (
    <>
      <BarContainerWrp>
        <div className="price-range-indicator-container text-sm svelte-9c1qwz">
          <div className="flex justify-between text-muted-foreground">
            <div className="font-medium text-primary">New position</div>{" "}
            <div>Width: 0.01%</div> <div>APR: 0.01%</div>
          </div>{" "}
          <div className="flex justify-between text-[11px]">
            <div className="bar-container rounded-t-lg bg-muted dark:bg-background svelte-9c1qwz">
              <div className="ticks border-b !border-muted-foreground svelte-9c1qwz">
                <div className="ticks-wrapper svelte-9c1qwz">
                  {bar.map((element) => (
                    <>
                      <div className="!bg-muted-foreground svelte-9c1qwz" />
                    </>
                  ))}
                </div>
              </div>{" "}
              <div
                className="min-percentage rounded svelte-9c1qwz"
                style={{
                  right: "calc(50% - 1px)",
                  transform: "translateX(+50%)",
                }}
              >
                <button
                  aria-describedby="-36--6mXXZ"
                  id="clx6fb0oqJ"
                  data-state="closed"
                  data-melt-tooltip-trigger=""
                  data-tooltip-trigger=""
                  type="button"
                >
                  0.9999000 (0.00%)
                </button>{" "}
              </div>{" "}
              <div
                className="max-percentage rounded svelte-9c1qwz"
                style={{
                  right: "calc(25%)",
                  transform: "translateX(0%)",
                }}
              >
                <button
                  aria-describedby="RYuJtKEz_M"
                  id="VMfQio0ugu"
                  data-state="closed"
                  data-melt-tooltip-trigger=""
                  data-tooltip-trigger=""
                  type="button"
                >
                  1.0000000 (0.01%)
                </button>{" "}
              </div>{" "}
              <div
                className="current-price-tick svelte-9c1qwz"
                style={{ left: "74.74779580030018%" }}
              >
                <div
                  className="current-price rounded svelte-9c1qwz"
                  style={{ transform: "translateX(-74.74779580030018%)" }}
                >
                  <div>
                    <button
                      aria-describedby="S8teYz4skZ"
                      id="rr58QeyUP9"
                      data-state="closed"
                      data-melt-tooltip-trigger=""
                      data-tooltip-trigger=""
                      type="button"
                    >
                      0.9999990
                    </button>{" "}
                  </div>
                </div>
              </div>{" "}
              <div
                className="position-area svelte-9c1qwz"
                style={{ left: "50%", width: `${percentage}%` }}
              />{" "}
            </div>
          </div>
        </div>
      </BarContainerWrp>
    </>
  );
};

const BarContainerWrp = styled.div`
  .bar-container.svelte-9c1qwz.svelte-9c1qwz {
    margin-top: 1rem;
    width: 100%;
    height: 4rem;
    position: relative;
    display: flex;
    background: #1a1919;
    justify-content: space-between;
    align-items: center;
  }
  .ticks.svelte-9c1qwz.svelte-9c1qwz {
    position: absolute;
    width: 100%;
    height: 0.5rem;
    bottom: 0px;
    z-index: 1;
  }
  .ticks-wrapper.svelte-9c1qwz.svelte-9c1qwz {
    display: flex;
    justify-content: space-between;
    height: 100%;
    right: 0px;
  }
  .ticks-wrapper.svelte-9c1qwz div.svelte-9c1qwz {
    height: 100%;
    width: 1px;
    background-color: rgb(82, 82, 82);
    text-align: center;
  }
  .min-percentage.svelte-9c1qwz.svelte-9c1qwz {
    bottom: 0px;
  }
  .max-percentage.svelte-9c1qwz.svelte-9c1qwz {
    top: 0px;
  }
  .min-percentage.svelte-9c1qwz.svelte-9c1qwz,
  .max-percentage.svelte-9c1qwz.svelte-9c1qwz {
    position: absolute;
    z-index: 2;
    background-color: rgba(65, 190, 100, 0.25);
    padding-inline: 0.25rem;
  }
  .current-price-tick.svelte-9c1qwz.svelte-9c1qwz {
    position: absolute;
    height: 100%;
    width: 1px;
    background-color: rgb(102, 153, 255);
    transform: translateX(-50%);
    z-index: 1;
  }
  .current-price.svelte-9c1qwz.svelte-9c1qwz {
    z-index: 1;
    position: absolute;
    text-align: center;
    top: calc(50% - 0.6rem);
    height: 1.15rem;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(102, 153, 255, 0.25);
    padding-inline: 0.25rem;
  }
  .position-area.svelte-9c1qwz.svelte-9c1qwz {
    height: 100%;
    z-index: 0;
    position: relative;
    border-left: 1px solid rgb(66, 190, 101);
    border-right: 1px solid rgb(66, 190, 101);
  }
  .position-area.svelte-9c1qwz.svelte-9c1qwz::before {
    content: "";
    position: absolute;
    opacity: 0.25;
    background-color: rgb(66, 190, 101);
    inset: 0px;
  }
`;

export default BarContainer;
