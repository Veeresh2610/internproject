import React from "react";
import { Dialog, Transition } from "@headlessui/react";
import DynamicFormBuilder from "../FormBuilder/DynamicFormBuilder";
import { ZodSchema } from "zod";

interface ModalWithFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  title: string;
  formFields: any[];
  schema: ZodSchema;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  columnLayout?: 1 | 2 | 3 | 4;
  initialValues?: any;
  onValidDataChange?: (data: any) => void;
  submitbuttonName?: string;
  closebuttonName?: string;
}

const ModalWithForm: React.FC<ModalWithFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  formFields,
  schema,
  size = "md",
  columnLayout = 1,
  initialValues = {},
  onValidDataChange,
  submitbuttonName = "Save",
  closebuttonName = "Cancel",
}) => {
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-full", // Add this line
  };

  // console.log('Initial Values:', initialValues);
  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog as='div' className='fixed inset-0 z-80 overflow-y-auto' onClose={onClose}>
        <div className='min-h-screen px-4 text-center'>
          <Transition.Child
            as={React.Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <div className='fixed inset-0 bg-black opacity-50' />
          </Transition.Child>

          <span className='inline-block h-screen align-middle' aria-hidden='true'>
            &#8203;
          </span>
          <Transition.Child
            as={React.Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0 scale-95'
            enterTo='opacity-100 scale-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100 scale-100'
            leaveTo='opacity-0 scale-95'
          >
            <div
              className={`inline-block w-full ${sizeClasses[size]} p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-background-dark text-text-light dark:text-text-dark shadow-xl rounded-2xl relative`}
            >
              <div className='flex justify-between items-start mb-4'>
                <Dialog.Title
                  as='h3'
                  className='text-lg font-medium leading-6 text-color-1 dark:text-text-dark'
                >
                  {title}
                </Dialog.Title>
                <button
                  onClick={onClose}
                  className='text-gray-400 hover:text-gray-500 focus:outline-none'
                  aria-label='Close modal'
                >
                  <svg className='h-6 w-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M6 18L18 6M6 6l12 12'
                    />
                  </svg>
                </button>
              </div>
              <div className=''>
                <DynamicFormBuilder
                  key={JSON.stringify(initialValues)}
                  fields={formFields}
                  schema={schema}
                  onSubmit={onSubmit}
                  onClose={onClose}
                  columnLayout={columnLayout}
                  initialValues={initialValues}
                  submitbuttonName={submitbuttonName}
                  closebuttonName={closebuttonName}
                  onValidDataChange={onValidDataChange}
                />
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ModalWithForm;
