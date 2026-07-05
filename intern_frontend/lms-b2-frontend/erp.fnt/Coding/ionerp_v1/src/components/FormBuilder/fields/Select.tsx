import React, { forwardRef } from "react";
import { ChevronDown, AlertCircle } from "lucide-react";

export interface SelectProps {
  name?: string;
  label: string;
  options: { label: string; value: string | number }[];
  error?: { message?: string };
  required?: boolean;
  disabled?: boolean;
  value?: string | number;
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLSelectElement>) => void;
  placeholder?: string;
  leftIcon?: React.ReactNode;
  helpText?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      name,
      label,
      options,
      error,
      required,
      disabled = false,
      value,
      onChange,
      onBlur,
      placeholder,
      leftIcon,
      helpText,
    },
    ref
  ) => {
    return (
      <div className=" w-full">
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>

        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {leftIcon}
            </div>
          )}

          <select
            id={name}
            name={name}
            ref={ref}
            required={required}
            disabled={disabled}
            value={value ?? ""}
            onChange={onChange}
            onBlur={onBlur}
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
              appearance-none
              ${leftIcon ? 'pl-10' : ''}
              ${error
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'}
              ${disabled
                ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed'
                : 'bg-white dark:bg-gray-800'}
              text-gray-900 dark:text-gray-100
              sm:text-sm
            `}
          >
            {placeholder && (
              // <option key="placeholder" value="" disabled>
              <option key="placeholder" value="" >
                {placeholder}
              </option>
            )}
            {options.map((option, index) => (
              <option
                key={`option.label` + index}
                value={option.value}
                className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                {option.label}
              </option>
            ))}
          </select>

          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <ChevronDown
              size={20}
              className="text-gray-400 dark:text-gray-500"
            />
          </div>
        </div>

        {(helpText || error) && (
          <div className="font-small text-sm">
            {helpText && !error && (
              <p className="text-gray-500 dark:text-gray-400">{helpText}</p>
            )}
            {error && (
              <p className="text-red-600 flex items-center">
                <AlertCircle size={16} className="mr-1" /> {error.message}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

export default Select;
