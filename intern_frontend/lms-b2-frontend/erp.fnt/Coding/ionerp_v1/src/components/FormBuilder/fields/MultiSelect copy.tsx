import React, { useState, useRef } from "react";
import { UseFormRegister } from "react-hook-form";
import { default as ReactSelect, components, InputAction } from "react-select";

interface MultiSelectProps {
  register?: UseFormRegister<any>;
  options: { label: string; value: any }[];
  isMulti?: boolean;
  [key: string]: any;
}

export type Option = {
  value: any;
  label: string;
};

const MultiSelect1: React.FC<MultiSelectProps> = ({ register, ...props }) => {
  const [selectInput, setSelectInput] = useState<string>("");
  const isAllSelected = useRef<boolean>(false);
  const selectAllLabel = useRef<string>("Select all");
  const allOption = { value: "*", label: selectAllLabel.current };

  const filterOptions = (options: Option[], input: string) =>
    options && Array.isArray(options)
      ? options.filter(({ label }: Option) => label.toLowerCase().includes(input.toLowerCase()))
      : [];

  const comparator = (v1: Option, v2: Option) => (v1.value as number) - (v2.value as number);

  let filteredOptions = filterOptions(props.options, selectInput);
  let filteredSelectedOptions = filterOptions(props.value, selectInput);

  const Option = (props: any) => (
    <components.Option {...props}>
      {props.value === "*" && !isAllSelected.current && filteredSelectedOptions?.length > 0 ? (
        <input
          key={props.value}
          type='checkbox'
          ref={(input) => {
            if (input) input.indeterminate = true;
          }}
        />
      ) : (
        <input
          key={props.value}
          type='checkbox'
          checked={props.isSelected || isAllSelected.current}
          onChange={() => {}}
        />
      )}
      <label style={{ marginLeft: "5px" }}>{props.label}</label>
    </components.Option>
  );

  const Input = (props: any) => (
    <>
      {selectInput.length === 0 ? (
        <components.Input autoFocus={props.selectProps.menuIsOpen} {...props}>
          {props.children}
        </components.Input>
      ) : (
        <div style={{ border: "1px dotted gray" }}>
          <components.Input autoFocus={props.selectProps.menuIsOpen} {...props}>
            {props.children}
          </components.Input>
        </div>
      )}
    </>
  );

  const customFilterOption = ({ value, label }: Option, input: string) =>
    (value !== "*" && label.toLowerCase().includes(input.toLowerCase())) ||
    (value === "*" && filteredOptions?.length > 0);

  const onInputChange = (inputValue: string, event: { action: InputAction }) => {
    if (event.action === "input-change") setSelectInput(inputValue);
    else if (event.action === "menu-close" && selectInput !== "") setSelectInput("");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if ((e.key === " " || e.key === "Enter") && !selectInput) e.preventDefault();
  };

  const handleChange = (selected: readonly Option[] | Option | null, actionMeta: any) => {
    // console.log("Selected: ", selected, actionMeta);
    if (props.isMulti) {
      // console.log("Selected: 1", selected);
      // Multi-select logic
      const selectedArray = Array.isArray(selected) ? [...selected] : selected ? [selected] : [];
      if (
        selectedArray.length > 0 &&
        !isAllSelected.current &&
        (selectedArray[selectedArray.length - 1].value === allOption.value ||
          JSON.stringify(filteredOptions) === JSON.stringify(selectedArray.sort(comparator)))
      ) {
        // console.log("All selected", props.options.filter(
        //   ({ label }: Option) =>
        //     label.toLowerCase().includes(selectInput?.toLowerCase()) &&
        //     (props.value ?? []).filter((opt: Option) => opt.label === label).length === 0,
        // ));
        props.onChange(
          [
            ...(props.value ?? []),
            ...props.options.filter(
              ({ label }: Option) =>
                label.toLowerCase().includes(selectInput?.toLowerCase()) &&
                (props.value ?? []).filter((opt: Option) => opt.label === label).length === 0,
            ),
          ].sort(comparator)
        );
        // console.log("Selected: 2", selected);
      } else if (
        selectedArray.length > 0 &&
        selectedArray[selectedArray.length - 1].value !== allOption.value &&
        JSON.stringify(selectedArray.sort(comparator)) !== JSON.stringify(filteredOptions)
      ) {
        props.onChange(selectedArray);
        // console.log("Selected: 3", selected);
      } else {
        props.onChange(
          [
            ...props.value?.filter(
              ({ label }: Option) => !label.toLowerCase().includes(selectInput?.toLowerCase()),
            ),
          ]
        );
        // console.log("Selected: 4", selected);
      }
    } else {
      // Single-select logic
      // console.log("Selected: 5", selected, actionMeta);
      props.onChange(selected);
    }
  };

  const customStyles = {
    multiValueLabel: (def: any) => ({
      ...def,
      backgroundColor: "lightgray",
    }),
    multiValueRemove: (def: any) => ({
      ...def,
      backgroundColor: "lightgray",
    }),
    valueContainer: (base: any) => ({
      ...base,
      maxHeight: "65px",
      overflow: "auto",
    }),
    option: (styles: any, { isSelected, isFocused }: any) => {
      return {
        ...styles,
        backgroundColor:
          isSelected && !isFocused
            ? null
            : isFocused && !isSelected
            ? styles.backgroundColor
            : isFocused && isSelected
            ? "#DEEBFF"
            : null,
        color: isSelected ? null : null,
      };
    },
    menu: (def: any) => ({ ...def, zIndex: 9999 }),
  };

  if (props.isSelectAll && props.options && props.options.length !== 0) {
    isAllSelected.current = JSON.stringify(filteredSelectedOptions) === JSON.stringify(filteredOptions);

    if (filteredSelectedOptions?.length > 0) {
      if (filteredSelectedOptions?.length === filteredOptions?.length)
        selectAllLabel.current = `All (${filteredOptions.length}) selected`;
      else selectAllLabel.current = `${filteredSelectedOptions?.length} / ${filteredOptions.length} selected`;
    } else selectAllLabel.current = "Select all";

    allOption.label = selectAllLabel.current;

    return (
      <div className='mb-4'>
        <label className='block text-sm font-medium text-gray-700'>
          {props.label} {props.required ? <span className='text-red-500'>*</span> : null}
        </label>
        <ReactSelect
          {...props}
          {...register?.(props.name)}
          inputValue={selectInput}
          onInputChange={onInputChange}
          onKeyDown={onKeyDown}
          className={`mt-1 block w-full p-0 bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark border border-gray-300 rounded-md  focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm `}
          options={[allOption, ...(props.options || [])]}
          onChange={handleChange}
          components={{
            Option: Option,
            Input: Input,
            ...props.components,
          }}
          filterOption={customFilterOption}
          menuPlacement={props.menuPlacement ?? "auto"}
          styles={customStyles}
          isMulti
          closeMenuOnSelect={false}
          tabSelectsValue={false}
          backspaceRemovesValue={false}
          hideSelectedOptions={false}
          blurInputOnSelect={false}
        />
          {props.error && <p className='mt-1 text-xs text-red-600'>{props.error.message}</p>}
      </div>
    );
  }

  return (
    <div className='mb-4'>
      <label className='block text-sm font-medium text-gray-700'>
        {props.label} {props.required ? <span className='text-red-500'>*</span> : null}
      </label>
      <ReactSelect
        {...props}
        {...register?.(props.name)}
        inputValue={selectInput}
        onInputChange={onInputChange}
        onKeyDown={onKeyDown}
        className={`mt-1 block w-full p-0 bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark border border-gray-300 rounded-md  focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
        options={props.isMulti ? [allOption, ...(props.options || [])] : props.options}
        onChange={handleChange}
        components={{
          Option: props.isMulti ? Option : undefined,
          Input: Input,
          ...props.components,
        }}
        filterOption={customFilterOption}
        menuPlacement={props.menuPlacement ?? "auto"}
        styles={customStyles}
        isMulti={props.isMulti}
        closeMenuOnSelect={!props.isMulti}
        tabSelectsValue={false}
        backspaceRemovesValue={false}
        hideSelectedOptions={!props.isMulti}
        blurInputOnSelect={!props.isMulti}
      />
        {props.error && <p className='mt-1 text-xs text-red-600'>{props.error.message}</p>}
    </div>
  );
};
export default MultiSelect1;
