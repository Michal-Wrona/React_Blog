import { useRef } from "react";
import type { ImagePlacement } from "../types";
import { pixelsToPlacement } from "../utils/visualLayoutUtils";

type CanvasDraggableImageProps = {
  placement: ImagePlacement;
  containerWidth: number;
  pixels: { left: number; top: number; width: number; height: number };
  imageUrl: string;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (placement: ImagePlacement) => void;
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

function CanvasDraggableImage({
  placement,
  containerWidth,
  pixels,
  imageUrl,
  isSelected,
  onSelect,
  onChange,
  onDelete,
}: CanvasDraggableImageProps) {
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
        pixelsToPlacement(
          placement,
          containerWidth,
          state.origLeft + deltaX,
          state.origTop + deltaY,
          state.origWidth
        )
      );
      return;
    }

    onChange(
      pixelsToPlacement(
        placement,
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
        zIndex: placement.zIndex,
      }}
      onPointerDown={(event) => beginInteraction(event, "drag")}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div className="flex flex-col items-center w-full">
        <img
          src={imageUrl}
          alt={
            placement.captionEnabled && placement.caption
              ? placement.caption
              : ""
          }
          className="w-full rounded-xl object-cover pointer-events-none"
          style={{ aspectRatio: placement.aspectRatio }}
          draggable={false}
        />
        {placement.captionEnabled && placement.caption && (
          <p className="text-sm text-center mt-2 px-1 break-words w-full opacity-90 pointer-events-none">
            {placement.caption}
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
          aria-label="Usuń zdjęcie"
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

export default CanvasDraggableImage;
