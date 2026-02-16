"use client";

import { $generateHtmlFromNodes } from "@lexical/html";
import type { LexicalEditor } from "lexical";

export const convertLexicalToHtml = (editor: LexicalEditor | null): string => {
  // Avoid calling on SSR or unmounted editor
  if (typeof window === "undefined" || !editor) return "";

  let htmlContent = "";

  try {
    // Safe state read (Lexical requires this)
    editor.read(() => {
      htmlContent = $generateHtmlFromNodes(editor as any, null);
      // Debug: print the editor state and generated HTML
      try {
        const stateJson = JSON.stringify(editor.getEditorState().toJSON());
        console.debug("[LexicalToHtml] EditorState JSON:", stateJson);
      } catch (e) {
        console.debug("[LexicalToHtml] Could not serialize editor state.");
      }
      console.debug("[LexicalToHtml] Generated HTML:", htmlContent);
    });
  } catch (err: any) {
    // Handles case where no active editor state exists yet
    console.warn("[convertLexicalToHtml] Failed to generate HTML:", err?.message);
    htmlContent = "";
  }

  return htmlContent;
};

