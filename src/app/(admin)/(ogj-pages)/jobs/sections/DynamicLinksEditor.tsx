// import { Button } from "@/components/shadcn/ui/button";
// import { Input } from "@/components/shadcn/ui/input";
// import { X, Plus } from "lucide-react";

// export type LinkGroup = {
//   label: string;
//   links: string[];
// };


// type Props = {
//   value: LinkGroup[];
//   onChange: (value: LinkGroup[]) => void;
// };

// export function DynamicLinksEditor({ value = [], onChange }: Props) {
//   const update = (next: LinkGroup[]) => onChange([...next]);

//   /* ---------------- Groups ---------------- */

//   const addGroup = () =>
//     update([...value, { label: "", links: [""] }]);

//   const removeGroup = (index: number) =>
//     update(value.filter((_, i) => i !== index));

//   const updateGroupLabel = (index: number, label: string) => {
//     const next = [...value];
//     next[index] = { ...next[index], label };
//     update(next);
//   };

//   /* ---------------- Links ---------------- */

//   const addLink = (groupIndex: number) => {
//     const next = [...value];
//     next[groupIndex] = {
//       ...next[groupIndex],
//       links: [...next[groupIndex].links, ""],
//     };
//     update(next);
//   };

//   const removeLink = (groupIndex: number, linkIndex: number) => {
//     const next = [...value];
//     next[groupIndex] = {
//       ...next[groupIndex],
//       links: next[groupIndex].links.filter((_, i) => i !== linkIndex),
//     };
//     update(next);
//   };

//   const updateLink = (
//     groupIndex: number,
//     linkIndex: number,
//     link: string
//   ) => {
//     const next = [...value];
//     const links = [...next[groupIndex].links];
//     links[linkIndex] = link;
//     next[groupIndex] = { ...next[groupIndex], links };
//     update(next);
//   };

//   /* ---------------- UI ---------------- */

//   return (
//     <div className="space-y-4 overflow-y-auto h-48 border">
//       {value.map((group, groupIndex) => (
//         <div
//           key={groupIndex}
//           className="border rounded p-4 space-y-3 relative"
//         >
//           {/* Remove group */}
//           <button
//             type="button"
//             onClick={() => removeGroup(groupIndex)}
//             className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
//           >
//             <X size={14} />
//           </button>

//           {/* Label */}
//           <Input
//             placeholder="Section label (e.g. Download Links)"
//             value={group.label}
//             onChange={(e) =>
//               updateGroupLabel(groupIndex, e.target.value)
//             }
//           />

//           {/* Links */}
//           <div className="space-y-2">
//             {group.links.map((link, linkIndex) => (
//               <div key={linkIndex} className="flex gap-2">
//                 <Input
//                   placeholder="https://example.com"
//                   value={link}
//                   onChange={(e) =>
//                     updateLink(groupIndex, linkIndex, e.target.value)
//                   }
//                   onKeyDown={(e) => {
//                     if (e.key === "Enter") {
//                       e.preventDefault();
//                       addLink(groupIndex);
//                     }
//                   }}
//                 />

//                 <button
//                   type="button"
//                   onClick={() =>
//                     removeLink(groupIndex, linkIndex)
//                   }
//                   className="text-muted-foreground hover:text-destructive"
//                 >
//                   <X size={16} />
//                 </button>
//               </div>
//             ))}
//           </div>

//           {/* Add link */}
//           <Button
//             type="button"
//             variant="outline"
//             size="sm"
//             onClick={() => addLink(groupIndex)}
//             className="flex items-center gap-1"
//           >
//             <Plus size={14} /> Add Link
//           </Button>
//         </div>
//       ))}

//       {/* Add group */}
//       <Button
//         type="button"
//         onClick={addGroup}
//         className="flex items-center gap-2"
//       >
//         <Plus size={16} /> Add Link Group
//       </Button>
//     </div>
//   );
// }
