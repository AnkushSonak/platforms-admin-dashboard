// src/components/blocks/editor-x/editor.tsx
"use client";

import { InitialConfigType, LexicalComposer } from "@lexical/react/LexicalComposer";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { EditorState, LexicalEditor, SerializedEditorState } from "lexical";
import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

import { editorTheme } from "../../editor/themes/editor-theme";
import { nodes } from "./nodes";
import { Plugins } from "./plugins";
import { TooltipProvider } from "@/components/shadcn/ui/tooltip";

interface EditorProps {
  namespace?: string;
  editorState?: EditorState;
  editorSerializedState?: SerializedEditorState;
  onChange?: (editorState: EditorState) => void;
  onSerializedChange?: (editorSerializedState: SerializedEditorState) => void;
  onEditorReady?: (editor: LexicalEditor) => void;
}

/** Notify parent when Lexical is ready */
function OnReadyPlugin({ onEditorReady }: { onEditorReady?: (editor: LexicalEditor) => void }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (onEditorReady) onEditorReady(editor);
  }, [editor, onEditorReady]);

  return null;
}

export function Editor({
  namespace = "Editor",
  editorState,
  editorSerializedState,
  onChange,
  onSerializedChange,
  onEditorReady,
}: EditorProps) {
  // Build initialConfig: always use passed `namespace` (no internal static namespace)
  const initialConfig: InitialConfigType = {
    namespace,
    theme: editorTheme,
    nodes,
    onError: (err) => console.error(err),
    editorState: editorState
      ? editorState
      : editorSerializedState
      ? (editor: LexicalEditor) => {
          // editorSerializedState is an object — ensure we pass the string form to parseEditorState
          try {
            // stringify to be defensive (parseEditorState accepts string)
            const serialized = typeof editorSerializedState === "string" ? editorSerializedState : JSON.stringify(editorSerializedState);
            const parsed = editor.parseEditorState(serialized);
            editor.setEditorState(parsed);
          } catch (e) {
            // fallback: ignore and let composer create empty doc
            console.warn("Editor: failed to parse editorSerializedState for namespace", namespace, e);
          }
        }
      : undefined,
  };

  useEffect(() => {
    console.log("LEXICAL INIT", {
      namespace: initialConfig.namespace,
      hasEditorSerializedState: !!editorSerializedState,
    });
  }, [initialConfig.namespace, editorSerializedState]);

  return (
    <div className="bg-background overflow-hidden rounded-lg border shadow">
      <LexicalComposer initialConfig={initialConfig}>
        <TooltipProvider>
          <Plugins />
          <OnReadyPlugin onEditorReady={onEditorReady} />
          <OnChangePlugin
            ignoreSelectionChange={true}
            onChange={(state: EditorState) => {
              onChange?.(state);
              try {
                onSerializedChange?.(state.toJSON());
              } catch (e) {
                // swallow
              }
            }}
          />
        </TooltipProvider>
      </LexicalComposer>
    </div>
  );
}
