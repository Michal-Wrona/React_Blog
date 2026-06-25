export interface User {
  id: string;
  email: string;
  roles: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export type PostType = "simple" | "visual";

export type FontSizeOption = "small" | "medium" | "large";

export interface VisualStyle {
  backgroundColor: string;
  backgroundImageUrl: string | null;
  fontFamily: string;
  fontSize: FontSizeOption;
  textColor: string;
}

export type ImageDisplayMode = "grid" | "carousel";

export interface GalleryPlacement {
  galleryId: string;
  imageIds: number[];
  left: number;
  top: number;
  width: number;
  aspectRatio: number;
  zIndex: number;
  captionEnabled: boolean;
  caption: string | null;
}

export interface ImagePlacement {
  imageId: number;
  left: number;
  top: number;
  width: number;
  aspectRatio: number;
  zIndex: number;
  captionEnabled: boolean;
  caption: string | null;
}

export interface VisualLayout {
  placements: ImagePlacement[];
  galleries: GalleryPlacement[];
}

export interface Image {
  id: number;
  url: string;
  postId: number;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  postType: PostType;
  visualStyle: VisualStyle | null;
  visualLayout: VisualLayout | null;
  images: Image[];
  imageDisplayMode: ImageDisplayMode;
}

export interface CreatePostRequest {
  title: string;
  content: string;
  postType?: PostType;
  visualStyle?: VisualStyle | null;
  visualLayout?: VisualLayout | null;
}

export interface UpdatePostRequest {
  id: number;
  title: string;
  content: string;
  imageDisplayMode?: ImageDisplayMode;
  visualStyle?: VisualStyle | null;
  visualLayout?: VisualLayout | null;
}
