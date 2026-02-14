import { Button } from "@/components/shadcn/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/shadcn/ui/dialog";
import { useState } from "react";
import { JsonField } from "./JsonField";

export interface JsonFieldItem {
  title: string;
  subtitle?: string;
  value?: string;
  type: string;
  date?: Date;
  tag?: string;
  rightCode?: string;
  isSelected?: boolean;
  description?: string;
}

interface JsonFieldProps {
  value: JsonFieldItem[];
  onChange: (items: JsonFieldItem[]) => void;
  title?: string;
  allowedTypes?: string[];
  errors?: string;
}

const defaultTypes = ["text", "number", "date", "email", "url", "boolean", "json"];

export const JsonFieldDialog: React.FC<JsonFieldProps> = ({
  value,
  onChange,
  title,
  allowedTypes = defaultTypes,
  errors,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open {title} Dialog</Button>

      <Dialog open={isOpen} onOpenChange={() => setIsOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>

          <JsonField
            value={value}
            onChange={onChange}
            allowedTypes={allowedTypes}
            errors={errors}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
