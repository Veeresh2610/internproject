import React from "react";

interface ButtonProps {
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  isLoading?: boolean;
  isDisabled?: boolean;
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
  [key: string]: any;
}

const UIButton: React.FC<ButtonProps> = ({
  type = "button",
  onClick,
  isLoading = false,
  isDisabled = false,
  children,
  className = "",
  size = "md",
  ...props
}) => {
  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      {...props}
      disabled={isLoading || isDisabled}
      className={`mr-1 rounded-md shadow px-4 py-2 text-sm font-medium button-bg dark:button-bg text-white  focus:outline-none focus:ring-2 focus:ring-ring-light dark:focus:ring-ring-dark
        ${isDisabled || isLoading ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed" : ""}
        ${sizeClasses[size]} ${className}`}
    >
      {isLoading ? "Loading..." : children}
    </button>
  );
};

export default UIButton;
