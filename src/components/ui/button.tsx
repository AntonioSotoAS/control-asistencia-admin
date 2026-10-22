import React from "react";
import { cn } from "@/shared/utils/cn";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]";

    const sizeStyles = {
      sm: "text-xs px-3 py-1.5 rounded-[14px] gap-1.5",
      md: "text-sm px-4 py-2.5 rounded-field gap-2",
      lg: "text-base px-6 py-3 rounded-field gap-2.5",
    };

    const variantStyles = {
      primary:
        "bg-guinda text-white hover:bg-[#6a0000] shadow-sm hover:shadow active:bg-[#550000]",
      secondary:
        "bg-olivo text-white hover:bg-[#5d594b] shadow-sm active:bg-[#4d4a3e]",
      outline:
        "border border-linea bg-white text-carbon hover:bg-suave hover:border-carbon/20",
      ghost:
        "text-carbon hover:bg-suave hover:text-guinda",
      danger:
        "bg-red-700 text-white hover:bg-red-800 shadow-sm",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          sizeStyles[size],
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";
