import React, { forwardRef, useState } from "react";

// Define a custom validation for file types
const fileValidation = (file: File) => {
  const validTypes = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // Excel
    "text/csv", // CSV
  ];

  const validExtensions = [".png", ".jpeg", ".jpg"];

  // Check MIME type first for Excel and CSV
  if (validTypes.includes(file.type)) {
    return true;
  }

  // Check extension for images (png, jpeg, jpg)
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (validExtensions.includes(`.${extension}`)) {
    return true;
  }

  return false; // Invalid file type
};

interface FileUploadComponentProps {
  name?: string;
  label?: string;
  error?: any;
  accept?: string;
  disabled?: boolean;
  required?: boolean;
  onFileAccepted?: (file: File) => void; // Callback to handle accepted file
  onChange?: (file: File) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

const FileUploadComponent = forwardRef<
  HTMLInputElement,
  FileUploadComponentProps
>(
  (
    {
      name,
      label,
      error,
      accept = ".csv,.png,.jpeg,.jpg,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      disabled = false,
      required = false,
      onFileAccepted,
      onChange,
      onBlur,
    },
    ref
  ) => {
    const [preview, setPreview] = useState<string | null>(null); // State for image preview

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        // Validate the file type
        if (!fileValidation(file)) {
          console.error(
            "Invalid file type. Please upload a CSV, Excel, or image file."
          );
          return;
        }

        // Handle image preview for images
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onloadend = () => setPreview(reader.result as string); // Set preview when file is loaded
          reader.readAsDataURL(file);
        }

        onFileAccepted?.(file);
        onChange?.(file);
      }
    };

    return (
      <div className="space-y-1">
        {label && (
          <label
            htmlFor={name}
            className="block text-sm font-medium text-gray-700"
          >
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <input
          id={name}
          name={name}
          type="file"
          accept={accept}
          disabled={disabled}
          required={required}
          ref={ref}
          onChange={handleFileChange}
          onBlur={onBlur}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
        {preview && (
          <div className="mt-2">
            <img src={preview} alt="Preview" className="max-w-full h-auto" />
          </div>
        )}
        {error && <p className="text-sm text-red-600">{error.message}</p>}
      </div>
    );
  }
);

export default FileUploadComponent;
