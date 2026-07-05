import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Breadcrumb from '../Breadcrumb/Breadcrumb';

export interface BaseLayoutProps {
  children?: React.ReactNode;
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  footer?: React.ReactNode;
}

const BaseLayout: React.FC<BaseLayoutProps> = ({
  children,
  header,
  sidebar,
  footer
}) => {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col" >
      {header}
      <div className="flex flex-1">
        {sidebar}
        <main className="flex-1 p-4 overflow-y-auto "  >
          <Breadcrumb location={location} />
          {children || <Outlet />}
        </main>
      </div>
      {footer}
    </div>
  );
};

export default BaseLayout;
