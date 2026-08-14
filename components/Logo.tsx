import Image from "next/image";
import React from "react";

interface LogoProps {
  width?: number;
  height?: number;
  priority?: boolean; // Optional: for above-the-fold logos
}

const Logo = ({ width = 90, height = 80, priority = false }: LogoProps) => {
  return (
    <div>
      <Image
        src="/icons/logo.svg"
        alt="TrackPay Logo"
        width={width}
        height={height}
        priority={priority}
        sizes={`(max-width: 768px) ${width / 2}px, ${width}px`} // Adjust as needed
        className="h-auto"
      />
    </div>
  );
};

export default Logo;
