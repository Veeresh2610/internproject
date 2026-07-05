import { AlertCircle } from "lucide-react";
import React, { forwardRef } from "react";

interface NumberInputProps {
  name?: string;
  label?: string;
  error?: any;
  disabled?: boolean;
  required?: boolean;
  value?: number;
  onChange?: (value: number | string) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  helpText?: string;
  placeholder?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  min?: number;
  max?: number;
  ref?: React.Ref<HTMLInputElement>;
  props?: React.InputHTMLAttributes<HTMLInputElement>;
}

// Use forwardRef to forward refs to the input element
const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ name, label, error, required, value, disabled = false, onChange, onBlur, helpText, props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (value === "") {
        onChange?.(""); // or simply don't call onChange
      } else {
        onChange?.(Number(value));
      }
    };

    return (
      <div className=' w-full'>
        {label && (
          <label htmlFor={name} className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
            {label}
            {required && <span className='text-red-500 ml-1'>*</span>}
          </label>
        )}

        <input
          {...props}
          type='number'
          id={name}
          name={name}
          required={required}
          disabled={disabled}
          value={value ? value : ""}
          onChange={handleChange}
          onBlur={onBlur}
          autoFocus={false}
          autoComplete='off'
          ref={ref} // Attach the ref here
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
        
              ${
                error
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
              }
              ${disabled ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed" : "bg-white dark:bg-gray-800"}
              text-gray-900 dark:text-gray-100
              sm:text-sm
            `}
        />
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

// Set a display name for easier debugging
NumberInput.displayName = "NumberInput";

export default NumberInput;
