import { useRef, useState } from "react";
import type { ChangeEvent, DragEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../api/client";
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
  createDefaultGallery,
  createDefaultPlacement,
  EMPTY_VISUAL_LAYOUT,
  loadImageAspectRatio,
  normalizeVisualLayout,
  removeGallery,
  removePlacement,
  upsertGallery,
  upsertPlacement,
} from "../utils/visualLayoutUtils";
import {
  MAX_GALLERY_IMAGES,
  MAX_IMAGES_VISUAL,
  MIN_GALLERY_IMAGES,
} from "../constants/imageLimits";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

function CreateVisualPost() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [visualStyle, setVisualStyle] = useState<VisualStyle>(DEFAULT_VISUAL_STYLE);
  const [visualLayout, setVisualLayout] = useState<VisualLayout>(EMPTY_VISUAL_LAYOUT);
  const [postId, setPostId] = useState<number | null>(null);
  const [images, setImages] = useState<Image[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);
  const [selectedGalleryId, setSelectedGalleryId] = useState<string | null>(null);
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

      const response = await apiFetch("/api/Post", {
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

    const response = await apiFetch("/api/Post", {
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

      const response = await apiFetch(`/api/Post/${currentPostId}/background-image`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Nie udało się dodać tła.");
      }

      const url = (await response.text()).replace(/^"|"$/g, "");
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
      const response = await apiFetch(`/api/Post/${postId}/background-image`, {
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

    if (images.length >= MAX_IMAGES_VISUAL) {
      setError(`Maksymalnie ${MAX_IMAGES_VISUAL} zdjęć na post wizualny.`);
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

      const response = await apiFetch(`/api/Post/${currentPostId}/add-photo`, {
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
      setSelectedGalleryId(null);

      await apiFetch("/api/Post", {
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

  async function uploadGallery(files: FileList) {
    const fileArray = Array.from(files).filter((file) =>
      ACCEPTED_IMAGE_TYPES.includes(file.type)
    );

    if (
      fileArray.length < MIN_GALLERY_IMAGES ||
      fileArray.length > MAX_GALLERY_IMAGES
    ) {
      setError(
        `Galeria wymaga od ${MIN_GALLERY_IMAGES} do ${MAX_GALLERY_IMAGES} zdjęć.`
      );
      return;
    }

    if (images.length + fileArray.length > MAX_IMAGES_VISUAL) {
      setError(`Maksymalnie ${MAX_IMAGES_VISUAL} zdjęć na post wizualny.`);
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const currentPostId = await ensurePostExists();
      if (currentPostId === null) {
        return;
      }

      const uploadedImages: Image[] = [];

      for (const file of fileArray) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await apiFetch(`/api/Post/${currentPostId}/add-photo`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const message = await response.text();
          throw new Error(message || "Nie udało się dodać zdjęcia do galerii.");
        }

        uploadedImages.push((await response.json()) as Image);
      }

      const aspectRatio = await loadImageAspectRatio(uploadedImages[0].url);
      const currentLayout = normalizeVisualLayout(visualLayout);
      const gallery = createDefaultGallery(
        uploadedImages.map((image) => image.id),
        aspectRatio,
        currentLayout.placements.length + currentLayout.galleries.length
      );
      const nextLayout = upsertGallery(currentLayout, gallery);

      setImages((previous) => [...previous, ...uploadedImages]);
      setVisualLayout(nextLayout);
      setSelectedGalleryId(gallery.galleryId);
      setSelectedImageId(null);

      await apiFetch("/api/Post", {
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
    } catch (uploadError) {
      const message =
        uploadError instanceof Error
          ? uploadError.message
          : "Wystąpił błąd podczas dodawania galerii.";
      setError(message);
    } finally {
      setIsUploading(false);
      if (galleryFileInputRef.current) {
        galleryFileInputRef.current.value = "";
      }
    }
  }

  function handleGalleryInputChange(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (files && files.length > 0) {
      uploadGallery(files);
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
      const response = await apiFetch(`/api/Post/${postId}/images/${imageId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Nie udało się usunąć zdjęcia.");
      }

      const nextLayout = removePlacement(visualLayout, imageId);
      setImages((previous) => previous.filter((image) => image.id !== imageId));
      setVisualLayout(nextLayout);
      setSelectedImageId(null);
      setSelectedGalleryId(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Wystąpił błąd podczas usuwania zdjęcia.";
      setError(message);
    }
  }

  async function handleDeleteGallery(galleryId: string) {
    if (postId === null) {
      return;
    }

    const gallery = normalizeVisualLayout(visualLayout).galleries.find(
      (item) => item.galleryId === galleryId
    );
    if (!gallery) {
      return;
    }

    setError(null);

    try {
      for (const imageId of gallery.imageIds) {
        const response = await apiFetch(`/api/Post/${postId}/images/${imageId}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error("Nie udało się usunąć zdjęcia z galerii.");
        }
      }

      const nextLayout = removeGallery(visualLayout, galleryId);
      setImages((previous) =>
        previous.filter((image) => !gallery.imageIds.includes(image.id))
      );
      setVisualLayout(nextLayout);
      setSelectedGalleryId(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Wystąpił błąd podczas usuwania galerii.";
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

  const canAddMoreImages = images.length < MAX_IMAGES_VISUAL;

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
              selectedGalleryId={selectedGalleryId}
              onSelectImage={setSelectedImageId}
              onSelectGallery={setSelectedGalleryId}
              onLayoutChange={setVisualLayout}
              onDeleteImage={handleDeleteImage}
              onDeleteGallery={handleDeleteGallery}
            />
          </VisualPostPreviewShell>

          <div>
            <span className="block text-gray-700 font-medium mb-2">
              Dodaj media na kanwas
            </span>

            <div className="flex flex-wrap gap-3 mb-4">
              {canAddMoreImages && (
                <>
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
                    Pojedyncze zdjęcie
                  </label>

                  <input
                    ref={galleryFileInputRef}
                    id="gallery-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handleGalleryInputChange}
                    disabled={isUploading}
                    className="sr-only"
                  />
                  <label
                    htmlFor="gallery-upload"
                    className={`inline-block bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-medium px-4 py-2 rounded-xl transition-colors ${
                      isUploading ? "opacity-50 pointer-events-none" : "cursor-pointer"
                    }`}
                  >
                    Galeria ({MIN_GALLERY_IMAGES}–{MAX_GALLERY_IMAGES} zdjęć)
                  </label>
                </>
              )}
            </div>

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
                <p className="text-gray-600 mb-2">
                  {isUploading
                    ? "Wysyłanie..."
                    : "Przeciągnij pojedyncze zdjęcie tutaj"}
                </p>
                <p className="text-gray-400 text-sm">
                  JPG, PNG lub WebP · maks. {MAX_IMAGES_VISUAL} zdjęć na kanwas ·
                  galeria: {MIN_GALLERY_IMAGES}–{MAX_GALLERY_IMAGES} plików naraz
                </p>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                Osiągnięto limit {MAX_IMAGES_VISUAL} zdjęć na post wizualny.
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
