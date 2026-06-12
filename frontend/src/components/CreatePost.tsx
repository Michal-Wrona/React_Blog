import { useRef, useState } from "react";
import type { ChangeEvent, DragEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Image, Post, CreatePostRequest, UpdatePostRequest } from "../types";
import AlertModal from "./AlertModal";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGES_PER_POST = 5;

function countWhitespace(value: string): number {
  return (value.match(/\s/g) ?? []).length;
}

function validateTitle(title: string): string | null {
  if (title.length < 5) {
    return "Tytuł musi mieć minimum 5 znaków.";
  }

  if (title.trim().length === 0) {
    return "Tytuł nie może składać się wyłącznie ze znaków białych.";
  }

  return null;
}

function validateContent(content: string): string | null {
  if (content.length < 30) {
    return "Treść musi mieć minimum 30 znaków.";
  }

  if (countWhitespace(content) > content.length / 2) {
    return "Treść może zawierać maksymalnie połowę znaków białych.";
  }

  return null;
}

function CreatePost() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [postId, setPostId] = useState<number | null>(null);
  const [images, setImages] = useState<Image[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function validateForm(): string | null {
    return validateTitle(title) ?? validateContent(content);
  }

  async function ensurePostExists(): Promise<number | null> {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return null;
    }

    if (postId !== null) {
      return postId;
    }

    const newPost: CreatePostRequest = { title, content };

    const response = await fetch("/api/Post", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newPost),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || "Nie udało się utworzyć posta.");
    }

    const createdPost: Post = await response.json();
    setPostId(createdPost.id);
    setImages(createdPost.images ?? []);
    return createdPost.id;
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
      setImages((previous) => [...previous, createdImage]);
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
    setDeletingImageId(imageId);

    try {
      const response = await fetch(`/api/Post/${postId}/images/${imageId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Nie udało się usunąć zdjęcia.");
      }

      setImages((previous) => previous.filter((image) => image.id !== imageId));
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

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      if (postId !== null) {
        const updatedPost: UpdatePostRequest = {
          id: postId,
          title,
          content,
        };

        const response = await fetch("/api/Post", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedPost),
        });

        if (!response.ok) {
          throw new Error("Nie udało się zapisać posta.");
        }

        navigate(`/post/${postId}`);
        return;
      }

      const newPost: CreatePostRequest = { title, content };

      const response = await fetch("/api/Post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPost),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Nie udało się utworzyć posta.");
      }

      const createdPost: Post = await response.json();
      navigate(`/post/${createdPost.id}`);
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
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">
          Dodaj post
        </h1>

        {error && (
          <AlertModal message={error} onClose={() => setError(null)} />
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
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
            <p className="text-gray-400 text-sm mt-1">
              Minimum 5 znaków, nie może składać się wyłącznie ze spacji.
            </p>
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
            <p className="text-gray-400 text-sm mt-1">
              Minimum 30 znaków, znaki białe mogą stanowić maksymalnie połowę treści.
            </p>
          </div>

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

            {!canAddMoreImages && (
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

export default CreatePost;
