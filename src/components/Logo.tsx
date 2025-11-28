import React from "react";
import Image from "next/image";
// Assuming logo is imported correctly, e.g., import logo from "../assets/ecogo-logo.png";
import logo from "../../src/assets/ecogo-logo.png";

const Logo = () => {
  return (
    <div className="flex justify-center">
      <Image
        src={logo}
        alt="EcoGo Logo"
        width={80}
        height={80}
        // Rounded corners for a modern badge look
        className="rounded-2xl shadow-md"
      />
    </div>
  );
};

export default Logo;
