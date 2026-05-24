"use client";

import Image from "next/image";

export default function OptimizedImage({ src, alt, className, sizes, priority = false }) {
  if (!src) return null;

  const isLocalImage = String(src).startsWith("/");

  if (!isLocalImage) {
    return <img src={src} alt={alt} className={className} loading="lazy" />;
  }

  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      fill
      sizes={sizes}
      priority={priority}
    />
  );
}
