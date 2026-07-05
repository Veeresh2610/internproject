/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { z, ZodTypeAny } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Select from "react-select";
// import TextInput from "./fields/TextInput";
// import { useTheme } from "../../contexts/ThemeContext";

export type OptionType = {
  value: any;
  label: string;
};

export type FieldType =
  | {
      type: "select";
      name: string;
      label: string;
      placeholder?: string;
      options?: OptionType[] | [];
      loadOptions?: (dependencyValue?: string) => Promise<OptionType[]>;
      isMulti?: boolean;
      isSearchable?: boolean;
      validation?: ZodTypeAny;
      dependsOn?: string;
      onChange?: (value: any) => void;
      hidden?: boolean;
    }
  | {
      type: "text";
      name: string;
      label: string;
      placeholder?: string;
      validation?: ZodTypeAny;
      hidden?: boolean;
    };

type ReusableFormProps = {
  fields: FieldType[];
  layoutSize?: string;
  onSubmit: (data: any) => void;
  initialValues?: Record<string, any>;
  onValidDataChange?: (fieldValue: any) => void;
};

const generateValidationSchema = (fields: FieldType[]) => {
  const schemaShape: any = {};

  fields.forEach((field) => {
    if (field.validation) {
      schemaShape[field.name] = field.validation;
    } else {
      switch (field.type) {
        case "text":
          schemaShape[field.name] = z.string().nonempty(`${field.label} is required`);
          break;
        case "select":
          schemaShape[field.name] = z
            .object({
              value: z.string(),
              label: z.string(),
            })
            .nullable()
            .refine((val) => val !== null, {
              message: `${field.label} is required`,
            });
          break;
        default:
          break;
      }
    }
  });

  return z.object(schemaShape);
};

const FilterReusableForm: React.FC<ReusableFormProps> = ({
  fields,
  onSubmit,
  layoutSize = 4,
  initialValues = {},
  onValidDataChange,
}) => {
  const validationSchema = generateValidationSchema(fields);
  const [loadingState, setLoadingState] = React.useState<Record<string, boolean>>({});
  const {
    control,
    handleSubmit,
    setValue,
    resetField,
    reset,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: initialValues,
  });

  const initialValuesRef = useRef(initialValues);

  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      const hasChanged = !Object.keys(initialValues).every(
        (key) => initialValues[key] === initialValuesRef.current[key],
      );
      if (hasChanged) {
        reset(initialValues);
        initialValuesRef.current = initialValues;
      }
    }
  }, [initialValues, reset]);

  const [optionsState, setOptionsState] = React.useState<{ [key: string]: OptionType[] }>({});

  const dependencyFieldNames = Array.from(
    new Set(
      fields
        .filter((field) => field.type === "select" && field.dependsOn)
        .map((field) => ("dependsOn" in field ? field.dependsOn : undefined))
        .filter((dependsOn): dependsOn is string => dependsOn !== undefined),
    ),
  );

  const dependencyValuesArray = useWatch({
    control,
    name: dependencyFieldNames,
  });

  const dependencyMap = dependencyFieldNames.reduce((acc, name, index) => {
    acc[name] = dependencyValuesArray[index];
    return acc;
  }, {} as { [key: string]: any });

  useEffect(() => {
    fields.forEach((field) => {
      if (field.type === "select" && field.dependsOn) {
        const dependencyValue = dependencyMap[field.dependsOn];

        if (dependencyValue && dependencyValue !== "") {
          if (!optionsState[field.name] || optionsState[field.name].length === 0) {
            setLoadingState((prev) => ({ ...prev, [field.name]: true }));
            setTimeout(() => {
              field
                .loadOptions?.(dependencyValue.value)
                .then((options) => {
                  setOptionsState((prev) => ({ ...prev, [field.name]: options }));
                })
                .catch((error) => {
                  console.error(`Error loading options for ${field.name}:`, error);
                  setOptionsState((prev) => ({ ...prev, [field.name]: [] }));
                })
                .finally(() => setLoadingState((prev) => ({ ...prev, [field.name]: false })));
            }, 300);
          }
        } else {
          setOptionsState((prev) => ({ ...prev, [field.name]: [] }));
          setValue(field.name, null);
          resetField(field.name);
        }
      }
    });

    // **Fix: Only reset fields if hidden, without triggering infinite re-render**
    if (fields.some((field) => field.hidden)) {
      fields.forEach((field) => {
        if (field.hidden) {
          resetField(field.name);
          setValue(field.name, null);
          setOptionsState((prev) => ({ ...prev, [field.name]: [] }));
        }
      });
    }
  }, [JSON.stringify(dependencyMap), JSON.stringify(fields)]);

  useEffect(() => {
    fields.forEach(async (field) => {
      if (field.type === "select" && field.loadOptions && !field.dependsOn) {
        if (!optionsState[field.name] || optionsState[field.name].length === 0) {
          setLoadingState((prev) => ({ ...prev, [field.name]: true }));
          const options = await field.loadOptions();
          setOptionsState((prev) => ({ ...prev, [field.name]: options }));
          setLoadingState((prev) => ({ ...prev, [field.name]: false }));
        }
      }
    });
  }, [fields]);

  const watchedFields = useWatch({ control });

  React.useEffect(() => {
    if (onValidDataChange) {
      onValidDataChange(JSON.stringify(watchedFields));
    }
  }, [watchedFields]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={`grid gap-4 lg:grid-cols-${layoutSize} grid-cols-1 mb-6 bg-white dark:bg-background-dark text-text-light dark:text-text-dark border border-gray-200 dark:border-gray-700 rounded-md p-4`}
    >
      {fields.map((field) => {
        if (field.hidden) return null;
        return (
          <div key={field.name} className='space-y-1 relative group'>
            <label className='block text-sm font-medium text-text-light dark:text-text-dark'>
              {field.label}
            </label>
            <Controller
              control={control}
              name={field.name}
              render={({ field: controllerField }) => (
                <Select
                  {...controllerField}
                  options={[
                    { label: "Please select an option", value: "" },
                    ...(optionsState[field.name] || []),
                  ]}
                  isLoading={loadingState[field.name]}
                  value={controllerField.value}
                  isClearable
                  isMulti={field.type === "select" ? field.isMulti : undefined}
                  isSearchable={field.type === "select" ? field.isSearchable : undefined}
                  placeholder={field.placeholder}
                  onChange={(value) => {
                    controllerField.onChange(value);

                    // reset only dependsOn field

                    const dependentFields = fields.filter(
                      (f) => f.type === "select" && f.dependsOn === field.name,
                    );

                    dependentFields.forEach((dependentField) => {
                      resetField(dependentField.name);
                      setValue(dependentField.name, null);
                      setOptionsState((prev) => ({ ...prev, [dependentField.name]: [] }));
                    });

                    if (onValidDataChange) {
                      onValidDataChange(JSON.stringify(getValues()));
                    }
                  }}
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      backgroundColor: state.isFocused ? "#fff" : "#f9fafb",
                      borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
                      boxShadow: state.isFocused ? "0 0 0 2px rgba(59, 130, 246, 0.5)" : "none",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        borderColor: state.isFocused ? "#2563eb" : "#94a3b8",
                      },
                      borderRadius: "6px",
                      minHeight: "26px", // Reduced height for a smaller dropdown
                      fontSize: "13px", // Smaller font for a sleek UI
                      padding: "0px 3px", // Less padding to make it compact
                    }),
                    menu: (base) => ({
                      ...base,
                      backgroundColor: "#ffffff",
                      border: "1px solid #e5e7eb",
                      boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                      borderRadius: "6px",
                      padding: "0px",
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isSelected ? "#3b82f6" : state.isFocused ? "#e0f2fe" : "#ffffff",
                      color: state.isSelected ? "#ffffff" : "#111827",
                      borderRadius: "4px",
                      transition: "background-color 0.2s ease",
                      padding: "3px 10px",
                      fontSize: "13px",
                      zIndex: "999",
                    }),
                    singleValue: (base) => ({
                      ...base,
                      color: "#111827",
                      fontWeight: "500",
                      fontSize: "13px",
                    }),
                    placeholder: (base) => ({
                      ...base,
                      color: "#6b7280",
                      fontSize: "13px",
                    }),
                  }}
                />
              )}
            />
            {errors[field.name] && (
              <p className='mt-1 text-sm text-red-500 dark:text-red-400'>
                {errors[field.name]?.message?.toString()}
              </p>
            )}
          </div>
        );
      })}
    </form>
  );
};

export default FilterReusableForm;
