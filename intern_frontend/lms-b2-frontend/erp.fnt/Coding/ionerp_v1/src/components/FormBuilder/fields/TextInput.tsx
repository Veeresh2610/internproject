import React, { forwardRef, useState } from "react";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

export interface TextInputProps {
  name?: string;
  label?: string;
  error?: { message?: string };
  type?: "text" | "password" | "email" | "number" | "tel" | "phone" | "year";
  value?: string | number;
  disabled?: boolean;
  min?: number;
  max?: number;
  required?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  placeholder?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  helpText?: string;
  ref?: React.Ref<HTMLInputElement>;
  props?: React.InputHTMLAttributes<HTMLInputElement>;
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      name,
      label,
      type = "text",
      error,
      value,
      disabled = false,
      min,
      max,
      required,
      onChange,
      onBlur,
      placeholder,
      leftIcon,
      rightIcon,
      helpText,
      props,
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    const getInputType = () => {
      if (type === "password") {
        return showPassword ? "text" : "password";
      }
      return type === "phone" ? "tel" : type;
    };

    const renderPasswordToggle = () => {
      if (type !== "password") return null;

      const ToggleIcon = showPassword ? EyeOff : Eye;
      return (
        <button
          type='button'
          onClick={() => setShowPassword(!showPassword)}
          className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          <ToggleIcon size={20} />
        </button>
      );
    };

    return (
      <div className=' w-full'>
        {label && (
          <label htmlFor={name} className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
            {label}
            {required && <span className='text-red-500 ml-1'>*</span>}
          </label>
        )}

        <div className='relative'>
          {leftIcon && (
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              {leftIcon}
            </div>
          )}

          <input
            {...props}
            id={name}
            name={name}
            ref={ref}
            type={getInputType()}
            value={value ?? ""}
            disabled={disabled}
            required={required}
            min={min}
            max={max}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            autoFocus={false}
            autoComplete='off'
            className={`
              w-full 
              px-3 
              py-2 
              border 
              rounded-md 
              shadow-sm 
              focus:outline-none 
              focus:ring-2 
              transition 
              duration-300
              ${leftIcon ? "pl-10" : ""}
              ${type === "password" ? "pr-10" : ""}
              ${error
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
              }
              ${disabled ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed" : "bg-white dark:bg-gray-800"}
              text-gray-900 dark:text-gray-100
              sm:text-sm
            `}
          />

          {renderPasswordToggle()}
        </div>

        {(helpText || error) && (
          <div className='font-small text-sm'>
            {helpText && !error && <p className='text-gray-500 dark:text-gray-400'>{helpText}</p>}
            {error && (
              <p className='text-red-600 flex items-center'>
                <AlertCircle size={16} className='mr-1' /> {error.message}
              </p>
            )}
          </div>
        )}
      </div>
    );
  },
);

export default TextInput;
