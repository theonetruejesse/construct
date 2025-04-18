"use client";

import React from "react";
import { cn } from "@construct/ui";
import { Check } from "lucide-react";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}

export function Checkbox({
  className,
  checked,
  onCheckedChange,
  disabled,
  onKeyDown,
  onBlur,
  autoFocus,
  ...props
}: CheckboxProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onCheckedChange) {
      onCheckedChange(e.target.checked);
    }
  };

  return (
    <div className="flex items-center">
      <div
        className={cn(
          "h-4 w-4 rounded border border-gray-300 flex items-center justify-center",
          checked ? "bg-primary border-primary" : "bg-white",
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
          className
        )}
      >
        {checked && <Check className="h-3 w-3 text-white" />}
      </div>
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
        autoFocus={autoFocus}
        {...props}
      />
    </div>
  );
}
