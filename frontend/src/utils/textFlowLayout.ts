import type { ImagePlacement } from "../types";
import { placementToPixels } from "./visualLayoutUtils";

export type ImageRect = {
  imageId: number;
  left: number;
  top: number;
  width: number;
  height: number;
};

export type FlowRowSegment = {
  kind: "text";
  text: string;
  x: number;
  width: number;
};

export type FlowRow = {
  y: number;
  segments: FlowRowSegment[];
  gapRects: Array<{ x: number; width: number }>;
};

export type TextFlowResult = {
  rows: FlowRow[];
  height: number;
};

const LINE_HEIGHT_RATIO = 1.625;
const CAPTION_HEIGHT = 36;
const TEXT_IMAGE_GAP = 12;

let measureCanvas: HTMLCanvasElement | null = null;
let measureContext: CanvasRenderingContext2D | null = null;

function getMeasureContext(): CanvasRenderingContext2D | null {
  if (typeof document === "undefined") {
    return null;
  }

  measureCanvas ??= document.createElement("canvas");
  measureContext ??= measureCanvas.getContext("2d");
  return measureContext;
}

export function buildFontString(fontSizePx: number, fontFamily: string): string {
  return `${fontSizePx}px ${fontFamily}`;
}

export function measureTextWidth(text: string, font: string): number {
  const context = getMeasureContext();
  if (!context || text.length === 0) {
    return 0;
  }

  context.font = font;
  return context.measureText(text).width;
}

export function fitTextToWidth(
  text: string,
  maxWidth: number,
  font: string
): { text: string; remaining: string } {
  if (!text || maxWidth <= 0) {
    return { text: "", remaining: text };
  }

  if (measureTextWidth(text, font) <= maxWidth) {
    return { text, remaining: "" };
  }

  let low = 0;
  let high = text.length;

  while (low < high) {
    const mid = Math.ceil((low + high) / 2);
    if (measureTextWidth(text.slice(0, mid), font) <= maxWidth) {
      low = mid;
    } else {
      high = mid - 1;
    }
  }

  if (low === 0) {
    return { text: "", remaining: text };
  }

  let breakAt = low;
  const slice = text.slice(0, breakAt);
  const lastSpace = slice.lastIndexOf(" ");

  if (lastSpace > 0 && lastSpace > breakAt * 0.6) {
    breakAt = lastSpace + 1;
  }

  return {
    text: text.slice(0, breakAt),
    remaining: text.slice(breakAt),
  };
}

export function buildImageRects(
  placements: ImagePlacement[],
  containerWidth: number
): ImageRect[] {
  return placements.map((placement) => {
    const { left, top, width, height } = placementToPixels(
      placement,
      containerWidth
    );
    const captionSpace = placement.captionEnabled ? CAPTION_HEIGHT : 0;

    return {
      imageId: placement.imageId,
      left,
      top,
      width,
      height: height + captionSpace,
    };
  });
}

type HorizontalInterval = { start: number; end: number };

function mergeIntervals(intervals: HorizontalInterval[]): HorizontalInterval[] {
  if (intervals.length === 0) {
    return [];
  }

  const sorted = [...intervals].sort((a, b) => a.start - b.start);
  const merged: HorizontalInterval[] = [sorted[0]];

  for (let index = 1; index < sorted.length; index += 1) {
    const current = sorted[index];
    const last = merged[merged.length - 1];

    if (current.start <= last.end) {
      last.end = Math.max(last.end, current.end);
    } else {
      merged.push({ ...current });
    }
  }

  return merged;
}

function getBlockedIntervalsAtY(
  y: number,
  lineHeight: number,
  containerWidth: number,
  rects: ImageRect[]
): HorizontalInterval[] {
  const lineTop = y;
  const lineBottom = y + lineHeight;

  const blocked = rects
    .filter((rect) => lineBottom > rect.top && lineTop < rect.top + rect.height)
    .map((rect) => ({
      start: Math.max(0, rect.left),
      end: Math.min(containerWidth, rect.left + rect.width),
    }));

  return mergeIntervals(blocked);
}

function buildTextSegmentsAtY(
  y: number,
  lineHeight: number,
  containerWidth: number,
  rects: ImageRect[]
): {
  segments: Array<{ x: number; width: number }>;
  gaps: Array<{ x: number; width: number }>;
} {
  const blocked = getBlockedIntervalsAtY(y, lineHeight, containerWidth, rects);

  if (blocked.length === 0) {
    return {
      segments: [{ x: 0, width: containerWidth }],
      gaps: [],
    };
  }

  const segments: Array<{ x: number; width: number }> = [];
  const gaps: Array<{ x: number; width: number }> = [];
  let cursor = 0;

  for (const interval of blocked) {
    const leftSegmentEnd = interval.start - TEXT_IMAGE_GAP;
    if (leftSegmentEnd > cursor) {
      segments.push({ x: cursor, width: leftSegmentEnd - cursor });
    }

    gaps.push({ x: interval.start, width: interval.end - interval.start });
    cursor = interval.end + TEXT_IMAGE_GAP;
  }

  if (cursor < containerWidth) {
    segments.push({ x: cursor, width: containerWidth - cursor });
  }

  return { segments, gaps };
}

function flowParagraph(
  paragraph: string,
  startY: number,
  containerWidth: number,
  lineHeight: number,
  font: string,
  rects: ImageRect[]
): { rows: FlowRow[]; endY: number } {
  const rows: FlowRow[] = [];
  let remaining = paragraph;
  let y = startY;

  while (remaining.length > 0) {
    const { segments, gaps } = buildTextSegmentsAtY(
      y,
      lineHeight,
      containerWidth,
      rects
    );

    const rowSegments: FlowRowSegment[] = [];
    let consumedAny = false;

    for (const segment of segments) {
      if (!remaining) {
        break;
      }

      const fitted = fitTextToWidth(remaining, segment.width, font);
      if (fitted.text.length > 0) {
        consumedAny = true;
        rowSegments.push({
          kind: "text",
          text: fitted.text,
          x: segment.x,
          width: segment.width,
        });
        remaining = fitted.remaining;
      } else if (segments.length === 1) {
        break;
      }
    }

    if (!consumedAny) {
      if (gaps.length > 0) {
        y += lineHeight;
        continue;
      }
      break;
    }

    rows.push({ y, segments: rowSegments, gapRects: gaps });
    y += lineHeight;
  }

  return { rows, endY: y };
}

export function layoutTextFlow(
  content: string,
  containerWidth: number,
  fontSizePx: number,
  fontFamily: string,
  rects: ImageRect[]
): TextFlowResult {
  if (containerWidth <= 0) {
    return { rows: [], height: 0 };
  }

  const font = buildFontString(fontSizePx, fontFamily);
  const lineHeight = fontSizePx * LINE_HEIGHT_RATIO;
  const paragraphs = content.split("\n");
  const rows: FlowRow[] = [];
  let y = 0;

  for (const paragraph of paragraphs) {
    if (paragraph.length === 0) {
      rows.push({ y, segments: [], gapRects: [] });
      y += lineHeight;
      continue;
    }

    const result = flowParagraph(
      paragraph,
      y,
      containerWidth,
      lineHeight,
      font,
      rects
    );
    rows.push(...result.rows);
    y = result.endY;
  }

  let height = y;

  for (const rect of rects) {
    height = Math.max(height, rect.top + rect.height + 16);
  }

  return { rows, height };
}

export function parseFontSizePx(fontSizeCss: string): number {
  const value = Number.parseFloat(fontSizeCss);
  if (Number.isNaN(value)) {
    return 18;
  }

  return fontSizeCss.includes("rem") ? value * 16 : value;
}
