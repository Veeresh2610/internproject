import React, { useState, useEffect, useRef } from "react";
import {
  Columns,
  LayoutGrid,
  Menu,
  X,
  LandPlot,
  ChevronDown,
  ChevronRight,
  User,
  Building,
} from "lucide-react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import BaseLayout from "./BaseLayout";
import { useLayout } from "../../contexts/LayoutContext";
// import { useTheme } from '../../contexts/ThemeContext';
import { roleRoutes, RouteItem } from "../../routes/routeConfig";
import { FiChevronDown } from "react-icons/fi";
import { useModalWithForm } from "../../contexts/ModelFormContext";
import Footer from "./Footer";
import { LocalStorageHelper } from "../../utils/localStorageHelper";
import { getRoleName } from "../../utils/data";

// Recursive MenuItem component for nested routes
const MenuItem: React.FC<{
  item: RouteItem;
  isMobile?: boolean;
  depth?: number;
  menuType?: "main" | "child";
  parentId?: string;
  onMenuToggle?: (menuId: string | null) => void;
  activeMenuId?: string | null;
}> = ({
  item,
  isMobile = false,
  depth = 0,
  menuType = "main",
  parentId = "",
  onMenuToggle,
  activeMenuId,
}) => {
    const location = useLocation();
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);
    const currentMenuId = parentId ? `${parentId}-${item.name}` : item.name;

    // const isActive: boolean =
    //   location.pathname === item.href ||
    //   (item.subItems &&
    //     item.subItems.length > 0 &&
    //     item.subItems.some((subItem) => location.pathname === subItem.href)) ||
    //   false;

    // console.log(isActive);
    const hasChildren =
      item.subItems &&
      item.subItems.length > 0 &&
      !item.subItems.some(
        (subItem) => subItem.name === "" || subItem.name === "Create" || subItem.name === "Update"
      ) &&
      item.subItems.some((subItem) => !subItem.hidden);

    const menuRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
          if (!parentId) {
            setIsExpanded(false);
            setActiveSubMenu(null);
            onMenuToggle?.(null);
          }
        }
      };

      if (isExpanded) {
        document.addEventListener("click", handleClickOutside);
      }
      return () => {
        document.removeEventListener("click", handleClickOutside);
      };
    }, [isExpanded, parentId, onMenuToggle]);

    useEffect(() => {
      if (!parentId && isExpanded && activeMenuId && !activeMenuId.startsWith(currentMenuId)) {
        setIsExpanded(false);
        setActiveSubMenu(null);
      }
    }, [activeMenuId, currentMenuId, isExpanded, parentId]);

    const linkClassName = (isActive: boolean, hasChildren: boolean) => `
    ${isMobile ? "block w-full" : "inline-flex items-center"} 
    px-2 py-1 text-sm rounded-md transition-colors relative dark:text-gray-200
    ${isActive ? "panel-bg text-white" : `hover:panel-bg-1 ${hasChildren ? "text-color-1" : "text-color-1"} `}
    ${depth > 0 ? "pl-" + depth * 2.5 : ""}
  `;

    const handleClick = (e: React.MouseEvent) => {
      if (!hasChildren) {
        if (!parentId) {
          onMenuToggle?.(null);
        }
        return;
      }
      e.preventDefault();
      e.stopPropagation();

      const newExpandedState = !isExpanded;
      setIsExpanded(newExpandedState);
      setActiveSubMenu(null);

      if (!parentId) {
        onMenuToggle?.(newExpandedState ? currentMenuId : null);
      }
    };

    const handleSubItemClick = (e: React.MouseEvent, subItem: RouteItem) => {
      e.preventDefault();
      e.stopPropagation();

      if (!subItem.subItems || subItem.subItems.length === 0) {
        if (!parentId) {
          onMenuToggle?.(null);
          setIsExpanded(false);
          setActiveSubMenu(null);
        }
        return;
      }

      const newActiveSubMenu = activeSubMenu === subItem.name ? null : subItem.name;
      setActiveSubMenu(newActiveSubMenu);

      if (!isExpanded) {
        setIsExpanded(true);
      }
    };

    const shouldHighlight = (item: any) => {
      if (item.name === "" && item.element === Outlet) return false;
      return (
        location.pathname === item.href ||
        (hasChildren && item.href !== "" && location.pathname === "/" + item.href) ||
        (item.subItems?.some((subItem: any) => shouldHighlight(subItem)) ?? false)
      );
    };
    const renderLink = () => (
      <div className={linkClassName(shouldHighlight(item), hasChildren ?? false) + " w-full"}>
        {!hasChildren ? (
          <Link to={item.href ?? "#"} className='flex items-center justify-between w-full'>
            <div className={`flex items-center ${item.href === "/" ? " dark:text-gray-200" : ""} space-x-1.5`}>
              {item.icon && <span className='text-[15px]'>{item.icon}</span>}
              <span className='font-medium'>{item.name}</span>
            </div>
          </Link>
        ) : (
          <div className='flex items-center justify-between w-full cursor-pointer' onClick={handleClick}>
            <div className='flex items-center space-x-1.5'>
              {item.icon && <span className='text-[15px]'>{item.icon}</span>}
              <span className='font-medium'>{item.name}</span>
            </div>
            <span>
              {depth === 0 ? (
                <ChevronDown
                  className={`w-3.5 h-3.5 transform transition-transform ${isExpanded || activeSubMenu ? "rotate-180" : ""
                    }`}
                />
              ) : (
                <ChevronRight
                  className={`w-3.5 h-3.5 transform transition-transform ${isExpanded || activeSubMenu ? "rotate-90" : ""
                    }`}
                />
              )}
            </span>
          </div>
        )}
      </div>
    );

    const renderSubMenu = () => {
      if (!hasChildren) return null;

      const isTopLevel = depth === 0;
      const dropdownClasses = isTopLevel ? "top-full left-0" : "top-0 left-full";

      return (
        <div
          className={`
          absolute z-50 bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-200 shadow-lg rounded-md 
          min-w-[200px] border border-gray-200 dark:border-gray-700
          ${dropdownClasses}
          transition-all duration-200 ease-in-out
          ${isExpanded || activeSubMenu ? "opacity-100 visible" : "opacity-0 invisible"}
        `}
        >
          <div className='py-0.5'>
            {item.subItems?.map(
              (child, index) =>
                child.name !== "" && !child.hidden && (
                  <div
                    key={`${child.name}-${index}`}
                    className={`
                    relative cursor-pointer text-gray-700 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700
                    ${activeSubMenu === child.name ? "bg-gray-100 dark:bg-gray-700" : ""}
                  `}
                    onClick={(e) => handleSubItemClick(e, child)}
                  >
                    <MenuItem
                      item={child}
                      isMobile={isMobile}
                      menuType='child'
                      depth={depth + 1}
                      parentId={currentMenuId}
                      onMenuToggle={onMenuToggle}
                      activeMenuId={activeMenuId}
                    />
                  </div>
                ),
            )}
          </div>
        </div>
      );
    };

    return (
      <div ref={menuRef} className={`${depth > 0 ? "w-full" : ""} relative`}>
        {renderLink()}
        {renderSubMenu()}
      </div>
    );
  };

const HorizontalLayout: React.FC = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [activeMobileMenuId, setActiveMobileMenuId] = useState<string | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const location = useLocation();
  const { authState, currentOrg, logout, applicationRole, setApplicationRole } = useAuth();
  const { layout, setLayout } = useLayout();
  // const { theme, toggleTheme } = useTheme();
  const { handleOpenOrgModal } = useModalWithForm();
  const routesForRole = roleRoutes[applicationRole as string];

  const toggleLayoutMode = () => {
    setLayout(layout === "VERTICAL" ? "HORIZONTAL" : "VERTICAL");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setActiveMenuId(null);
    setActiveMobileMenuId(null);
    // if (!role) {
    //   navigate("/main");
    //   return;
    // }
  }, [location]);

  const handleMobileMenuToggle = (menuId: string | null) => {
    setActiveMobileMenuId(menuId);
  };

  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showProfileMenu]);

  const Header = (
    <header className='panel-bg dark:bg-gray-900 shadow-sm'>
      <div className='mx-auto'>
        {applicationRole !== "main" && (
          <div className='flex items-center px-4 justify-between text-center w-full '>
            <div className='flex items-center'>
              {
                <h1 className='text-lg font-semibold text-white '>
                  Ion<span className='text-red-500'>{applicationRole && getRoleName()[applicationRole].toUpperCase()}</span>
                </h1>
              }
            </div>
            <h1 className='lg:text-xl font-semibold py-3 text-white'>{currentOrg?.label}</h1>
            <div></div>
          </div>
        )}
        <div className='flex items-center px-4 justify-between panel-bg-1 dark:bg-gray-900 h-10 '>
          {/* Logo */}
          <div>
            {applicationRole === "main" && (
              <h1 className='text-lg font-semibold '>
                Ion<span className='text-red-500'>Education</span>
              </h1>
            )}
          </div>
          {/* Desktop Navigation */}
          <nav className='hidden md:flex space-x-0.5'>
            {routesForRole &&
              Array.isArray(routesForRole) &&
              routesForRole
                .filter((item) => item.href !== "/change_password")
                .map((item, index) => (
                  <MenuItem
                    key={`${item.name}-${index}`}
                    item={item}
                    onMenuToggle={setActiveMenuId}
                    activeMenuId={activeMenuId}
                  />
                ))}
          </nav>

          {/* User and Dark Mode Actions */}
          <div className='flex items-center space-x-1.5'>
            {applicationRole !== "main" && (
              <button
                onClick={() => {
                  LocalStorageHelper.setObject("role", 'main');
                  setApplicationRole('main')
                  navigate("/");
                }}
                className='text-color-1 hover:panel-bg p-1 rounded-full'
              >
                <LandPlot className='h-4 w-4' aria-hidden='true' />
              </button>
            )}
            {applicationRole !== "main" && (
              <button onClick={handleOpenOrgModal} className='text-color-1 hover:panel-bg p-1 rounded-full'>
                <Building className='h-4 w-4' aria-hidden='true' />
              </button>
            )}
            {applicationRole !== "main" && (
              <button
                onClick={toggleLayoutMode}
                className='text-color-1 hover:panel-bg p-1 rounded-full'
                title={`Switch to ${layout === "VERTICAL" ? "Horizontal" : "Vertical"} Layout`}
              >
                {layout === "VERTICAL" ? <Columns className='h-4 w-4' /> : <LayoutGrid className='h-4 w-4' />}
              </button>
            )}
            {/* <button
              onClick={toggleTheme}
              className="text-white hover:bg-blue-500 p-1 rounded-full"
            >
              {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button> */}

            {/* User Profile */}
            <div className='relative' ref={profileMenuRef}>
              <div
                className='flex items-center space-x-1 cursor-pointer p-1 rounded-md hover:panel-bg'
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <User className='h-5 w-5 text-color-1' />
                <FiChevronDown
                  className={`h-4 w-4 text-color-1 transition-transform duration-200 ${showProfileMenu ? "rotate-180" : ""
                    }`}
                />
              </div>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div className='absolute right-0 mt-1 w-48 bg-white  dark:bg-gray-800 rounded-md shadow-lg border border-gray-100 dark:border-gray-700 py-1 z-50'>
                  <button
                    onClick={() => {
                      // Potentially handle user info or similar action
                    }}
                    className='w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  >
                    {authState?.username}
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate("/change_password");
                    }}
                    className='w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  >
                    Change Password
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                    }}
                    className='w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button onClick={toggleMobileMenu} className='md:hidden text-color-1 p-1'>
              {isMobileMenuOpen ? <X className='h-4 w-4' /> : <Menu className='h-4 w-4' />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className='md:hidden fixed inset-0 bg-gray-900/50 z-40'>
            <div className='fixed inset-y-0 right-0 w-full max-w-sm bg-white dark:bg-gray-800 shadow-lg z-50'>
              <div className='flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700'>
                <h2 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>Menu</h2>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className='p-2 text-gray-500 rounded-md hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700'
                >
                  <X className='w-5 h-5' />
                </button>
              </div>
              <nav className='px-2 py-3 h-[calc(100vh-64px)] overflow-x-hidden overflow-y-auto'>
                {routesForRole.map((item, index) => (
                  <MenuItem
                    key={`${item.name}-${index}`}
                    item={item}
                    isMobile={true}
                    onMenuToggle={handleMobileMenuToggle}
                    activeMenuId={activeMobileMenuId}
                  />
                ))}
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  );

  return (
    <BaseLayout header={Header} footer={<Footer />}>
      <Outlet />
    </BaseLayout>
  );
};

export default HorizontalLayout;
