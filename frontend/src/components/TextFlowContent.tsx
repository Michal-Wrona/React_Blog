import { useMemo } from "react";
import type { GalleryPlacement, ImagePlacement, VisualStyle } from "../types";
import { getFontSizeCss } from "../utils/postFormUtils";
import {
  buildImageRects,
  layoutTextFlow,
  parseFontSizePx,
} from "../utils/textFlowLayout";

type TextFlowContentProps = {
  content: string;
  containerWidth: number;
  style: VisualStyle;
  placements: ImagePlacement[];
  galleries?: GalleryPlacement[];
  placeholder?: boolean;
};

function TextFlowContent({
  content,
  containerWidth,
  style,
  placements,
  galleries = [],
  placeholder = false,
}: TextFlowContentProps) {
  const fontSizeCss = getFontSizeCss(style.fontSize);
  const fontSizePx = parseFontSizePx(fontSizeCss);
  const lineHeight = fontSizePx * 1.625;

  const flow = useMemo(() => {
    const rects = buildImageRects(placements, containerWidth, galleries);
    return layoutTextFlow(
      content,
      containerWidth,
      fontSizePx,
      style.fontFamily,
      rects
    );
  }, [content, containerWidth, fontSizePx, style.fontFamily, placements, galleries]);

  return (
    <div
      className={`relative leading-relaxed ${placeholder ? "opacity-50" : ""}`}
      style={{ minHeight: flow.height, fontSize: fontSizeCss }}
    >
      {flow.rows.map((row, index) => (
        <div
          key={`${row.y}-${index}`}
          className="absolute left-0 right-0 overflow-hidden"
          style={{ top: row.y, height: lineHeight }}
        >
          {row.segments.map((segment, segmentIndex) => (
            <span
              key={segmentIndex}
              className="absolute top-0 whitespace-pre overflow-hidden"
              style={{
                left: segment.x,
                width: segment.width,
                maxWidth: segment.width,
              }}
            >
              {segment.text}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

export default TextFlowContent;
