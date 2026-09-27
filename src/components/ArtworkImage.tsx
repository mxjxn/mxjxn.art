"use client";
import Image from "next/image";
import { useState } from "react";
export function ArtworkImage({
  src,
  title,
  sizes = "90vw",
  priority = false,
  animated = false,
  natural = false,
  width = 1600,
  height = 1200,
}: {
  src: string;
  title: string;
  sizes?: string;
  priority?: boolean;
  animated?: boolean;
  natural?: boolean;
  width?: number;
  height?: number;
}) {
  const [failed, setFailed] = useState(false),
    [loaded, setLoaded] = useState(false);
  return (
    <div
      className={`art-image ${natural ? "natural-image" : ""} ${loaded ? "is-loaded" : ""}`}
    >
      {failed ? (
        <p className="media-error">This image is temporarily unavailable.</p>
      ) : (
        <Image
          src={src}
          alt={title}
          {...(natural ? { width, height } : { fill: true })}
          sizes={sizes}
          priority={priority}
          unoptimized={animated}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
