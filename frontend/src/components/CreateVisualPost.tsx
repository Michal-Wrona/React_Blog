import { useRef, useState } from "react";
import type { ChangeEvent, DragEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Image, Post, UpdatePostRequest, VisualLayout, VisualStyle } from "../types";
import AlertModal from "./AlertModal";
import PostStylePanel from "./PostStylePanel";
import VisualPostCanvas from "./VisualPostCanvas";
import VisualPostPreviewShell from "./VisualPostPreviewShell";
import {
  DEFAULT_VISUAL_STYLE,
  validateForm,
} from "../utils/postFormUtils";
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

function CreateVisualPost() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [visualStyle, setVisualStyle] = useState<VisualStyle>(DEFAULT_VISUAL_STYLE);
  const [visualLayout, setVisualLayout] = useState<VisualLayout>(EMPTY_VISUAL_LAYOUT);
  const [postId, setPostId] = useState<number | null>(null);
  const [images, setImages] = useState<Image[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingBackground, setIsUploadingBackground] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function ensurePostExists(): Promise<number | null> {
    const validationError = validateForm(title, content);
    if (validationError) {
      setError(validationError);
      return null;
    }

    if (postId !== null) {
      const updatedPost: UpdatePostRequest = {
        id: postId,
        title,
        content,
        visualStyle,
        visualLayout,
      };

      const response = await fetch("/api/Post", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPost),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Nie udało się zapisać posta.");
      }

      return postId;
    }

    const response = await fetch("/api/Post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        content,
        postType: "visual",
        visualStyle,
        visualLayout,
      }),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || "Nie udało się utworzyć posta.");
    }

    const createdPost: Post = await response.json();
    setPostId(createdPost.id);
    setImages(createdPost.images ?? []);
    if (createdPost.visualStyle) {
      setVisualStyle(createdPost.visualStyle);
    }
    if (createdPost.visualLayout) {
      setVisualLayout(normalizeVisualLayout(createdPost.visualLayout));
    }
    return createdPost.id;
  }

  async function handleBackgroundUpload(file: File) {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setError("Niedozwolony format pliku. Dozwolone: jpg, png, webp.");
      return;
    }

    setError(null);
    setIsUploadingBackground(true);

    try {
      const currentPostId = await ensurePostExists();
      if (currentPostId === null) {
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`/api/Post/${currentPostId}/background-image`, {
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
    if (postId === null) {
      return;
    }

    setError(null);

    try {
      const response = await fetch(`/api/Post/${postId}/background-image`, {
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
      const currentPostId = await ensurePostExists();
      if (currentPostId === null) {
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`/api/Post/${currentPostId}/add-photo`, {
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

      await fetch("/api/Post", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: currentPostId,
          title,
          content,
          visualStyle,
          visualLayout: nextLayout,
        } satisfies UpdatePostRequest),
      });
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
    if (postId === null) {
      return;
    }

    setError(null);

    try {
      const response = await fetch(`/api/Post/${postId}/images/${imageId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Nie udało się usunąć zdjęcia.");
      }

      const nextLayout = removePlacement(visualLayout, imageId);
      setImages((previous) => previous.filter((image) => image.id !== imageId));
      setVisualLayout(nextLayout);
      setSelectedImageId(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Wystąpił błąd podczas usuwania zdjęcia.";
      setError(message);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const validationError = validateForm(title, content);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const currentPostId = await ensurePostExists();
      if (currentPostId === null) {
        return;
      }

      navigate(`/post/${currentPostId}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Wystąpił błąd podczas tworzenia posta.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const canAddMoreImages = images.length < MAX_IMAGES_PER_POST;

  return (
    <div className="min-h-screen bg-purple-50 py-8">
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Post z własnym układem
        </h1>
        <p className="text-gray-600 mb-6">
          Dostosuj wygląd i rozmieść zdjęcia na kanwasie. Podgląd pokazuje efekt końcowy.
        </p>

        <Link to="/post/new" className="text-purple-600 hover:text-purple-800 text-sm mb-4 inline-block">
          ← Zmień typ posta
        </Link>

        {error && (
          <AlertModal message={error} onClose={() => setError(null)} />
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-5 max-w-2xl">
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
                  className="min-h-40 w-full rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <PostStylePanel
                style={visualStyle}
                onChange={setVisualStyle}
                postId={postId}
                onBackgroundUpload={handleBackgroundUpload}
                onBackgroundRemove={handleBackgroundRemove}
                isUploadingBackground={isUploadingBackground}
            />
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
                  JPG, PNG lub WebP · maks. {MAX_IMAGES_PER_POST} zdjęć · wymaga tytułu i treści
                </p>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                Osiągnięto limit {MAX_IMAGES_PER_POST} zdjęć na post.
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-medium px-4 py-2 rounded-xl transition-colors"
            >
              {isSubmitting ? "Zapisywanie..." : "Zapisz post"}
            </button>

            <Link
              to="/blog"
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

export default CreateVisualPost;
