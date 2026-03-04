// export interface IDynamicField {
//   label: string;
//   type: "text" | "table" | "json" | "richtext";
//   value?:
//     | string
//     | { [key: string]: any }
//     | Array<{ [key: string]: any }>
//     | string[][]
//     | {
//         json?: any;
//         html?: string;
//       };
//   columns?: string[];
//   rows?: string[][];
//   meta?: Record<string, any>;
// }

export type IDynamicField =
  | {
      label: string;
      type: "text";
      value?: string;
      meta?: Record<string, unknown>;
    }
  | {
      label: string;
      type: "json";
      value?: Record<string, unknown> | unknown[];
      meta?: Record<string, unknown>;
    }
  | {
      label: string;
      type: "table";
      value?: Record<string, string | number | boolean | null>[] | (string | number | boolean | null)[][];
      columns?: string[];
      rows?: string[][];
      meta?: Record<string, unknown>;
    }
  | {
      label: string;
      type: "richtext";
      value?: { json?: unknown; html?: string };
      meta?: Record<string, unknown>;
    };