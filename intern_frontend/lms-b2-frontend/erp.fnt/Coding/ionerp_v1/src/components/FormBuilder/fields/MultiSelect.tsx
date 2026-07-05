import { AlertCircle } from "lucide-react";
import React, { forwardRef } from "react";
import Select, { MultiValue, ActionMeta, SingleValue } from "react-select";
import { useTheme } from "../../../contexts/ThemeContext";

interface Option {
  label: string;
  value: string;
}
interface MultiSelectProps {
  name?: string;
  label?: string;
  options: Option[];
  error?: any;
  required?: boolean;
  isMulti?: boolean;
  disabled?: boolean;
  value?: string[];
  onChange?: (value: string[] | string) => void;
  onBlur?: () => void;
  helpText?: string;
  placeholder?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  min?: number;
  max?: number;
  ref?: React.Ref<HTMLInputElement>;
  props?: React.InputHTMLAttributes<HTMLInputElement>;
}

const MultiSelect = forwardRef<any, MultiSelectProps>(
  (
    {
      name,
      label,
      options,
      error,
      required,
      disabled = false,
      isMulti = true,
      value,
      onChange,
      onBlur,
      helpText,
      placeholder,
      leftIcon,
      rightIcon,
      min,
      max,
      props,
    },
    ref,
  ) => {
    const { theme } = useTheme();
    const handleChange = (
      newValue: SingleValue<Option | any> | MultiValue<Option>,
      actionMeta: ActionMeta<Option>,
    ) => {
      if (onChange) {
        if (Array.isArray(newValue)) {
          const selectedValues = newValue.map((option) => option.value);
          onChange(selectedValues);
        } else if (!Array.isArray(newValue) && newValue) {
          onChange(newValue.value);
        } else {
          onChange([]);
        }
      }
    };

    // console.log(value)
    const selectedValues = Array.isArray(value) ? value : value ? [value] : [];
    return (
      <div className=' w-full react-select-box'>
        {label && (
          <label htmlFor={name} className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
            {label}
            {required && <span className='text-red-500 ml-1'>*</span>}
          </label>
        )}
        <Select
          ref={ref}
          isMulti={isMulti}
          name={name}
          options={options}
          isDisabled={disabled}
          value={options.filter((option) => selectedValues.includes(option.value))} // Use selectedValues
          onChange={handleChange}
          onBlur={onBlur}
          autoFocus={false}
          // className="react-select-container"
          className={`
                react-select-container
                w-full
                border
                rounded-md
                shadow-sm
                focus:outline-none
                focus:ring-2
                transition
                duration-300
                ${error ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}
                ${
                  disabled ? "bg-gray-100 cursor-not-allowed" : theme === "light" ? "bg-white" : "bg-gray-800"
                }
                text-gray-900 ${theme === "dark" ? "dark:text-gray-100" : "text-gray-900"}
                sm:text-sm
            `}
          classNamePrefix='react-select'
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

MultiSelect.displayName = "MultiSelect";

export default MultiSelect;
