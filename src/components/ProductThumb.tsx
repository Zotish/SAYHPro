import React, { useState, useEffect } from "react";

interface ProductThumbProps {
  src?: string | null;
  alt?: string;
  className?: string;
  sizeClass?: string;
  fallbackEmoji?: string;
}

export default function ProductThumb({
  src,
  alt = "Product",
  className = "w-10 h-10 rounded-xl object-contain bg-nv-50 p-1 border border-nv-200/60 flex-shrink-0",
  sizeClass = "text-xl",
  fallbackEmoji = "📦",
}: ProductThumbProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (!src) {
    return (
      <div className={`flex items-center justify-center flex-shrink-0 select-none ${className}`}>
        <span className={sizeClass}>{fallbackEmoji}</span>
      </div>
    );
  }

  const isImgUrl =
    src.startsWith("/") ||
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("data:");

  if (isImgUrl && !hasError) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        loading="lazy"
        onError={() => setHasError(true)}
      />
    );
  }

  return (
    <div className={`flex items-center justify-center flex-shrink-0 select-none ${className}`}>
      <span className={sizeClass}>{hasError ? fallbackEmoji : src}</span>
    </div>
  );
}
