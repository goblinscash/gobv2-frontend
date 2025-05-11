import styled, { keyframes } from "styled-components";

export const YellowBtn = styled.button`
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.08) 0%,
    rgba(255, 255, 255, 0) 100%
  );
  transition: 0.4s;
  color: #fa9c0f;
  height: 45px;
  .icn {
    top: 50%;
    transform: translateY(-50%);
    left: 6px;
  }
  &:hover {
    background: #fa9c0f;
    color: #fff;
  }
`;

export const CstmDropdown = styled.div`
  .dropdownMenu {
    min-width: ${({ width }) => (width ? width : "200px")};
    z-index: 9;
    background: #211f1f;
    border: 1px solid #27282e;
    box-shadow: 3px 4px 3px rgba(0, 0, 0, 0.25);
    border-radius: 18px;
    * {
      border-color: #27282e;
    }
  }
`;
