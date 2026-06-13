import { useEffect, useMemo, useRef, useState } from "react";
import type { Image, ImagePlacement, VisualLayout, VisualStyle } from "../types";
import {
  getImageUrl,
  normalizeVisualLayout,
  placementToPixels,
  sanitizeCaption,
} from "../utils/visualLayoutUtils";
import { getFontSizeCss, getVisualPostStyles } from "../utils/postFormUtils";
import {
  buildImageRects,
  layoutTextFlow,
  parseFontSizePx,
} from "../utils/textFlowLayout";
import CanvasDraggableImage from "./CanvasDraggableImage";
import TextFlowContent from "./TextFlowContent";

type VisualPostCanvasProps = {
  title: string;
  content: string;
  style: VisualStyle;
  images: Image[];
  layout: VisualLayout;
  editable?: boolean;
  placeholder?: boolean;
  selectedImageId?: number | null;
  onSelectImage?: (imageId: number | null) => void;
  onLayoutChange?: (layout: VisualLayout) => void;
  onDeleteImage?: (imageId: number) => void;
};

function VisualPostCanvas({
  title,
  content,
  style,
  images,
  layout,
  editable = false,
  placeholder = false,
  selectedImageId = null,
  onSelectImage,
  onLayoutChange,
  onDeleteImage,
}: VisualPostCanvasProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const placements = normalizeVisualLayout(layout).placements;
  const hasImages = placements.length > 0;

  useEffect(() => {
    const element = contentRef.current;
    if (!element) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    observer.observe(element);
    setContainerWidth(element.getBoundingClientRect().width);

    return () => observer.disconnect();
  }, []);

  const displayTitle = title || (placeholder ? "Tytuł posta" : "");
  const displayContent =
    content || (placeholder ? "Treść posta pojawi się tutaj..." : "");

  const fontSizePx = parseFontSizePx(getFontSizeCss(style.fontSize));

  const contentHeight = useMemo(() => {
    if (containerWidth <= 0) {
      return 0;
    }

    const rects = buildImageRects(placements, containerWidth);
    return layoutTextFlow(
      displayContent,
      containerWidth,
      fontSizePx,
      style.fontFamily,
      rects
    ).height;
  }, [containerWidth, displayContent, fontSizePx, style.fontFamily, placements]);

  function updatePlacement(updated: ImagePlacement) {
    if (!onLayoutChange) {
      return;
    }

    onLayoutChange({
      placements: placements.map((placement) =>
        placement.imageId === updated.imageId ? updated : placement
      ),
    });
  }

  const selectedPlacement = placements.find(
    (placement) => placement.imageId === selectedImageId
  );

  function renderImage(placement: ImagePlacement, isEditable: boolean) {
    const imageUrl = getImageUrl(images, placement.imageId);
    if (!imageUrl || containerWidth <= 0) {
      return null;
    }

    const aspectRatio =
      placement.aspectRatio > 0 ? placement.aspectRatio : 16 / 9;
    const safePlacement = { ...placement, aspectRatio };
    const pixels = placementToPixels(safePlacement, containerWidth);
    const isSelected = selectedImageId === placement.imageId;

    if (isEditable) {
      return (
        <CanvasDraggableImage
          key={placement.imageId}
          placement={safePlacement}
          containerWidth={containerWidth}
          pixels={pixels}
          imageUrl={imageUrl}
          isSelected={isSelected}
          onSelect={() => onSelectImage?.(placement.imageId)}
          onChange={updatePlacement}
          onDelete={
            onDeleteImage ? () => onDeleteImage(placement.imageId) : undefined
          }
        />
      );
    }

    return (
      <div
        key={placement.imageId}
        className="absolute pointer-events-none"
        style={{
          left: pixels.left,
          top: pixels.top,
          width: pixels.width,
          zIndex: placement.zIndex,
        }}
      >
        <img
          src={imageUrl}
          alt={
            placement.captionEnabled && placement.caption
              ? placement.caption
              : ""
          }
          className="w-full rounded-xl object-cover"
          style={{ aspectRatio }}
          draggable={false}
        />
        {placement.captionEnabled && placement.caption && (
          <p className="text-sm text-center mt-2 px-1 break-words w-full opacity-90">
            {placement.caption}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="w-full rounded-2xl overflow-hidden shadow-sm border border-gray-200">
        <div
          className={`px-6 sm:px-10 py-8 sm:py-10 ${
            editable ? "select-none" : ""
          }`}
          style={getVisualPostStyles(style)}
        >
          {displayTitle && (
            <h2
              className={`text-2xl sm:text-3xl font-bold mb-6 break-words ${
                placeholder && !title ? "opacity-50" : ""
              }`}
            >
              {displayTitle}
            </h2>
          )}

          <div
            ref={contentRef}
            className={`relative w-full ${
              editable && hasImages
                ? "rounded-xl border border-dashed border-purple-200/80"
                : ""
            }`}
            style={{ minHeight: contentHeight > 0 ? contentHeight : undefined }}
            onPointerDown={() => onSelectImage?.(null)}
          >
            {containerWidth > 0 && (
              <TextFlowContent
                content={displayContent}
                containerWidth={containerWidth}
                style={style}
                placements={placements}
                placeholder={placeholder && !content}
              />
            )}

            {hasImages &&
              containerWidth > 0 &&
              placements
                .slice()
                .sort((a, b) => a.zIndex - b.zIndex)
                .map((placement) => renderImage(placement, editable))}
          </div>
        </div>
      </div>

      {editable && selectedPlacement && onLayoutChange && (
        <div className="max-w-5xl mx-auto bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          <p className="text-sm font-medium text-gray-700">
            Ustawienia wybranego zdjęcia
          </p>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={selectedPlacement.captionEnabled}
              onChange={(event) =>
                updatePlacement({
                  ...selectedPlacement,
                  captionEnabled: event.target.checked,
                  caption: event.target.checked
                    ? selectedPlacement.caption ?? ""
                    : null,
                })
              }
            />
            Pokaż podpis pod zdjęciem
          </label>

          {selectedPlacement.captionEnabled && (
            <input
              type="text"
              value={selectedPlacement.caption ?? ""}
              maxLength={200}
              placeholder="Tekst podpisu"
              onChange={(event) =>
                updatePlacement({
                  ...selectedPlacement,
                  caption: sanitizeCaption(event.target.value),
                })
              }
              className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          )}

          <p className="text-gray-400 text-xs">
            Tekst automatycznie omija zdjęcie — linie przechodzące przez zdjęcie
            dzielą się na lewą i prawą stronę. Przeciągnij zdjęcie, aby zmienić
            układ.
          </p>
        </div>
      )}
    </div>
  );
}

export default VisualPostCanvas;
