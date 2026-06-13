import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, DragEvent, FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { Image, Post, PostType, UpdatePostRequest, VisualLayout, VisualStyle } from "../types";
import AlertModal from "./AlertModal";
import PostStylePanel from "./PostStylePanel";
import VisualPostCanvas from "./VisualPostCanvas";
import VisualPostPreviewShell from "./VisualPostPreviewShell";
import { DEFAULT_VISUAL_STYLE } from "../utils/postFormUtils";
import {
  createDefaultPlacement,
  EMPTY_VISUAL_LAYOUT,
  loadImageAspectRatio,
  normalizeVisualLayout,
  removePlacement,
  upsertPlacement,
} from "../utils/visualLayoutUtils";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGES_PER_POST = 5;

function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState<PostType>("simple");
  const [visualStyle, setVisualStyle] = useState<VisualStyle>(DEFAULT_VISUAL_STYLE);
  const [visualLayout, setVisualLayout] = useState<VisualLayout>(EMPTY_VISUAL_LAYOUT);
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);
  const [images, setImages] = useState<Image[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingBackground, setIsUploadingBackground] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPost() {
      try {
        const response = await fetch(`/api/Post/${id}`);

        if (!response.ok) {
          throw new Error("Nie udało się pobrać posta.");
        }

        const data: Post = await response.json();
        setTitle(data.title);
        setContent(data.content);
        setPostType(data.postType ?? "simple");
        setVisualStyle(data.visualStyle ?? DEFAULT_VISUAL_STYLE);
        setVisualLayout(normalizeVisualLayout(data.visualLayout));
        setImages(data.images);
      } catch (error) {
        setError("Wystąpił błąd podczas pobierania posta.");
      } finally {
        setIsLoading(false);
      }
    }

    if (id) {
      fetchPost();
    }
  }, [id]);

  async function handleBackgroundUpload(file: File) {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setError("Niedozwolony format pliku. Dozwolone: jpg, png, webp.");
      return;
    }

    setError(null);
    setIsUploadingBackground(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`/api/Post/${id}/background-image`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Nie udało się dodać tła.");
      }

      const url: string = await response.json();
      setVisualStyle((previous) => ({ ...previous, backgroundImageUrl: url }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Wystąpił błąd podczas dodawania tła.";
      setError(message);
    } finally {
      setIsUploadingBackground(false);
    }
  }

  async function handleBackgroundRemove() {
    setError(null);

    try {
      const response = await fetch(`/api/Post/${id}/background-image`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Nie udało się usunąć tła.");
      }

      setVisualStyle((previous) => ({ ...previous, backgroundImageUrl: null }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Wystąpił błąd podczas usuwania tła.";
      setError(message);
    }
  }

  async function uploadFile(file: File) {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setError("Niedozwolony format pliku. Dozwolone: jpg, png, webp.");
      return;
    }

    if (images.length >= MAX_IMAGES_PER_POST) {
      setError(`Maksymalnie ${MAX_IMAGES_PER_POST} zdjęć na post.`);
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`/api/Post/${id}/add-photo`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Nie udało się dodać zdjęcia.");
      }

      const createdImage: Image = await response.json();
      const aspectRatio = await loadImageAspectRatio(createdImage.url);
      const currentLayout = normalizeVisualLayout(visualLayout);
      const placement = createDefaultPlacement(
        createdImage,
        aspectRatio,
        currentLayout.placements.length
      );
      const nextLayout = upsertPlacement(currentLayout, placement);

      setImages((previous) => [...previous, createdImage]);
      setVisualLayout(nextLayout);
      setSelectedImageId(createdImage.id);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Wystąpił błąd podczas dodawania zdjęcia.";
      setError(message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function handleFileInputChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    if (file) {
      uploadFile(file);
    }
  }

  async function handleDeleteImage(imageId: number) {
    setError(null);
    setDeletingImageId(imageId);

    try {
      const response = await fetch(`/api/Post/${id}/images/${imageId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Nie udało się usunąć zdjęcia.");
      }

      setImages((previous) => previous.filter((image) => image.id !== imageId));
      setVisualLayout((previous) => removePlacement(previous, imageId));
      setSelectedImageId(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Wystąpił błąd podczas usuwania zdjęcia.";
      setError(message);
    } finally {
      setDeletingImageId(null);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const updatedPost: UpdatePostRequest = {
        id: Number(id),
        title,
        content,
        ...(postType === "visual" ? { visualStyle, visualLayout } : {}),
      };

      const response = await fetch("/api/Post", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedPost),
      });

      if (!response.ok) {
        throw new Error("Nie udało się zapisać zmian.");
      }

      navigate(`/post/${id}`);
    } catch (error) {
      setError("Wystąpił błąd podczas zapisywania zmian.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <div className="p-8">Ładowanie posta...</div>;
  }

  const canAddMoreImages = images.length < MAX_IMAGES_PER_POST;
  const isVisualPost = postType === "visual";

  const titleContentFields = (
    <>
      <div>
        <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
          Tytuł
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
        />
      </div>

      <div>
        <label htmlFor="content" className="block text-gray-700 font-medium mb-2">
          Treść
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          className="min-h-48 w-full rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
        />
      </div>
    </>
  );

  const imagesSection = isVisualPost ? (
    <div>
      <span className="block text-gray-700 font-medium mb-2">
        Dodaj zdjęcie na kanwas
      </span>

      {canAddMoreImages ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
            isDragging
              ? "border-purple-500 bg-purple-100"
              : "border-gray-300 bg-white"
          }`}
        >
          <p className="text-gray-600 mb-4">
            {isUploading
              ? "Wysyłanie zdjęcia..."
              : "Przeciągnij i upuść zdjęcie tutaj"}
          </p>

          <input
            ref={fileInputRef}
            id="image-upload"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileInputChange}
            disabled={isUploading}
            className="sr-only"
          />

          <label
            htmlFor="image-upload"
            className={`inline-block bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-medium px-4 py-2 rounded-xl transition-colors ${
              isUploading ? "opacity-50 pointer-events-none" : "cursor-pointer"
            }`}
          >
            Wybierz plik
          </label>

          <p className="text-gray-400 text-sm mt-3">
            JPG, PNG lub WebP · maks. {MAX_IMAGES_PER_POST} zdjęć
          </p>
        </div>
      ) : (
        <p className="text-gray-500 text-sm">
          Osiągnięto limit {MAX_IMAGES_PER_POST} zdjęć na post.
        </p>
      )}
    </div>
  ) : (
    <div>
      <span className="block text-gray-700 font-medium mb-2">
        Zdjęcia
      </span>

      {images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
          {images.map((image) => (
            <div key={image.id} className="relative group">
              <img
                src={image.url}
                alt=""
                className="w-full h-32 rounded-xl object-cover"
              />
              <button
                type="button"
                onClick={() => handleDeleteImage(image.id)}
                disabled={deletingImageId === image.id}
                className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-medium w-8 h-8 rounded-xl transition-colors flex items-center justify-center"
                aria-label="Usuń zdjęcie"
              >
                {deletingImageId === image.id ? "…" : "×"}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 mb-3">Ten post nie ma jeszcze zdjęć.</p>
      )}

      {canAddMoreImages && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
            isDragging
              ? "border-purple-500 bg-purple-100"
              : "border-gray-300 bg-white"
          }`}
        >
          <p className="text-gray-600 mb-4">
            {isUploading
              ? "Wysyłanie zdjęcia..."
              : "Przeciągnij i upuść zdjęcie tutaj"}
          </p>

          <input
            ref={fileInputRef}
            id="image-upload"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileInputChange}
            disabled={isUploading}
            className="sr-only"
          />

          <label
            htmlFor="image-upload"
            className={`inline-block bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-medium px-4 py-2 rounded-xl transition-colors ${
              isUploading ? "opacity-50 pointer-events-none" : "cursor-pointer"
            }`}
          >
            Wybierz plik
          </label>

          <p className="text-gray-400 text-sm mt-3">
            JPG, PNG lub WebP · maks. {MAX_IMAGES_PER_POST} zdjęć
          </p>
        </div>
      )}

      {!canAddMoreImages && images.length > 0 && (
        <p className="text-gray-500 text-sm">
          Osiągnięto limit {MAX_IMAGES_PER_POST} zdjęć na post.
        </p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-purple-50 py-8">
      <div className={`mx-auto px-6 ${isVisualPost ? "max-w-6xl" : "max-w-3xl"}`}>
        <h1 className="text-4xl font-bold text-gray-800 mb-6">
          Edytuj post
        </h1>

        {error && (
          <AlertModal message={error} onClose={() => setError(null)} />
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {isVisualPost ? (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-5">
                  {titleContentFields}
                  <PostStylePanel
                    style={visualStyle}
                    onChange={setVisualStyle}
                    postId={Number(id)}
                    onBackgroundUpload={handleBackgroundUpload}
                    onBackgroundRemove={handleBackgroundRemove}
                    isUploadingBackground={isUploadingBackground}
                  />
                </div>
              </div>

              <VisualPostPreviewShell label="Kanwas — układ posta">
                <VisualPostCanvas
                  title={title}
                  content={content}
                  style={visualStyle}
                  images={images}
                  layout={visualLayout}
                  editable
                  placeholder
                  selectedImageId={selectedImageId}
                  onSelectImage={setSelectedImageId}
                  onLayoutChange={setVisualLayout}
                  onDeleteImage={handleDeleteImage}
                />
              </VisualPostPreviewShell>
            </>
          ) : (
            <>
              {titleContentFields}
            </>
          )}

          {imagesSection}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-medium px-4 py-2 rounded-xl transition-colors"
            >
              {isSubmitting ? "Zapisywanie..." : "Zapisz zmiany"}
            </button>

            <Link
              to={`/post/${id}`}
              className="bg-gray-700 hover:bg-gray-800 text-white font-medium px-4 py-2 rounded-xl transition-colors"
            >
              Anuluj
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditPost;
