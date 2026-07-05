// ./fields/YearPicker.tsx
import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FieldError } from "react-hook-form";

interface YearPickerProps {
  name: string;
  label: string;
  value?: number | null;              // 🔹 store YEAR as number
  onChange?: (value: number | null) => void; // 🔹 emit YEAR as number
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: FieldError;
}

const YearPicker = React.forwardRef<any, YearPickerProps>(({
  name,
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  disabled,
  required,
  error,
}, ref) => {
  // react-datepicker needs a Date for `selected`
  const selectedDate = value ? new Date(value, 0, 1) : null;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={name} className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}

      <DatePicker
        id={name}
        ref={ref}
        selected={selectedDate}
        onChange={(date) => {
          const year = date ? (date as Date).getFullYear() : null;
          onChange?.(year); // 🔥 send only the year (e.g. 2013)
        }}
        onBlur={onBlur}
        showYearPicker
        dateFormat="yyyy"
        placeholderText={placeholder || "Select year"}
        disabled={disabled}
        className={`w-full border rounded px-2 py-1 text-sm outline-none ${error ? "border-red-500" : "border-gray-300"
          }`}
      />

      {error && (
        <span className="text-xs text-red-500 mt-0.5">{error.message}</span>
      )}
    </div>
  );
});

export default YearPicker;
