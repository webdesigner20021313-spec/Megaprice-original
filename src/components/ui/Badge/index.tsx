import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-4 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gray-900 text-white",
        secondary:
          "border-transparent bg-[#dde3ff] text-[#4e36f5]",
        outline:
          "border-gray-200 bg-white text-gray-700",
        success:
          "border-transparent bg-[#b9f9cf] text-[#11843c]",
        warning:
          "border-transparent bg-[#ffefcf] text-[#ab570a]",
        danger:
          "border-transparent bg-[#f7d4d6] text-[#c50000]",
        info:
          "border-transparent bg-[#d3e5ff] text-[#0761d1]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
