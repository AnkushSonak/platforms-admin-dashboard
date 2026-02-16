// app/components/RichTextEditor.tsx
"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { SerializedEditorState, LexicalEditor } from "lexical";
import { convertLexicalToHtml } from "@/lib/utils/LaxicalToHtml";

interface RichTextEditorProps {
  id: string;
  value?: string | SerializedEditorState | null;
  onChange: (data: { id: string; json: any; html: string }) => void;
  placeholder?: string;
  className?: string;
  namespace?: string;
}

/**
 * Editor is dynamically imported from your editor-x package.
 * Editor MUST accept props: namespace?: string, editorSerializedState, onSerializedChange, onEditorReady
 */
const Editor = dynamic(
  () => import("@/components/blocks/editor-x/editor").then((m) => m.Editor),
  { ssr: false }
);

// simple debounce
const debounce = (fn: (...args: any[]) => void, ms = 150) => {
  let t: ReturnType<typeof setTimeout> | null = null;
  return (...args: any[]) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
};

export default React.memo(function RichTextEditor({
  id,
  value,
  onChange,
  placeholder = "",
  className = "",
  namespace,
}: RichTextEditorProps) {
  const editorRef = useRef<LexicalEditor | null>(null);

  // MUST be provided by parent or derived deterministically from id
  const baseNamespace = namespace || `lexical-editor-${id}`;
  // Add a stable suffix so multiple mounts for same field-index won't collide:
  const resolvedNamespace = baseNamespace;

  // Normalize incoming value into a SerializedEditorState (or fallback)
  const parseInitial = useCallback((): SerializedEditorState => {
    // If no value → return minimal doc with placeholder
    if (!value) {
      return {
        root: {
          type: "root",
          format: "",
          indent: 0,
          direction: "ltr",
          version: 1,
          children: [
            {
              type: "paragraph",
              format: "",
              indent: 0,
              direction: "ltr",
              version: 1,
              children: [
                {
                  type: "text",
                  version: 1,
                  detail: 0,
                  format: 0,
                  mode: "normal",
                  style: "",
                  text: placeholder,
                },
              ],
            },
          ],
        },
      } as unknown as SerializedEditorState;
    }

    // If string: guard against HTML vs JSON
    if (typeof value === "string") {
      const trimmed = value.trim();
      // Heuristic: strings that look like HTML shouldn't be JSON.parsed
      if (trimmed.startsWith("<")) {
        // We can't reliably convert HTML -> Lexical without @lexical/html right here.
        // So return empty doc (editor will render placeholder) and the parent should push JSON later.
        return {
          root: {
            type: "root",
            format: "",
            indent: 0,
            direction: "ltr",
            version: 1,
            children: [
              {
                type: "paragraph",
                format: "",
                indent: 0,
                direction: "ltr",
                version: 1,
                children: [
                  {
                    type: "text",
                    version: 1,
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: placeholder,
                  },
                ],
              },
            ],
          },
        } as unknown as SerializedEditorState;
      }

      // Try JSON parse for serialized lexical state - guard safely
      try {
        const parsed = JSON.parse(value);
        if (parsed && typeof parsed === "object" && "root" in parsed) {
          return parsed as SerializedEditorState;
        }
      } catch (err) {
        // fallthrough to safe doc
      }

      // fallback minimal doc
      return {
        root: {
          type: "root",
          format: "",
          indent: 0,
          direction: "ltr",
          version: 1,
          children: [
            {
              type: "paragraph",
              format: "",
              indent: 0,
              direction: "ltr",
              version: 1,
              children: [
                {
                  type: "text",
                  version: 1,
                  detail: 0,
                  format: 0,
                  mode: "normal",
                  style: "",
                  text: placeholder,
                },
              ],
            },
          ],
        },
      } as unknown as SerializedEditorState;
    }

    // object case — assume it's already serialized editor state
    if (typeof value === "object") {
      if ("root" in (value as any)) {
        return value as SerializedEditorState;
      }
    }

    // ultimate fallback
    return {
      root: {
        type: "root",
        format: "",
        indent: 0,
        direction: "ltr",
        version: 1,
        children: [
          {
            type: "paragraph",
            format: "",
            indent: 0,
            direction: "ltr",
            version: 1,
            children: [
              {
                type: "text",
                version: 1,
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: placeholder,
              },
            ],
          },
        ],
      },
    } as unknown as SerializedEditorState;
  }, [value, placeholder]);

  // const [initialState] = useState<SerializedEditorState>(() => parseInitial());
  const initialState = parseInitial();

  // editors should be isolated by namespace. parent must pass namespace prop.
  useEffect(() => {
    console.log("EDITOR MOUNT", {
      id,
      namespaceProvided: namespace,
      resolvedNamespace,
      // valuePreview tiny safe
      valuePreview: typeof value === "string" ? (value.length > 200 ? value.slice(0, 200) + "…" : value) : value,
      initialHasRoot: !!initialState?.root,
    });
  }, [id, namespace, resolvedNamespace, value, initialState]);

  // called by inner Editor when it's ready
  const handleEditorReady = (editor: LexicalEditor) => {
    editorRef.current = editor;
  };

  // Debounced publisher
  const publishChange = useCallback(
    debounce((state: SerializedEditorState) => {
      let html = "";
      try {
        if (editorRef.current) {
          html = convertLexicalToHtml(editorRef.current) || "";
        }
      } catch {
        html = "";
      }
      onChange({ id, json: state, html });
    }, 120),
    [id, onChange]
  );

  // called by inner Editor plugin when serialized state changes
  const handleSerializedChange = (state: SerializedEditorState) => {
    if (!state || typeof state !== "object" || !("root" in state)) {
      // coerce to safe doc (avoid passing invalid states)
      const safe = parseInitial();
      publishChange(safe);
      return;
    }
    publishChange(state);
  };

  useEffect(() => {
    // cleanup on unmount
    return () => {
      editorRef.current = null;
    };
  }, []);

  const wrapperKey = resolvedNamespace;

  return (
    <div key={wrapperKey} className={`border rounded-md ${className}`}>
      <Editor
        key={wrapperKey}
        namespace={resolvedNamespace}
        editorSerializedState={initialState}
        onSerializedChange={handleSerializedChange}
        onEditorReady={handleEditorReady}
      />
    </div>
  );
});
