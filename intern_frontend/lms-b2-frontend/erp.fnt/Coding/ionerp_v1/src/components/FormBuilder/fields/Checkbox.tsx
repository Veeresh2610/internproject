import { AlertCircle } from "lucide-react";
import React from "react";

interface CheckboxProps {
  name?: string;
  label?: string;
  error?: any;
  required?: boolean;
  checked?: boolean;
  disabled?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  helpText?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>((
  {
    name,
    label,
    error,
    required,
    checked,
    onChange,
    disabled,
    onBlur,
    helpText,
  },
  ref
) => {
  return (
    <div className=" w-full">
      <label className="inline-flex items-center">
        <input
          type="checkbox"
          name={name}
          ref={ref}
          required={required}
          disabled={disabled}
          checked={checked}
          value={checked ? "true" : "false"}
          onChange={onChange}
          onBlur={onBlur}
          className={`form-checkbox h-4 w-4  px-3 
              py-2 
              border 
              rounded-md 
              shadow-sm 
              focus:outline-none 
              focus:ring-2 
              transition 
              duration-300  ${error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'}
              ${disabled
              ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed'
              : 'bg-white dark:bg-gray-800'}
              text-gray-900 dark:text-gray-100
              sm:text-sm
            `}
        />
        <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
      </label>
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
});

export default Checkbox;