import React from "react";
import LoadingOverlay from "react-loading-overlay-ts";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter as Router } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LayoutProvider } from "./contexts/LayoutContext";
import AppRoutes from "./routes/routes";
import { useLoader } from "./contexts/LoaderContext";
import { ModalWithFormProvider } from "./contexts/ModelFormContext";
// import {  useModalWithForm } from "./contexts/ModelFormContext";
// import { LocalStorageHelper } from "./utils/localStorageHelper";
// import { loginData, orgDataResponse } from "./pages/login/loginModel";
// import { AUTH_COOKIE_KEY, AUTH_COOKIE_ORG_KEY } from "./hooks/useAuth";

const App: React.FC = () => {
  const { loading, loadingText } = useLoader();
  // const { handleOpenOrgModal } = useModalWithForm()

  // React.useEffect(() => {
  //   const user = LocalStorageHelper.getObject<loginData>(AUTH_COOKIE_KEY) || null;
  //   const localStorageHelper = LocalStorageHelper.getObject<orgDataResponse>(AUTH_COOKIE_ORG_KEY) || null;
  //   if (!localStorageHelper && user) {
  //     handleOpenOrgModal?.();
  //   }
  // }, [handleOpenOrgModal]);


  return (
    <LoadingOverlay active={loading} spinner text={loadingText}>
      <ThemeProvider>
        <ModalWithFormProvider>
          <Router>
            <LayoutProvider>
              <div className='min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300'>
                {/* <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8"> */}
                <AppRoutes />
                {/* </main> */}
                <ToastContainer
                  position='top-right'
                  autoClose={5000}
                  hideProgressBar={false}
                  newestOnTop={false}
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                />
              </div>
            </LayoutProvider>
          </Router>
        </ModalWithFormProvider>
      </ThemeProvider>
    </LoadingOverlay>
  );
};


export default App;
