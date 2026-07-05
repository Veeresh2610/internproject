import { AlertCircle } from "lucide-react";
import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface TimePickerComponentProps {
  name?: string;
  label?: string;
  error?: any;
  disabled?: boolean;
  required?: boolean;
  value?: Date;
  onChange?: (date: Date | null) => void;
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

const TimePickerComponent: React.FC<TimePickerComponentProps> = ({
  name,
  label,
  error,
  required,
  value,
  disabled = false,
  onChange,
  onBlur,
  helpText,
  props,
}) => {
  return (
    <div className=" w-full">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <DatePicker
        id={name}
        name={name}
        selected={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        showTimeSelect
        showTimeSelectOnly
        timeIntervals={15}
        autoFocus={false}
        autoComplete='off'
        timeCaption="Time"
        dateFormat="h:mm aa"
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
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'}
              ${disabled
            ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed'
            : 'bg-white dark:bg-gray-800'}
              text-gray-900 dark:text-gray-100
              sm:text-sm
            `}
      />
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
};

export default TimePickerComponent;