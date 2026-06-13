import type { CSSProperties } from "react";
import type { FontSizeOption, VisualStyle } from "../types";

export const DEFAULT_VISUAL_STYLE: VisualStyle = {
  backgroundColor: "#ffffff",
  backgroundImageUrl: null,
  fontFamily: "system-ui, sans-serif",
  fontSize: "medium",
  textColor: "#374151",
};

export const VISUAL_POST_SHELL_CLASS =
  "p-6 sm:p-10 max-w-5xl mx-auto w-full";

export const FONT_OPTIONS = [
  { label: "Domyślna", value: "system-ui, sans-serif" },
  { label: "Szeryfowa (Georgia)", value: "Georgia, serif" },
  { label: "Klasyczna (Times)", value: '"Times New Roman", Times, serif' },
  { label: "Bezszeryfowa (Arial)", value: "Arial, Helvetica, sans-serif" },
  { label: "Verdana", value: "Verdana, sans-serif" },
  { label: "Monospace", value: '"Courier New", monospace' },
] as const;

export const FONT_SIZE_OPTIONS: { label: string; value: FontSizeOption; css: string }[] = [
  { label: "Mała", value: "small", css: "0.875rem" },
  { label: "Średnia", value: "medium", css: "1.125rem" },
  { label: "Duża", value: "large", css: "1.375rem" },
];

export function getFontSizeCss(fontSize: FontSizeOption): string {
  return FONT_SIZE_OPTIONS.find((option) => option.value === fontSize)?.css ?? "1.125rem";
}

export function getVisualPostStyles(style: VisualStyle): CSSProperties {
  return {
    backgroundColor: style.backgroundColor,
    backgroundImage: style.backgroundImageUrl ? `url(${style.backgroundImageUrl})` : undefined,
    backgroundSize: "cover",
    backgroundPosition: "center",
    fontFamily: style.fontFamily,
    fontSize: getFontSizeCss(style.fontSize),
    color: style.textColor,
  };
}

export function countWhitespace(value: string): number {
  return (value.match(/\s/g) ?? []).length;
}

export function validateTitle(title: string): string | null {
  if (title.length < 5) {
    return "Tytuł musi mieć minimum 5 znaków.";
  }

  if (title.trim().length === 0) {
    return "Tytuł nie może składać się wyłącznie ze znaków białych.";
  }

  return null;
}

export function validateContent(content: string): string | null {
  if (content.length < 30) {
    return "Treść musi mieć minimum 30 znaków.";
  }

  if (countWhitespace(content) > content.length / 2) {
    return "Treść może zawierać maksymalnie połowę znaków białych.";
  }

  return null;
}

export function validateForm(title: string, content: string): string | null {
  return validateTitle(title) ?? validateContent(content);
}
