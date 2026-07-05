import React, { useEffect, useRef } from "react";
import {
  useForm,
  Controller,
  FieldError,
  RefCallBack,
  useWatch,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ZodSchema } from "zod";
import TextInput from "./fields/TextInput";
import Select from "./fields/Select";
import Checkbox from "./fields/Checkbox";
import MultiSelect from "./fields/MultiSelect";
import NumberInput from "./fields/NumberInput";
import SingleDatePicker from "./fields/SingleDatePicker";
import DateRangePicker from "./fields/DateRangePicker";
import RadioButton from "./fields/RadioGroup";
import ToggleSwitch from "./fields/Switch";
import TextArea from "./fields/Textarea";
import TimePickerComponent from "./fields/TimeInput";
import UIButton from "./fields/Button";
import FileUploadComponent from "./fields/FileUpload";
import { QRCodeCanvas } from "qrcode.react";
import ImageDisplay from "./fields/ImageDisplay";
import YearPicker from "./fields/YearPicker";

export interface Field {
  type:
    | "text"
    | "password"
    | "phone"
    | "email"
    | "select"
    | "checkbox"
    | "multiselect"
    | "number"
    | "radio"
    | "singledate"
    | "daterange"
    | "switch"
    | "textarea"
    | "time"
    | "qrcode"
    | "image"
    | "year"
    | string;
  name: string;
  label: string;
  value?: any;
  required?: boolean;
  placeholder?: string;
  min?: any;
  disabled?: boolean;
  max?: any;
  isMulti?: boolean;
  options?: { label: string; value: string | number }[] | string[];
  loadOptions?: (
    dependencyValue: any
  ) => Promise<{ label: string; value: string | number }[]>;
  dependsOn?: string;
  onSelect?: (value: any) => void;
  onChange?: (value: any) => void;
  onBlur?: () => void;
}

export interface FieldGroup {
  group: string;
  fields: Field[];
}

interface DynamicFormProps {
  submitbuttonposition?: "end" | "start";
  fields: FieldGroup[];
  schema: ZodSchema;
  onSubmit: (data: any) => void;
  onClose?: () => void;
  loading?: boolean;
  submitbuttonName: string;
  closebuttonName?: string;
  resetbuttonName?: string;
  innerFormButtonModel?: () => void;
  columnLayout?: 1 | 2 | 3 | 4;
  initialValues?: Record<string, any>;
  onValidDataChange?: (fieldName: string, fieldValue: any) => void;
  children?: React.ReactNode;
  onReset?: () => void;
}

const DynamicFormBuilder = ({
  fields,
  schema,
  onSubmit,
  onClose,
  loading,
  submitbuttonName,
  closebuttonName,
  resetbuttonName,
  innerFormButtonModel,
  columnLayout = 1,
  initialValues = {},
  onValidDataChange,
  children,
  submitbuttonposition,
  onReset,
}: DynamicFormProps) => {
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: initialValues,
  });

  const initialValuesRef = useRef(initialValues);

  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      // Check if initialValues have changed by comparing references
      const hasChanged = !Object.keys(initialValues).every(
        (key) => initialValues[key] === initialValuesRef.current[key]
      );
      // console.log("Setting initial values: 0", initialValues, hasChanged);
      if (hasChanged) {
        // console.log("Setting initial values: 1", initialValues);
        reset(initialValues);
        initialValuesRef.current = initialValues;
      }
    }
    // console.log("----------, initialValues");
  }, [initialValues, reset]);

  const [optionsState, setOptionsState] = React.useState<
    Record<string, { label: string; value: string | number }[]>
  >({});
  // const [optionsLoaded, setOptionsLoaded] = React.useState<{ [key: string]: boolean }>({}); // {{ edit_1 }}

  // console.log("errors", errors);
  // Get all dependency field names
  const dependencyFieldNames = Array.from(
    new Set(
      fields
        .flatMap((group) => group.fields)
        .filter((field) => field.type === "select" && field.dependsOn)
        .map((field) => field.dependsOn)
        .filter((dependsOn): dependsOn is string => dependsOn !== undefined)
    )
  );

  const dependencyValuesArray = useWatch({
    control,
    name: dependencyFieldNames,
  });

  // Map dependency field names to their values
  const dependencyMap = dependencyFieldNames.reduce((acc, name, index) => {
    acc[name] = dependencyValuesArray[index];
    return acc;
  }, {} as { [key: string]: any });

  React.useEffect(() => {
    fields.forEach((group) => {
      group.fields.forEach((field) => {
        if (field.type === "select" || field.type === "multiselect") {
          const dependencyValue = dependencyMap[field.dependsOn || ""];

          // Check if options have already been loaded for this field
          if (field.dependsOn && dependencyValue && field.loadOptions) {
            // Always load options if editing
            field
              .loadOptions(dependencyValue)
              .then((options) => {
                setOptionsState((prev) => ({ ...prev, [field.name]: options }));
                // setOptionsLoaded((prev) => ({ ...prev, [field.name]: true })); // Mark as loaded
              })
              .catch((error) => {
                // console.error(`Error loading options for ${field.name}:`, error);
                setOptionsState((prev) => ({ ...prev, [field.name]: [] }));
              });
          }
        }
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(dependencyMap), fields]); // Removed optionsLoaded from dependencies

  React.useEffect(() => {
    fields.forEach((group) => {
      group.fields.forEach((field) => {
        if (field.type === "select" || field.type === "multiselect") {
          // Check if options have already been loaded for this field
          if (!field.dependsOn && field.loadOptions) {
            // Always load options if editing
            field
              .loadOptions(null)
              .then((options) => {
                setOptionsState((prev) => ({ ...prev, [field.name]: options }));
                // setOptionsLoaded((prev) => ({ ...prev, [field.name]: true })); // Mark as loaded
              })
              .catch((error) => {
                // console.error(`Error loading options for ${field.name}:`, error);
                setOptionsState((prev) => ({ ...prev, [field.name]: [] }));
              });
          } else {
            // setOptionsLoaded((prev) => ({ ...prev, [field.name]: true }));
            setValue(field.name, ""); // Reset the current field value when dependency changes
            // Reset fields dependent on this field dynamically
            // group.fields
            //   .filter((dependentField: any) => dependentField?.dependsOn === field.name)
            //   .forEach((dependentField) => {
            //     resetField(dependentField.name);
            //     setValue(dependentField.name, null);
            //     setOptionsState((prev) => ({ ...prev, [dependentField.name]: [] }));
            //   });
          }
        }
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields]); // Removed optionsLoaded from dependencies

  const watchedFields = useWatch({
    control,
  });

  React.useEffect(() => {
    if (onValidDataChange) {
      onValidDataChange(JSON.stringify(watchedFields), null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedFields]);

  const renderField = (field: Field & { ref?: RefCallBack }) => {
    const error = errors[field.name] as FieldError | undefined;

    const commonProps = {
      name: field.name,
      label: field.label,
      value: field.value,
      error,
      min: field.min,
      max: field.max,
      checked: field.value,
      disabled: field.disabled,
      required: field.required,
      placeholder: field.placeholder,
      isMulti: field.isMulti,
      onChange: field.onChange,
      onBlur: field.onBlur,
      ref: field.ref,
    };
    const options = optionsState[field.name] || field.options || [];
    switch (field.type) {
      case "text":
      case "password":
      case "phone":
      case "email":
        return <TextInput {...commonProps} type={field.type} />;
      case "year":
        return <YearPicker {...commonProps}  value={commonProps.value}  />;
      case "select":
        return (
          <Select
            {...commonProps}
            options={options as { label: string; value: string }[]}
          />
        );
      case "checkbox":
        return <Checkbox {...commonProps} />;
      case "multiselect":
        return (
          <MultiSelect
            {...commonProps}
            options={options as { label: string; value: string }[]}
          />
        );
      case "number":
        return <NumberInput {...commonProps} />;
      case "radio":
        return (
          <RadioButton
            {...commonProps}
            options={field.options as { label: string; value: string }[]}
          />
        );
      case "singledate":
        return <SingleDatePicker {...commonProps} />;
      case "daterange":
        return <DateRangePicker {...commonProps} />;
      case "switch":
        return <ToggleSwitch {...commonProps} />;
      case "textarea":
        return <TextArea {...commonProps} />;
      case "time":
        return <TimePickerComponent {...commonProps} />;
      case "file":
        return <FileUploadComponent {...commonProps} />;
      case "qrcode":
        return (
          <div>
            <label>{field.label}</label>
            <QRCodeCanvas value={field.value || "No Data"} size={300} />
            <label>{field.placeholder || "No UPI ID provided"}</label>
          </div>
        );
      case "displayImage":
        return <ImageDisplay {...commonProps} />;
      case "button":
        return (
          <div className="max-w-fit">
            <UIButton
              size={"sm"}
              {...commonProps}
              onClick={innerFormButtonModel}
            >
              {field.label}{" "}
            </UIButton>
          </div>
        );
      default:
        return <TextInput {...commonProps} type="text" />;
    }
  };

  const columnClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  }[columnLayout];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      {fields.map((group, groupIndex) => (
        <div key={`${group.group}-${groupIndex}`} className="space-y-4">
          {group.group && (
            <h3 className="font-semibold text-lg">{group.group}</h3>
          )}
          <div className={`grid ${columnClass} gap-4`}>
            {group.fields.map((field, fieldIndex) => (
              <Controller
                key={`${field.name}-${fieldIndex}`}
                name={field.name}
                control={control}
                render={({ field: { onChange, onBlur, value, ref } }) =>
                  renderField({
                    ...field,
                    onChange: (val) => {
                      onChange(val);
                      field.onChange?.(val);
                    },
                    onBlur: () => {
                      onBlur();
                      field.onBlur?.();
                    },
                    value,
                    ref,
                  })
                }
              />
            ))}
          </div>
        </div>
      ))}

      {children && <div>{children}</div>}

      <div className={`flex justify-{${submitbuttonposition}} space-x-2`}>
        {submitbuttonName && (
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 button-bg text-sm text-white rounded hover:pannel-bg-1 focus:outline-none "
          >
            {loading ? "Loading..." : submitbuttonName}
          </button>
        )}
        {resetbuttonName && (
          <button
            type="reset"
            onClick={() => {
              onReset?.();
              reset();
            }}
            className="px-4 py-2 bg-yellow-600 text-sm text-white rounded hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
          >
            {resetbuttonName}
          </button>
        )}
        {closebuttonName && (
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-red-600 text-sm text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            {closebuttonName}
          </button>
        )}
      </div>
    </form>
  );
};

export default DynamicFormBuilder;
