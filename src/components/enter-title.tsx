import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface EnterTitleProps {
  open: boolean,
  setOpen: (open: boolean) => void,
  onSubmit: (title: string) => void;
  triggerLabel?: string;
}

export function EnterTitle({ open, setOpen, onSubmit, triggerLabel = "Add Title" }: EnterTitleProps) {
  const [title, setTitle] = useState("");

  const handleSubmit = () => {
    onSubmit(title);
    setTitle("");
    setOpen(false);  // close modal
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">{triggerLabel}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enter a Title</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <Input
            placeholder="Enter title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit} disabled={!title.trim()}>
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
