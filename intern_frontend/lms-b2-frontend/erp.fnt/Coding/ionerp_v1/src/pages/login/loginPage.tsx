import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import DynamicFormBuilder from "../../components/FormBuilder/DynamicFormBuilder";

import { loginFields, loginSchema } from "./loginSchema";
import { useAuth } from "../../hooks/useAuth";
import { loginPayload } from "./loginModel";
import { toast } from "react-toastify";
import { LocalStorageHelper } from "../../utils/localStorageHelper";
// import { getRoleName } from "../../utils/data";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loading, login } = useAuth();

  React.useEffect(() => {
    LocalStorageHelper.removeAll();
  }, []);

  const [showPassword, setShowPassword] = useState(false);
  // const [loginData, setLoginData] = useState<loginPayload>({
  //   role: "",
  //   username: "",
  //   password: "",
  // });

  const handleSubmit = useCallback(
    async (data: loginPayload) => {
      try {
        const res = await login("main", data.username, data.password);
        if (res) {
          navigate("/");
        } else {
          toast.error("Invalid credentials", {
            position: "top-right",
            autoClose: 3000,
          });
        }
      } catch (error) {
        toast.error("Login failed. Please try again.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    },
    [login, navigate],
  );

  // Modify fields to match expected type
  const modifiedLoginFields = loginFields.map((field) => ({
    group: "",
    fields: [
      {
        ...field,
        customProps:
          field.name === "password"
            ? {
              type: showPassword ? "text" : "password",
              rightIcon: showPassword ? (
                <Eye className='text-gray-400 cursor-pointer' onClick={() => setShowPassword(false)} />
              ) : (
                <EyeOff className='text-gray-400 cursor-pointer' onClick={() => setShowPassword(true)} />
              ),
            }
            : {},
      },
    ],
  }));

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-white-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-4'>
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
          <h1 className='text-3xl font-bold text-gray-900 dark:text-white mb-2'>
            {/* ION<span className="text-red-600">{getRoleName()[loginData.role].toUpperCase()}</span> */}
            ION<span className='text-red-600'>EDUCATION</span>
          </h1>
          {/* <p className='text-gray-600 dark:text-gray-300'>Sign in to continue</p> */}
        </div>

        <DynamicFormBuilder
          fields={modifiedLoginFields}
          schema={loginSchema}
          onSubmit={handleSubmit}
          loading={loading}
          submitbuttonName='Sign In'
          initialValues={{
            role: "main",
            username: "",
            password: "",
          }}
          // onValidDataChange={(data, value) => {
          //   console.log('asd', data);
          //   const { role, username, password } = JSON.parse(data);
          //   setLoginData(prevState => ({
          //     ...prevState,
          //     role,
          //     username,
          //     password
          //   }));
          // }}
          columnLayout={1}
        />

        <div className='text-start mt-4'>
          <a href='/forgot-password' className='text-blue-500 text-sm hover:text-blue-700'>
            Forgot Password?
          </a>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
