import Image from "next/image";
import { ICON_PATH, BRAND_NAME } from "@/lib/brand";

interface MonkLogoProps {
  size?: number;
  className?: string;
}

export function MonkLogo({ size =48, className }: MonkLogoProps) {
  return (
    <Image
      src={ICON_PATH}
      alt={BRAND_NAME}
      width={size}
      height={size}
      className={`object-contain ${className ?? ""}`}
      style={{ display: "block" }}
      priority
    />
  );
}
