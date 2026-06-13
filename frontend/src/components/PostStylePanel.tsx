import type { ChangeEvent } from "react";
import type { VisualStyle } from "../types";
import { FONT_OPTIONS, FONT_SIZE_OPTIONS } from "../utils/postFormUtils";

type PostStylePanelProps = {
  style: VisualStyle;
  onChange: (style: VisualStyle) => void;
  postId: number | null;
  onBackgroundUpload: (file: File) => void;
  onBackgroundRemove: () => void;
  isUploadingBackground: boolean;
};

function PostStylePanel({
  style,
  onChange,
  postId,
  onBackgroundUpload,
  onBackgroundRemove,
  isUploadingBackground,
}: PostStylePanelProps) {
  function handleBackgroundFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      onBackgroundUpload(file);
    }
    event.target.value = "";
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-5">
      <h3 className="text-lg font-semibold text-gray-800">
        Wygląd posta
      </h3>

      <div>
        <label htmlFor="backgroundColor" className="block text-gray-700 font-medium mb-2">
          Kolor tła
        </label>
        <div className="flex items-center gap-3">
          <input
            id="backgroundColor"
            type="color"
            value={style.backgroundColor}
            onChange={(event) => onChange({ ...style, backgroundColor: event.target.value })}
            className="w-12 h-10 rounded-lg border border-gray-300 cursor-pointer"
          />
          <span className="text-gray-500 text-sm">{style.backgroundColor}</span>
        </div>
      </div>

      <div>
        <span className="block text-gray-700 font-medium mb-2">
          Tło graficzne
        </span>

        {style.backgroundImageUrl ? (
          <div className="space-y-3">
            <img
              src={style.backgroundImageUrl}
              alt=""
              className="w-full h-24 rounded-xl object-cover"
            />
            <button
              type="button"
              onClick={onBackgroundRemove}
              disabled={postId === null}
              className="text-red-600 hover:text-red-700 text-sm font-medium disabled:text-gray-400"
            >
              Usuń tło graficzne
            </button>
          </div>
        ) : (
          <p className="text-gray-500 text-sm mb-2">
            Opcjonalne zdjęcie w tle posta.
          </p>
        )}

        <input
          id="background-upload"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleBackgroundFileChange}
          disabled={isUploadingBackground || postId === null}
          className="sr-only"
        />

        <label
          htmlFor="background-upload"
          className={`inline-block bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium px-4 py-2 rounded-xl transition-colors text-sm ${
            isUploadingBackground || postId === null
              ? "opacity-50 pointer-events-none"
              : "cursor-pointer"
          }`}
        >
          {isUploadingBackground ? "Wysyłanie..." : "Wybierz tło graficzne"}
        </label>

        {postId === null && (
          <p className="text-gray-400 text-xs mt-2">
            Wypełnij tytuł i treść, aby dodać tło graficzne.
          </p>
        )}
      </div>

      <div>
        <label htmlFor="fontFamily" className="block text-gray-700 font-medium mb-2">
          Czcionka
        </label>
        <select
          id="fontFamily"
          value={style.fontFamily}
          onChange={(event) => onChange({ ...style, fontFamily: event.target.value })}
          className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          {FONT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <span className="block text-gray-700 font-medium mb-2">
          Rozmiar czcionki
        </span>
        <div className="flex gap-2">
          {FONT_SIZE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange({ ...style, fontSize: option.value })}
              className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                style.fontSize === option.value
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="textColor" className="block text-gray-700 font-medium mb-2">
          Kolor tekstu
        </label>
        <div className="flex items-center gap-3">
          <input
            id="textColor"
            type="color"
            value={style.textColor}
            onChange={(event) => onChange({ ...style, textColor: event.target.value })}
            className="w-12 h-10 rounded-lg border border-gray-300 cursor-pointer"
          />
          <span className="text-gray-500 text-sm">{style.textColor}</span>
        </div>
      </div>
    </div>
  );
}

export default PostStylePanel;
