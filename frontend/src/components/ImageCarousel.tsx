import { useCallback, useState } from "react";

type ImageCarouselProps = {
  imageUrls: string[];
  aspectRatio?: number;
  className?: string;
  alt?: string;
  /** W edytorze (przeciąganie) wyłącz nawigację kliknięciem. */
  interactive?: boolean;
  loop?: boolean;
  showCounter?: boolean;
};

function ImageCarousel({
  imageUrls,
  aspectRatio = 16 / 9,
  className = "",
  alt = "",
  interactive = true,
  loop = true,
  showCounter = true,
}: ImageCarouselProps) {
  const [index, setIndex] = useState(0);

  const total = imageUrls.length;
  const safeIndex = total > 0 ? Math.min(index, total - 1) : 0;
  const currentUrl = imageUrls[safeIndex];

  const goNext = useCallback(() => {
    if (total <= 1) {
      return;
    }

    setIndex((current) => {
      if (current < total - 1) {
        return current + 1;
      }
      return loop ? 0 : current;
    });
  }, [loop, total]);

  const goPrev = useCallback(() => {
    if (total <= 1) {
      return;
    }

    setIndex((current) => {
      if (current > 0) {
        return current - 1;
      }
      return loop ? total - 1 : current;
    });
  }, [loop, total]);

  if (total === 0 || !currentUrl) {
    return null;
  }

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-gray-100 ${className}`}
      style={{ aspectRatio }}
    >
      <img
        src={currentUrl}
        alt={alt}
        className="w-full h-full object-cover pointer-events-none select-none"
        draggable={false}
      />

      {interactive && total > 1 && (
        <>
          <button
            type="button"
            aria-label="Poprzednie zdjęcie"
            onClick={(event) => {
              event.stopPropagation();
              goPrev();
            }}
            className="absolute inset-y-0 left-0 w-1/2 cursor-w-resize bg-transparent border-0 p-0"
          />
          <button
            type="button"
            aria-label="Następne zdjęcie"
            onClick={(event) => {
              event.stopPropagation();
              goNext();
            }}
            className="absolute inset-y-0 right-0 w-1/2 cursor-e-resize bg-transparent border-0 p-0"
          />
        </>
      )}

      {showCounter && total > 1 && (
        <span className="absolute bottom-2 right-2 rounded-lg bg-black/45 text-white text-sm font-medium px-2.5 py-1 pointer-events-none select-none backdrop-blur-[2px]">
          {safeIndex + 1}/{total}
        </span>
      )}
    </div>
  );
}

export default ImageCarousel;
