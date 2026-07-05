import { AlertCircle } from "lucide-react";
import React from "react";

interface TextAreaProps {
  name?: string;
  label?: string;
  error?: any;
  required?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  helpText?: string;
  disabled?: boolean;
}

const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>((
  {
    name,
    label,
    error,
    required,
    value,
    onChange,
    onBlur,
    helpText,
    disabled,
  },
  ref
) => {
  return (
    <div className=' w-full'>
      {label && (
        <label htmlFor={name} className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
          {label}
          {required && <span className='text-red-500 ml-1'>*</span>}
        </label>
      )}

      <textarea
        id={name}
        name={name}
        ref={ref}
        required={required}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        autoFocus={false}
        autoComplete='off'
        rows={3}
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
              ${error
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
});

export default TextArea;
