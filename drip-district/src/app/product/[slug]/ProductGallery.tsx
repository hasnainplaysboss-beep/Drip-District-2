
"use client";

import { useRef, useState } from "react";

export default function ProductGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [current, setCurrent] = useState(0);
  const touchStart = useRef<number | null>(null);

  function handleTouchStart(e: React.TouchEvent) {
    touchStart.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStart.current === null) return;

    const difference = touchStart.current - e.changedTouches[0].clientX;

    if (difference > 50) {
      setCurrent((prev) => Math.min(prev + 1, images.length - 1));
    }

    if (difference < -50) {
      setCurrent((prev) => Math.max(prev - 1, 0));
    }

    touchStart.current = null;
  }

  if (!images.length) {
    return (
      <div className="product-gallery-empty">
        NO IMAGE AVAILABLE
      </div>
    );
  }

  return (
    <div className="product-gallery">
      <div
        className="product-gallery-main"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img
          key={current}
          src={images[current]}
          alt={`${title} - image ${current + 1}`}
          className="product-gallery-image"
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              className="gallery-arrow gallery-arrow-left"
              onClick={() =>
                setCurrent((prev) =>
                  prev === 0 ? images.length - 1 : prev - 1
                )
              }
              aria-label="Previous image"
            >
              ‹
            </button>

            <button
              type="button"
              className="gallery-arrow gallery-arrow-right"
              onClick={() =>
                setCurrent((prev) =>
                  prev === images.length - 1 ? 0 : prev + 1
                )
              }
              aria-label="Next image"
            >
              ›
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="gallery-indicators">
          {images.map((_, index) => (
            <button
              key={index}
              type="button"
              className={`gallery-dot ${
                current === index ? "gallery-dot-active" : ""
              }`}
              onClick={() => setCurrent(index)}
              aria-label={`View image ${index + 1}`}
              aria-current={current === index}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
