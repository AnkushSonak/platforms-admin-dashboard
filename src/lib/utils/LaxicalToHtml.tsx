"use client";

import { $generateHtmlFromNodes } from "@lexical/html";
import type { LexicalEditor } from "lexical";

export const convertLexicalToHtml = (editor: LexicalEditor | null): string => {
  // Avoid calling on SSR or unmounted editor
  if (typeof window === "undefined" || !editor) return "";
  const isDev = process.env.NODE_ENV !== "production";

  let htmlContent = "";

  try {
    // Safe state read (Lexical requires this)
    editor.read(() => {
      htmlContent = $generateHtmlFromNodes(editor as any, null);
    });
  } catch (err: any) {
    if (isDev) {
      console.warn("[convertLexicalToHtml] Failed to generate HTML:", err?.message);
    }
    htmlContent = "";
  }

  return htmlContent;
};

