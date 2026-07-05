import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { Dialog, Transition } from "@headlessui/react";
import DynamicFormBuilder from "../components/FormBuilder/DynamicFormBuilder";
import { ZodSchema } from "zod";
import { orgModelFields, orgModelSchema } from "./schema/orgModelSchema";
import {  AUTH_COOKIE_KEY, useAuth } from "../hooks/useAuth";
import { LocalStorageHelper } from "../utils/localStorageHelper";
import { loginData } from "../pages/login/loginModel";
// import { LocalStorageHelper } from "../utils/localStorageHelper";
// import { loginData } from "../pages/login/loginModel";

interface ModalWithFormContextProps {
  openModal?: (props: ModalWithFormProps) => void;
  closeModal: () => void;
  handleOpenOrgModal?: () => void;
}

interface ModalWithFormProps {
  onSubmit: (data: any) => void;
  title: string;
  formFields: any[];
  schema: ZodSchema;
  size: "sm" | "md" | "lg" | "xl" | "full";
  columnLayout: 1 | 2 | 3 | 4;
  initialValues?: any;
  submitbuttonName?: string;
  closebuttonName?: string;
}

const ModalWithFormContext = createContext<ModalWithFormContextProps | undefined>(undefined);

export const ModalWithFormProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalProps, setModalProps] = useState<ModalWithFormProps | null>(null);
  const { currentOrg, setCurrentOrgData } = useAuth();
  const [orgList] = useState<loginData | null>(() => {
    return LocalStorageHelper.getObject<loginData>(AUTH_COOKIE_KEY) || null;
  });
  const openModal = (props: ModalWithFormProps) => {
    setModalProps(props);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

// console.log(' currentOrg', currentOrg);
  const handleOpenOrgModal = useCallback(() => {
    // const CurrentOrg = currentOrg && currentOrg?.value ? String(currentOrg?.value) : LocalStorageHelper.getObject<orgDataResponse>(AUTH_COOKIE_ORG_KEY) || '';
    openModal({
      title: "Set Organization",
      formFields: orgModelFields.map((group) => ({
        ...group,
        fields: group.fields.map((field) =>
          field.name === "organizationName"
            ? {
              ...field,
              options: orgList?.org_data?.map(org => ({ ...org, value: String(org.value) })) ?? []
            }
            : field,
        ),
      })),
      schema: orgModelSchema,
      onSubmit: (data) => {
        setCurrentOrgData(data);
        closeModal();
        console.log("Submitted data:", data);
      },
      size: "md",
      columnLayout: 1,
      initialValues: {
        organizationName: currentOrg?.value ? String(currentOrg?.value) : "",
      },
      submitbuttonName: "Submit",
      closebuttonName: "Close",
    });
  }, [ currentOrg?.value, setCurrentOrgData, orgList?.org_data]);

  return (
    <ModalWithFormContext.Provider value={{ openModal, closeModal, handleOpenOrgModal }}>
      {children}
      {modalProps && (
        <Transition show={isOpen} as={React.Fragment}>
          <Dialog as='div' className='fixed inset-0 z-10 overflow-y-auto' onClose={closeModal}>
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
                  className={`inline-block w-full ${
                    modalProps.size ? sizeClasses[modalProps.size] : sizeClasses["md"]
                  } p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-background-dark text-text-light dark:text-text-dark shadow-xl rounded-2xl`}
                >
                  <Dialog.Title
                    as='h3'
                    className='text-lg font-medium leading-6 pb-6 text-text-light dark:text-text-dark flex justify-between items-center'
                  >
                    <span>{modalProps.title}</span>
                    <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                      &times; {/* This is a simple close icon. You can replace it with an SVG or an icon component */}
                    </button>
                  </Dialog.Title>
                  <div className='mt-2'>
                    <DynamicFormBuilder
                      fields={modalProps.formFields}
                      schema={modalProps.schema}
                      onSubmit={modalProps.onSubmit}
                      onClose={closeModal}
                      columnLayout={modalProps.columnLayout || 1}
                      initialValues={modalProps.initialValues || {}}
                      submitbuttonName={modalProps.submitbuttonName || "Save"}
                      closebuttonName={modalProps.closebuttonName || "Cancel"}
                    />
                  </div>
                </div>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition>
      )}
    </ModalWithFormContext.Provider>
  );
};

export const useModalWithForm = (): ModalWithFormContextProps => {
  const context = useContext(ModalWithFormContext);
  if (!context) {
    throw new Error("useModalWithForm must be used within a ModalWithFormProvider");
  }
  return context;
};

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  full: "max-w-full",
};
