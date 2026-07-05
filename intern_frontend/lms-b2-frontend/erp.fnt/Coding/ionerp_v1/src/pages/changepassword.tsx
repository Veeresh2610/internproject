import React, { useCallback } from "react";
import DynamicFormBuilder from "../components/FormBuilder/DynamicFormBuilder";

import { changeFields, changeSchema } from "./login/loginSchema";
import { useAuth } from "../hooks/useAuth";
import { useAxios } from "../hooks/useAxios";
import { ApiEndpoint } from "../utils/ApiEndpoint/emsapiEndpoint";

const ChangePasswordPage: React.FC = () => {
  const { loading, logout } = useAuth();
  const { customApiCall } = useAxios<{ oldpassword: string, newpassword: string, confirmpassword: string }, any>(
    "",
    {
      method: "post",
      loader: true,
      payload: {
        oldpassword: "",
        newpassword: "",
        confirmpassword: "",
      },
      shouldFetch: false
    });

  const handleSubmit = useCallback(
    async (data: { oldpassword: string, newpassword: string, confirmpassword: string }) => {
      const response = await customApiCall(
        ApiEndpoint.change_password,
        "post",
        {
          oldpassword: data.oldpassword,
          newpassword: data.newpassword,
          confirmpassword: data.confirmpassword
        },
        true,
      );

      if (response) {
        logout();
        // navigate("/login");
      }

    },
    [logout, customApiCall]
  );

  // Modify fields to match expected type
  const modifiedLoginFields = changeFields.map(field => ({
    group: '',
    fields: [
      {
        ...field,
      }
    ]
  }));

  return (
    <div className="bg-white dark:bg-gray-800 text-gray-900 dark:bg-gray-900 dark:text-gray-100 p-4">

      <DynamicFormBuilder
        fields={modifiedLoginFields}
        schema={changeSchema}
        onSubmit={handleSubmit}
        loading={loading}
        submitbuttonName='Submit'
        columnLayout={1}
      />

    </div>
  );
};

export default ChangePasswordPage;
