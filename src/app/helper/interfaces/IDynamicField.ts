export interface IDynamicField {
  label: string;
  type: "text" | "table" | "json";
  value?: string | { [key: string]: any } | Array<{ [key: string]: any }>;
  columns?: string[];
  rows?: string[][];
}
