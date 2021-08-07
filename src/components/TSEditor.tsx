import React, { CSSProperties, useEffect, useRef, useState } from "react";
import { FileMap, ThemeName, TSEditor } from "../editor";

type EditorProps = {
  /** (Controlled) Value of the editor */
  value: string;
  /** Controls if the editor is readonly */
  readonly?: boolean;
  /** Theme for the editor */
  theme?: ThemeName;
  /** Additional Typescript types to load into the editor */
  types?: FileMap;
  /** Additional styles for the editor container */
  style?: CSSProperties;
  /** Additional classes for the editor container */
  className?: string;
  /** Callback called when the value of the editor changes (debounced) */
  onChange?: (value: string) => void;
  /** Callback called when the user requests a query to be run */
  onExecuteQuery?: (query: string) => void;
};

export function Editor({
  value,
  readonly,
  types,
  theme,
  style,
  className,
  onChange,
  onExecuteQuery,
}: EditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [editor, setEditor] = useState<TSEditor>();

  // Handles editor lifecycle
  useEffect(() => {
    const tsEditor = new TSEditor({
      domElement: ref.current!, // `!` is fine because this will run after the component has mounted
      code: value,
      readonly,
      theme,
      types,
      onChange,
      onExecuteQuery,
    });
    setEditor(tsEditor);

    return () => {
      tsEditor?.destroy();
      setEditor(undefined);
    };
  }, []);

  // Ensures `types` given to this component are always reflected in the editor
  useEffect(() => {
    editor?.injectTypes(types || {});
  }, [editor, types]);

  // Ensures `value` given to this component is always reflected in the editor
  useEffect(() => {
    editor?.forceUpdate(value);
  }, [value]);

  // Ensures `theme` given to this component is always reflected in the editor
  useEffect(() => {
    theme && editor?.setTheme(theme);
  }, [theme]);

  return <div ref={ref} style={style} className={className} />;
}