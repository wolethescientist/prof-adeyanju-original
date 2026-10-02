"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * An area files can be dropped on, which also opens the file chooser when
 * clicked or activated from the keyboard. Its children describe what to drop.
 */
export default function Dropzone({
  accept,
  multiple = false,
  onFiles,
  disabled = false,
  className,
  children,
  label,
}: {
  accept: string;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
  /** What the button does, for screen readers. */
  label: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  return (
    <div
      className={cn(
        "relative rounded-xl border-2 border-dashed transition-colors",
        over ? "border-primary bg-secondary/60" : "border-border hover:border-primary/50",
        disabled && "pointer-events-none opacity-60",
        className
      )}
      onDragOver={(event) => {
        event.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setOver(false);
        const files = Array.from(event.dataTransfer.files);
        if (files.length) onFiles(multiple ? files : files.slice(0, 1));
      }}
    >
      <button
        type="button"
        onClick={() => input.current?.click()}
        className="absolute inset-0 z-0 cursor-pointer rounded-xl"
        aria-label={label}
        disabled={disabled}
      />
      <div className="pointer-events-none relative z-10">{children}</div>
      <input
        ref={input}
        type="file"
        accept={accept}
        multiple={multiple}
        hidden
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          event.target.value = "";
          if (files.length) onFiles(files);
        }}
      />
    </div>
  );
}
