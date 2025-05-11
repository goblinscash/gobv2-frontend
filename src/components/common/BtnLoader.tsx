import Image from "next/image";
import React from "react";
import img from "../../assets/Images/loader.gif";

const BtnLoader = () => {
    return (
        <Image
          src={img}
          alt=""
          className="max-w-full object-contain w-auto"
          height={10000}
          width={10000}
          style={{ height: 20 }}
        />
      )
}

export default BtnLoader





