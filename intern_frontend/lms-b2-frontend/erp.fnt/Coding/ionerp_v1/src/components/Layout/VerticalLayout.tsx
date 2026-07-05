import React, { useState, useEffect } from "react";
import {
  Menu,
  X,
  ChevronRight,
  LandPlot,
  Columns,
  LayoutGrid,
  User,
  Building,
} from "lucide-react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import { roleRoutes, RouteItem } from "../../routes/routeConfig";
import { useLayout } from "../../contexts/LayoutContext";
// import { useTheme } from '../../contexts/ThemeContext';
import { useModalWithForm } from "../../contexts/ModelFormContext";
import { LocalStorageHelper } from "../../utils/localStorageHelper";
import { getRoleName } from "../../utils/data";

// Define menu items with icons and routes

interface MenuItemProps {
  item: RouteItem;
  level?: number;
}

const MenuItem: React.FC<MenuItemProps> = ({ item, level = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const hasChildren =
    item.subItems &&
    item.subItems.length > 0 &&
    !item.subItems.some(
      (subItem) => subItem.name === "" || subItem.name === "Create" || subItem.name === "Update"
    ) &&
    item.subItems.some((subItem) => !subItem.hidden);

  const toggleSubmenu = (e: React.MouseEvent) => {
    if (hasChildren) {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  const menuItemClasses = (isActive: boolean) => `
  flex items-center justify-between font-normal px-3 py-1 my-1 rounded-md transition-colors w-full
  ${level > 0 ? "ml-2" : ""}
  ${isActive
      ? "button-bg dark:panel-bg text-white"
      : " text-color-1 hover:bg-[#75b9c2]  hover:text-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200"
    }
`;

  const shouldHighlight = (item: any) => {
    if (item.name === "" && item.element === Outlet) return false;
    return (
      location.pathname === item.href ||
      (hasChildren && item.href !== "" && location.pathname === "/" + item.href) ||
      (item.subItems?.some((subItem: any) => shouldHighlight(subItem)) ?? false)
    );
  };

  return (
    <div className='w-full'>
      {item.href && !hasChildren ? (
        <Link to={item.href} className={menuItemClasses(shouldHighlight(item))}>
          <span className='flex items-center text-sm'>
            {item.icon && <span className='mr-1.5'>{item.icon}</span>}
            {item.name}
          </span>
        </Link>
      ) : (
        <button onClick={toggleSubmenu} className={menuItemClasses(shouldHighlight(item))}>
          <span className='flex items-center text-sm'>
            {item.icon && <span className='mr-1.5'>{item.icon}</span>}
            {item.name}
          </span>
          {hasChildren && (
            <ChevronRight
              className={`transform transition-transform ${isOpen ? "rotate-90" : ""}`}
              size={14}
            />
          )}
        </button>
      )}
      {hasChildren && isOpen && (
        <div className='ml-2 relative'>
          <div className='menu-root-line' />
          <div className=''>
            {item?.subItems?.map(
              (child, index) =>
                child.name !== "" && !child.hidden && (
                  <MenuItem key={`${child.name}-${index}`} item={child} level={level + 1} />
                ),
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const scrollbarStyles = `
  [data-custom-scrollbar]::-webkit-scrollbar {
    width: 4px;
  }
  
  [data-custom-scrollbar]::-webkit-scrollbar-track {
    background: transparent;
  }
  
  [data-custom-scrollbar]::-webkit-scrollbar-thumb {
    background-color: rgb(209 213 219);
    border-radius: 20px;
  }

  .dark [data-custom-scrollbar]::-webkit-scrollbar-thumb {
    background-color: rgb(75 85 99);
  }

  [data-custom-scrollbar]::-webkit-scrollbar-thumb:hover {
    background-color: rgb(156 163 175);
  }

  .dark [data-custom-scrollbar]::-webkit-scrollbar-thumb:hover {
    background-color: rgb(107 114 128);
  }

  @keyframes pulseRoot {
    0% {
      opacity: 0.4;
    }
    50% {
      opacity: 0.7;
    }
    100% {
      opacity: 0.4;
    }
  }

  .menu-root-line {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 1px;
    background: #75b9c2;
    // background: rgb(84 137 255);
    animation: pulseRoot 2s ease-in-out infinite;
  }

  .dark .menu-root-line {
    background: rgb(75 85 99);
  }
`;

const VerticalLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { authState, currentOrg, logout, applicationRole, setApplicationRole } = useAuth();
  const { layout, setLayout } = useLayout();
  // const { theme, toggleTheme } = useTheme();
  const { handleOpenOrgModal } = useModalWithForm();
  const routesForRole = roleRoutes[applicationRole as string];

  // Toggle Layout mode
  const toggleLayoutMode = () => {
    const newLayout = layout === "VERTICAL" ? "HORIZONTAL" : "VERTICAL";
    setLayout(newLayout);
  };

  // Toggle sidebar for mobile
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Close sidebar when route changes
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  return (
    <div className='flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300 fixed w-full'>
      {/* Mobile Overlay */}
      {isSidebarOpen && <div className='fixed inset-0 bg-black/50 z-40 lg:hidden' onClick={toggleSidebar} />}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-full w-64 panel-bg-1 dark:bg-gray-900 
          shadow-sm transform transition-transform duration-300 z-50 border-r border-none
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:relative lg:translate-x-0 flex flex-col
        `}
      >
        {/* Header */}
        <div className='flex-shrink-0 flex items-center  w-full justify-between p-4 border-b border-none shadow-sm dark:border-gray-700'>
          <h1 className='text-xl font-bold text-color-1'>
            Ion<span className='text-red-500'>{applicationRole && getRoleName()[applicationRole].toUpperCase()}</span>
          </h1>
          <button onClick={toggleSidebar} className='lg:hidden text-white dark:text-gray-300'>
            <X size={24} />
          </button>
        </div>

        {/* Navigation Menu - Make it scrollable */}
        <style>{scrollbarStyles}</style>
        <nav className='flex-1 overflow-y-auto py-2 px-3' data-custom-scrollbar>
          {routesForRole &&
            Array.isArray(routesForRole) &&
            routesForRole
              .filter((item) => item.href !== "/change_password")
              .map((item, index) => <MenuItem key={`${item.name}-${index}`} item={item} />)}
        </nav>

        {/* User Profile and Logout - Fixed at bottom */}
        <div className='flex-shrink-0 p-4 border-t border-none shadow-sm dark:border-gray-700'>
          <div className='flex items-center justify-between space-x-4'>
            <div className='flex items-center space-x-3'>
              <div className='flex-shrink-0 w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-full'>
                <User className='w-5 h-5 text-color-1 dark:text-gray-400' />
              </div>
              <div className='flex flex-col min-w-0'>
                <p className='text-sm font-medium text-color-1 dark:text-white truncate'>
                  {authState?.username || "Guest"}
                </p>
                <Link
                  to='/change_password'
                  className='text-xs text-color-1 dark:text-blue-400 hover:text-gray-400 dark:hover:text-blue-300 transition-colors mt-0.5'
                >
                  Change Password
                </Link>
              </div>
            </div>
            <button
              onClick={logout}
              className='flex-shrink-0 p-2 text-color-1 hover:text-gray-700 panel-bg-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors'
              title='Logout'
            >
              <svg
                className='w-5 h-5'
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <path d='M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' />
                <polyline points='16 17 21 12 16 7' />
                <line x1='21' y1='12' x2='9' y2='12' />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className='flex-1 flex flex-col overflow-hidden'>
        {/* Top Navigation Bar */}
        <header className='panel-bg-1 dark:bg-gray-800 shadow-sm dark:shadow-gray-900 border-none'>
          <div className='flex items-center justify-between p-4'>
            {/* Mobile Menu Toggle */}
            <button onClick={toggleSidebar} className='lg:hidden text-color-1 dark:text-gray-300'>
              <Menu size={24} />
            </button>

            {/* Page Title or Breadcrumbs */}
            <h2 className='text-lg font-semibold text-color-1 dark:text-white capitalize'>
              {currentOrg?.label}
            </h2>

            {/* Dark Mode Toggle and Other Header Icons */}
            <div className='flex items-center space-x-4'>
              <button
                onClick={() => {
                  LocalStorageHelper.setObject("role", 'main');
                  setApplicationRole('main')
                  navigate("/");
                }}
                className='text-color-1 bg-gray-100 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded-full'
              >
                <LandPlot className='h-4 w-4' aria-hidden='true' />
              </button>
              <button
                onClick={handleOpenOrgModal}
                className='text-color-1 bg-gray-100 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded-full'
              >
                <Building className='h-4 w-4' />
              </button>
              <button
                onClick={toggleLayoutMode}
                className='text-color-1 bg-gray-100 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded-full'
                title={`Switch to ${layout === "VERTICAL" ? "Horizontal" : "Vertical"} Layout`}
              >
                {layout === "VERTICAL" ? <Columns className='h-4 w-4' /> : <LayoutGrid className='h-4 w-4' />}
              </button>
              {/* <button
                onClick={toggleTheme}
                className="text-gray-600 dark:text-yellow-300 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-full"
              >
                {theme === 'dark' ? <Moon className='h-4 w-4' /> : <Sun className='h-4 w-4' />}
              </button> */}
            </div>
          </div>
        </header>

        {/* Main Content Scrollable Area */}
        <main
          className='flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-4'
          data-custom-scrollbar
        >
          <Breadcrumb location={location} />
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default VerticalLayout;
