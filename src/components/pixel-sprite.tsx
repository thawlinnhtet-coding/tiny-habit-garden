import Image from "next/image";

export function PixelSprite({
  name,
  size = 96,
  className = "",
  alt = "",
}: {
  name: string;
  size?: number;
  className?: string;
  alt?: string;
}) {
  return (
    <Image
      src={`/sprites/${name}.png`}
      alt={alt}
      width={144}
      height={144}
      unoptimized
      draggable={false}
      className={`pixel-sprite ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
