import { useRef } from "react";
import type { GalleryPlacement } from "../types";
import { pixelsToGallery } from "../utils/visualLayoutUtils";
import ImageCarousel from "./ImageCarousel";

type CanvasDraggableGalleryProps = {
  gallery: GalleryPlacement;
  containerWidth: number;
  pixels: { left: number; top: number; width: number; height: number };
  imageUrls: string[];
  isSelected: boolean;
  onSelect: () => void;
  onChange: (gallery: GalleryPlacement) => void;
  onDelete?: () => void;
};

type DragState = {
  kind: "drag" | "resize";
  pointerId: number;
  startX: number;
  startY: number;
  origLeft: number;
  origTop: number;
  origWidth: number;
};

function CanvasDraggableGallery({
  gallery,
  containerWidth,
  pixels,
  imageUrls,
  isSelected,
  onSelect,
  onChange,
  onDelete,
}: CanvasDraggableGalleryProps) {
  const dragStateRef = useRef<DragState | null>(null);

  function beginInteraction(
    event: React.PointerEvent,
    kind: "drag" | "resize"
  ) {
    event.preventDefault();
    event.stopPropagation();
    onSelect();

    dragStateRef.current = {
      kind,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      origLeft: pixels.left,
      origTop: pixels.top,
      origWidth: pixels.width,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent) {
    const state = dragStateRef.current;
    if (!state || state.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - state.startX;
    const deltaY = event.clientY - state.startY;

    if (state.kind === "drag") {
      onChange(
        pixelsToGallery(
          gallery,
          containerWidth,
          state.origLeft + deltaX,
          state.origTop + deltaY,
          state.origWidth
        )
      );
      return;
    }

    onChange(
      pixelsToGallery(
        gallery,
        containerWidth,
        state.origLeft,
        state.origTop,
        state.origWidth + deltaX
      )
    );
  }

  function handlePointerUp(event: React.PointerEvent) {
    const state = dragStateRef.current;
    if (!state || state.pointerId !== event.pointerId) {
      return;
    }

    dragStateRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  return (
    <div
      className={`absolute touch-none ${isSelected ? "ring-2 ring-purple-500 rounded-xl" : ""}`}
      style={{
        left: pixels.left,
        top: pixels.top,
        width: pixels.width,
        zIndex: gallery.zIndex,
      }}
      onPointerDown={(event) => beginInteraction(event, "drag")}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div className="flex flex-col items-center w-full">
        <ImageCarousel
          imageUrls={imageUrls}
          aspectRatio={gallery.aspectRatio}
          interactive={false}
          className="w-full"
          alt={
            gallery.captionEnabled && gallery.caption ? gallery.caption : ""
          }
        />
        {gallery.captionEnabled && gallery.caption && (
          <p className="text-sm text-center mt-2 px-1 break-words w-full opacity-90 pointer-events-none">
            {gallery.caption}
          </p>
        )}
      </div>

      {isSelected && onDelete && (
        <button
          type="button"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
          className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white font-medium w-7 h-7 rounded-lg flex items-center justify-center z-10"
          aria-label="Usuń galerię"
        >
          ×
        </button>
      )}

      {isSelected && (
        <div
          role="presentation"
          onPointerDown={(event) => beginInteraction(event, "resize")}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="absolute bottom-0 right-0 w-4 h-4 bg-purple-600 border-2 border-white rounded-sm cursor-se-resize z-10"
        />
      )}
    </div>
  );
}

export default CanvasDraggableGallery;
