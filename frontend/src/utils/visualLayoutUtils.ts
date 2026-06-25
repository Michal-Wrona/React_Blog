import type { GalleryPlacement, Image, ImagePlacement, VisualLayout } from "../types";

export const MAX_CAPTION_LENGTH = 200;
export const MIN_IMAGE_WIDTH = 10;
export const MAX_IMAGE_WIDTH = 100;
export const DEFAULT_IMAGE_WIDTH = 40;
export const DEFAULT_GALLERY_WIDTH = 55;

export const EMPTY_VISUAL_LAYOUT: VisualLayout = { placements: [], galleries: [] };

export function normalizeVisualLayout(
  layout: VisualLayout | null | undefined
): VisualLayout {
  if (!layout) {
    return EMPTY_VISUAL_LAYOUT;
  }

  const raw = layout as VisualLayout & {
    Placements?: Array<Record<string, unknown>>;
    placements?: Array<Record<string, unknown>>;
    Galleries?: Array<Record<string, unknown>>;
    galleries?: Array<Record<string, unknown>>;
  };

  const placementSource = (raw.placements ?? raw.Placements ?? []) as unknown[];
  const gallerySource = (raw.galleries ?? raw.Galleries ?? []) as unknown[];

  return {
    placements: placementSource.map((item) =>
      normalizePlacement(item as Record<string, unknown>)
    ),
    galleries: gallerySource.map((item) =>
      normalizeGallery(item as Record<string, unknown>)
    ),
  };
}

function normalizePlacement(raw: Record<string, unknown>): ImagePlacement {
  return {
    imageId: Number(raw.imageId ?? raw.ImageId ?? 0),
    left: Number(raw.left ?? raw.Left ?? 10),
    top: Number(raw.top ?? raw.Top ?? 10),
    width: Number(raw.width ?? raw.Width ?? DEFAULT_IMAGE_WIDTH),
    aspectRatio: Number(raw.aspectRatio ?? raw.AspectRatio ?? 16 / 9),
    zIndex: Number(raw.zIndex ?? raw.ZIndex ?? 1),
    captionEnabled: Boolean(raw.captionEnabled ?? raw.CaptionEnabled ?? false),
    caption:
      (raw.caption as string | null | undefined) ??
      (raw.Caption as string | null | undefined) ??
      null,
  };
}

function normalizeGallery(raw: Record<string, unknown>): GalleryPlacement {
  const imageIdsRaw =
    (raw.imageIds as unknown) ??
    (raw.ImageIds as unknown) ??
    [];

  const imageIds = Array.isArray(imageIdsRaw)
    ? imageIdsRaw.map((id) => Number(id)).filter((id) => id > 0)
    : [];

  return {
    galleryId: String(raw.galleryId ?? raw.GalleryId ?? raw.id ?? raw.Id ?? ""),
    imageIds,
    left: Number(raw.left ?? raw.Left ?? 10),
    top: Number(raw.top ?? raw.Top ?? 10),
    width: Number(raw.width ?? raw.Width ?? DEFAULT_GALLERY_WIDTH),
    aspectRatio: Number(raw.aspectRatio ?? raw.AspectRatio ?? 16 / 9),
    zIndex: Number(raw.zIndex ?? raw.ZIndex ?? 1),
    captionEnabled: Boolean(raw.captionEnabled ?? raw.CaptionEnabled ?? false),
    caption:
      (raw.caption as string | null | undefined) ??
      (raw.Caption as string | null | undefined) ??
      null,
  };
}

export function createGalleryId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `gallery-${Date.now()}`;
}

export function loadImageAspectRatio(url: string): Promise<number> {
  return new Promise((resolve) => {
    const image = new window.Image();
    image.onload = () => {
      if (image.naturalHeight === 0) {
        resolve(16 / 9);
        return;
      }
      resolve(image.naturalWidth / image.naturalHeight);
    };
    image.onerror = () => resolve(16 / 9);
    image.src = url;
  });
}

export function createDefaultPlacement(
  image: Image,
  aspectRatio: number,
  index: number
): ImagePlacement {
  const width = DEFAULT_IMAGE_WIDTH;
  const left = Math.max(0, 50 - width / 2);

  return {
    imageId: image.id,
    left,
    top: 10 + index * 12,
    width,
    aspectRatio,
    zIndex: index + 1,
    captionEnabled: false,
    caption: null,
  };
}

export function createDefaultGallery(
  imageIds: number[],
  aspectRatio: number,
  index: number
): GalleryPlacement {
  const width = DEFAULT_GALLERY_WIDTH;
  const left = Math.max(0, 50 - width / 2);

  return {
    galleryId: createGalleryId(),
    imageIds,
    left,
    top: 10 + index * 12,
    width,
    aspectRatio,
    zIndex: index + 1,
    captionEnabled: false,
    caption: null,
  };
}

export function placementToPixels(
  placement: Pick<ImagePlacement, "left" | "top" | "width" | "aspectRatio">,
  containerWidth: number
) {
  const width = (containerWidth * placement.width) / 100;
  const height = width / placement.aspectRatio;
  const left = (containerWidth * placement.left) / 100;
  const top = (containerWidth * placement.top) / 100;

  return { left, top, width, height };
}

export function pixelsToPlacement(
  placement: ImagePlacement,
  containerWidth: number,
  left: number,
  top: number,
  width: number
): ImagePlacement {
  if (containerWidth <= 0) {
    return placement;
  }

  const clampedWidth = Math.min(
    MAX_IMAGE_WIDTH,
    Math.max(MIN_IMAGE_WIDTH, (width / containerWidth) * 100)
  );

  return {
    ...placement,
    left: Math.min(95, Math.max(0, (left / containerWidth) * 100)),
    top: Math.max(0, (top / containerWidth) * 100),
    width: clampedWidth,
  };
}

export function pixelsToGallery(
  gallery: GalleryPlacement,
  containerWidth: number,
  left: number,
  top: number,
  width: number
): GalleryPlacement {
  if (containerWidth <= 0) {
    return gallery;
  }

  const clampedWidth = Math.min(
    MAX_IMAGE_WIDTH,
    Math.max(MIN_IMAGE_WIDTH, (width / containerWidth) * 100)
  );

  return {
    ...gallery,
    left: Math.min(95, Math.max(0, (left / containerWidth) * 100)),
    top: Math.max(0, (top / containerWidth) * 100),
    width: clampedWidth,
  };
}

export function computeCanvasMinHeight(
  containerWidth: number,
  placements: ImagePlacement[],
  galleries: GalleryPlacement[] = []
): number {
  const basePadding = 48;
  let maxBottom = basePadding;

  for (const placement of placements) {
    const { top, height } = placementToPixels(placement, containerWidth);
    const captionSpace = placement.captionEnabled ? 36 : 0;
    maxBottom = Math.max(maxBottom, top + height + captionSpace + 16);
  }

  for (const gallery of galleries) {
    const { top, height } = placementToPixels(gallery, containerWidth);
    const captionSpace = gallery.captionEnabled ? 36 : 0;
    maxBottom = Math.max(maxBottom, top + height + captionSpace + 16);
  }

  return maxBottom;
}

export function removePlacement(
  layout: VisualLayout,
  imageId: number
): VisualLayout {
  const normalized = normalizeVisualLayout(layout);
  return {
    placements: normalized.placements.filter(
      (placement) => placement.imageId !== imageId
    ),
    galleries: normalized.galleries
      .map((gallery) => ({
        ...gallery,
        imageIds: gallery.imageIds.filter((id) => id !== imageId),
      }))
      .filter((gallery) => gallery.imageIds.length >= 1),
  };
}

export function removeGallery(
  layout: VisualLayout,
  galleryId: string
): VisualLayout {
  const normalized = normalizeVisualLayout(layout);
  return {
    ...normalized,
    galleries: normalized.galleries.filter(
      (gallery) => gallery.galleryId !== galleryId
    ),
  };
}

export function upsertPlacement(
  layout: VisualLayout,
  placement: ImagePlacement
): VisualLayout {
  const normalized = normalizeVisualLayout(layout);
  const withoutCurrent = normalized.placements.filter(
    (item) => item.imageId !== placement.imageId
  );

  return {
    ...normalized,
    placements: [...withoutCurrent, placement],
  };
}

export function upsertGallery(
  layout: VisualLayout,
  gallery: GalleryPlacement
): VisualLayout {
  const normalized = normalizeVisualLayout(layout);
  const withoutCurrent = normalized.galleries.filter(
    (item) => item.galleryId !== gallery.galleryId
  );

  return {
    ...normalized,
    galleries: [...withoutCurrent, gallery],
  };
}

export function updatePlacement(
  layout: VisualLayout,
  imageId: number,
  changes: Partial<ImagePlacement>
): VisualLayout {
  const normalized = normalizeVisualLayout(layout);
  return {
    ...normalized,
    placements: normalized.placements.map((placement) =>
      placement.imageId === imageId ? { ...placement, ...changes } : placement
    ),
  };
}

export function updateGallery(
  layout: VisualLayout,
  galleryId: string,
  changes: Partial<GalleryPlacement>
): VisualLayout {
  const normalized = normalizeVisualLayout(layout);
  return {
    ...normalized,
    galleries: normalized.galleries.map((gallery) =>
      gallery.galleryId === galleryId ? { ...gallery, ...changes } : gallery
    ),
  };
}

export function sanitizeCaption(value: string): string {
  return value.replace(/[<>]/g, "").trim().slice(0, MAX_CAPTION_LENGTH);
}

export function syncLayoutWithImages(
  layout: VisualLayout,
  images: Image[]
): VisualLayout {
  const normalized = normalizeVisualLayout(layout);
  const imageIds = new Set(images.map((image) => image.id));

  return {
    placements: normalized.placements.filter((placement) =>
      imageIds.has(placement.imageId)
    ),
    galleries: normalized.galleries
      .map((gallery) => ({
        ...gallery,
        imageIds: gallery.imageIds.filter((id) => imageIds.has(id)),
      }))
      .filter((gallery) => gallery.imageIds.length >= 1),
  };
}

export function getImageUrl(
  images: Image[],
  imageId: number
): string | undefined {
  return images.find((image) => image.id === imageId)?.url;
}

export function getGalleryImageUrls(
  images: Image[],
  gallery: GalleryPlacement
): string[] {
  return gallery.imageIds
    .map((imageId) => getImageUrl(images, imageId))
    .filter((url): url is string => Boolean(url));
}

export function normalizeImageDisplayMode(
  value: unknown
): "grid" | "carousel" {
  if (value === "carousel" || value === 1 || value === "Carousel") {
    return "carousel";
  }
  return "grid";
}
