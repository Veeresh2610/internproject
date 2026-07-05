import { AlertCircle } from "lucide-react";
import moment from "moment-timezone"; // ✅ Import moment-timezone
import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface SingleDatePickerProps {
  name?: string;
  label?: string;
  error?: any;
  min?: any;
  max?: any;
  required?: boolean;
  disabled?: boolean;
  value?: Date | null;
  onChange?: (date: Date | null) => void; // ✅ Ensure string format for API
  onBlur?: () => void;
  helpText?: string;
  props?: React.InputHTMLAttributes<HTMLInputElement>;
  timezone?: string; // ✅ Add timezone prop
}

const SingleDatePicker = React.forwardRef<any, SingleDatePickerProps>(({
  name,
  label,
  error,
  required,
  disabled,
  value,
  min,
  max,
  onChange,
  onBlur,
  helpText,
  timezone = "UTC",
  ...props
}, ref) => {
  const handleDateChange = (date: Date | null) => {
    if (onChange && date) {
      // ✅ Convert the selected date to the provided timezone
      const localizedDate = moment.tz(moment(date).format("YYYY-MM-DD"), timezone).toDate();
      onChange(localizedDate);
    }
  };

  return (
    <div className='w-full'>
      {label && (
        <label htmlFor={name} className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
          {label}
          {required && <span className='text-red-500 ml-1'>*</span>}
        </label>
      )}
      <DatePicker
        {...props}
        id={name}
        name={name}
        ref={ref}
        selected={value}
        showYearDropdown={true}
        dateFormat='dd/MM/yyyy'
        disabled={disabled}
        autoFocus={false}
        autoComplete='off'
        onChange={handleDateChange}
        minDate={min ?? null}
        maxDate={max ?? null}
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

export default SingleDatePicker;
