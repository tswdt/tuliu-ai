import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variants = {
      default:
        "bg-[#1d1d1f] text-white hover:bg-[#333] shadow-sm",
      destructive:
        "bg-red-600 text-white hover:bg-red-700 shadow-sm",
      outline:
        "border border-[#e5e5e5] bg-white hover:bg-[#f5f5f7] hover:text-[#1d1d1f] text-[#666]",
      secondary:
        "bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#eee]",
      ghost: "hover:bg-[#f5f5f7] hover:text-[#1d1d1f]",
      link: "text-[#1d1d1f] underline-offset-4 hover:underline",
    };

    const sizes = {
      default: "h-10 px-4 py-2 rounded-xl",
      sm: "h-8 rounded-lg px-3 text-xs",
      lg: "h-11 rounded-xl px-8",
      icon: "h-10 w-10",
    };

    return (
      <button
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
