import React, { useCallback } from "react";
import { motion } from "framer-motion";
import DynamicFormBuilder from "../../components/FormBuilder/DynamicFormBuilder";

import { forgotFields, forgotSchema } from "./loginSchema";
import { useAuth } from "../../hooks/useAuth";
import { useAxios } from "../../hooks/useAxios";
import { ApiEndpoint } from "../../utils/ApiEndpoint/emsapiEndpoint";

const ForgotPasswordPage: React.FC = () => {
  const { loading } = useAuth();

  const { customApiCall } = useAxios<{ email: string }, any>(
    "",
    {
      method: "post",
      loader: true,
      payload: {
        email: "",
      },
      shouldFetch: false
    });

  const handleSubmit = useCallback(
    async (data: { email: string }) => {
      if (data) {
        await customApiCall(
          ApiEndpoint.FORGOT_PASSWORD,
          "post",
          {
            email: data.email
          },
          true,
        );
      }
    },
    [customApiCall]
  );

  // Modify fields to match expected type
  const modifiedLoginFields = forgotFields.map(field => ({
    group: '',
    fields: [
      {
        ...field,
      }
    ]
  }));

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-4'>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className='w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700'
      >
        <div className='text-center mb-8'>
          {/* <div className='flex justify-center mb-4'>
            <Lock className='h-12 w-12 text-blue-600 dark:text-blue-400' strokeWidth={1.5} />
          </div> */}
          {/* <h1 className='text-3xl font-bold text-gray-900 dark:text-white mb-2'>ION<span className="text-red-600">EMS</span></h1> */}
          <h1 className='text-xl font-bold text-gray-800 dark:text-gray-300'>Forgot Password</h1>
        </div>

        <DynamicFormBuilder
          fields={modifiedLoginFields}
          schema={forgotSchema}
          onSubmit={handleSubmit}
          loading={loading}
          submitbuttonName='Submit'
          columnLayout={1}
        />
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
