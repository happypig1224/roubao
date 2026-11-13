import React from "react";
import Image from "next/image";

interface BaoCoreLogoProps {
  className?: string;
  alt?: string;
  priority?: boolean;
}

export function BaoCoreLogo({
  className = "w-6 h-6",
  alt = "肉包 (Roubao) 标志",
  priority = false,
}: BaoCoreLogoProps) {
  return (
    <Image
      src="/logo.svg"
      alt={alt}
      width={100}
      height={100}
      unoptimized
      priority={priority}
      className={`object-contain select-none pointer-events-none ${className}`}
    />
  );
}
