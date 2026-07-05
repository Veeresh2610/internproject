import { AlertCircle } from "lucide-react";
import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment-timezone"; // ✅ Import moment-timezone

interface DateRangePickerProps {
  name?: string;
  label?: string;
  error?: any;
  min?: any;
  required?: boolean;
  value?: [Date | null, Date | null];
  onChange?: (dates: [Date | null, Date | null]) => void;
  onBlur?: () => void;
  helpText?: string;
  props?: React.InputHTMLAttributes<HTMLInputElement>;
  disabled?: boolean;
  timezone?: string; // ✅ Add timezone support
}

const DateRangePicker = React.forwardRef<DatePicker, DateRangePickerProps>(
  (
    {
      name,
      label,
      error,
      min,
      required,
      value,
      onChange,
      onBlur,
      helpText,
      props,
      disabled,
      timezone = "UTC",
    },
    ref,
  ) => {
    const [startDate, endDate] = value || [null, null];

    const handleChange = (dates: [Date | null, Date | null]) => {
      if (dates) {
        const formattedDates: [Date | null, Date | null] = [
          dates[0] ? moment.tz(dates[0], timezone).toDate() : null, // ✅ Convert startDate to timezone
          dates[1] ? moment.tz(dates[1], timezone).toDate() : null, // ✅ Convert endDate to timezone
        ];
        onChange?.(formattedDates);
      }
    };

    return (
      <div className='w-full relative'>
        {label && (
          <label htmlFor={name} className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
            {label}
            {required && <span className='text-red-500 ml-1'>*</span>}
          </label>
        )}
        <DatePicker
          selectsRange={true}
          startDate={startDate || undefined}
          endDate={endDate || undefined}
          minDate={min || undefined}
          onChange={handleChange}
          onBlur={onBlur}
          monthsShown={2}
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
              ${
                error
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
              }
              ${disabled ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed" : "bg-white dark:bg-gray-800"}
              text-gray-900 dark:text-gray-100
              sm:text-sm
            `}
          dateFormat='dd/MM/yyyy' // ✅ Display format
          placeholderText='DD/MM/YYYY - DD/MM/YYYY'
          isClearable={true}
          showYearDropdown={true}
          showPopperArrow={false}
          required={required}
          id={name}
          name={name}
          ref={ref} // Properly pass the ref for DatePicker
          popperClassName='!z-[1050]' // Ensure high z-index
          portalId='root-portal' // Render outside the modal
        />
        {(helpText || error) && (
          <div className='font-small  text-sm'>
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

DateRangePicker.displayName = "DateRangePicker"; // Add a displayName for better debugging

export default DateRangePicker;
