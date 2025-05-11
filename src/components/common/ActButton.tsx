import React from "react";
import BtnLoader from "./BtnLoader";

interface ActButtonProps {
  label: string;
  onClick: () => void;
  load?: boolean;
}

const ActButton: React.FC<ActButtonProps> = ({ label, onClick, load = false }) => {
  return (
    <div className="pt-2">
      <button
        onClick={onClick}
        disabled={load}
        className="btn flex items-center font-medium justify-center w-full rounded btn commonBtn"
      >
        {load ? <BtnLoader /> : label}
      </button>
    </div>
  );
};

export default ActButton;
