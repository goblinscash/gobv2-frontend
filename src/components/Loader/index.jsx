import Image from "next/image";
import React from "react";
import img from "../../assets/Images/loader.gif";

const Loader = () => {
  return (
    <>
      <div
        className="flex items-center justify-center fixed top-0 left-0 z-[99999] p-3 bg-black/50 w-full"
        style={{ minHeight: "100vh" }}
      >
        <Image
          src={img}
          alt=""
          className="max-w-full object-contain w-auto"
          height={10000}
          width={10000}
          style={{ height: 30 }}
        />
      </div>
    </>
  );
};

export default Loader;