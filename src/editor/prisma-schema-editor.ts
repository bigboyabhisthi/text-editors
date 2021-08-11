import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { logger } from "../logger";
import { BaseEditor } from "./base-editor";
import { appearance, ThemeName } from "./extensions/appearance";
import { behaviour } from "./extensions/behaviour";
import { keymap } from "./extensions/keymap";

const log = logger("prisma-schema-editor", "salmon");

type PrismaSchemaEditorParams = {
  domElement: Element;
  code?: string;
  readonly?: boolean;
  theme?: ThemeName;
  onChange?: (value: string) => void;
};

export class PrismaSchemaEditor extends BaseEditor {
  protected view: EditorView;

  /**
   * Returns a state-only version of the editor, without mounting the actual view anywhere. Useful for testing.
   */
  static state(params: PrismaSchemaEditorParams) {
    const { width, height } = params.domElement?.getBoundingClientRect();

    return EditorState.create({
      doc: params.code || "",

      extensions: [
        EditorView.editable.of(!params.readonly),

        appearance({ theme: params.theme, width, height }),
        behaviour({ onChange: params.onChange }),
        keymap(),
      ],
    });
  }

  constructor(params: PrismaSchemaEditorParams) {
    super(params);

    this.view = new EditorView({
      parent: params.domElement,
      state: PrismaSchemaEditor.state(params),
    });

    log("Initialized");
  }
}
