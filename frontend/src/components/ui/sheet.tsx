import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;
const SheetPortal = DialogPrimitive.Portal;

const SheetContent = ({ className, children, ...props }: DialogPrimitive.DialogContentProps) => (
  <SheetPortal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-slate-900/45 backdrop-blur-sm" />
    <DialogPrimitive.Content
      className={cn("fixed right-0 top-0 z-50 flex h-full w-[320px] flex-col border-l border-border bg-card p-6 shadow-panel", className)}
      {...props}
    >
      {children}
      <SheetClose className="absolute right-4 top-4 rounded-full p-2 hover:bg-muted">
        <X className="h-4 w-4" />
      </SheetClose>
    </DialogPrimitive.Content>
  </SheetPortal>
);

export { Sheet, SheetContent, SheetTrigger };
