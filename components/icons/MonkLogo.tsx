import Image from "next/image";

interface MonkLogoProps {
  size?: number;
  className?: string;
}

export function MonkLogo({ size =48, className }: MonkLogoProps) {
  return (
    <Image
      src="/icon.png"
      alt="ToolMonk"
      width={size}
      height={size}
      className={`object-contain ${className ?? ""}`}
      style={{ display: "block" }}
      priority
    />
  );
}
