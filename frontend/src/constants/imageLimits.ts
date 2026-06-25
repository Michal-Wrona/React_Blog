export const MAX_IMAGES_SIMPLE = 5;
export const MAX_IMAGES_VISUAL = 12;
export const MIN_GALLERY_IMAGES = 1;
export const MAX_GALLERY_IMAGES = 5;

export function getMaxImagesForPostType(postType: "simple" | "visual"): number {
  return postType === "visual" ? MAX_IMAGES_VISUAL : MAX_IMAGES_SIMPLE;
}
