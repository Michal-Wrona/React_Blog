export interface Image {
  id: number;
  url: string;
  postId: number;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  images: Image[];
}

export interface CreatePostRequest {
  title: string;
  content: string;
}

export interface UpdatePostRequest {
  id: number;
  title: string;
  content: string;
}
