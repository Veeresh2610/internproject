import React from "react";
import { useAuth } from "../../hooks/useAuth";
import { LocalStorageHelper } from "../../utils/localStorageHelper";


const Footer: React.FC = () => {
  const role = LocalStorageHelper.getObject<string>("role") ?? "";
  const { isAuthenticated, currentOrg } = useAuth();

  return (
    <footer className={`${role !== 'main' ? 'panel-bg text-white' : 'panel-bg-1 text-color-1'} dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700 py-1`}>
      <div className='container mx-auto px-4 text-center text-sm  dark:text-gray-400'>
        © {new Date().getFullYear()} {isAuthenticated && currentOrg?.label}. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
