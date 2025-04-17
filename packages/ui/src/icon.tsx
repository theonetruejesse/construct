import { memo } from "react";
import { icons } from "lucide-react";

import { cn } from ".";

export type IconProps = {
  name: keyof typeof icons;
  className?: string;
  stroke?: number;
};

export const Icon = memo(({ name, className, stroke }: IconProps) => {
  const IconComponent = icons[name];

  if (!IconComponent) return null;

  return (
    <IconComponent
      className={cn("h-4 w-4", className)}
      strokeWidth={stroke || 3}
    />
  );
});
