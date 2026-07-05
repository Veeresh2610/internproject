import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";

interface MentoringPageLayoutProps {
  children: React.ReactNode;
}

const MentoringPageLayout: React.FC<MentoringPageLayoutProps> = ({ children }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const menuItems = [
    { name: "Configuration", path: "/mentoring", disabled: false },
    { name: "Questionnaires", path: "/mentoring/questionnaires", disabled: false },
    { name: "Dept. Configuration", path: "/mentoring/dept_configuration", disabled: false },
    { name: "Map Mentor Mentee", path: "/mentoring/map_mentor_mentee", disabled: false },
    { name: "Mentoring Session", path: "/mentoring/mentoring_session", disabled: false },
    { name: "MMP Report", path: "#", disabled: true },
    { name: "Mentor List", path: "/mentoring/mentor_list", disabled: false },
    { name: "Issue & Observation Report", path: "#", disabled: true },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 md:p-6 bg-gray-50 dark:bg-gray-900 transition-colors duration-300 min-h-[calc(100vh-120px)]">
      {/* Sidebar Navigation */}
      <div className="w-full lg:w-64 flex-shrink-0">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
          <ul className="divide-y divide-gray-150 dark:divide-gray-700">
            {menuItems.map((item, index) => {
              // Active check: Configuration is active for /mentoring or /mentoring/ (since it's the default index route)
              const isActive =
                item.path === "/mentoring"
                  ? currentPath === "/mentoring" || currentPath === "/mentoring/"
                  : currentPath === item.path;

              const baseClasses =
                "flex items-center justify-between px-5 py-3.5 text-sm font-semibold transition-all w-full text-left";
              const activeClasses = isActive
                ? "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white"
                : "text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white";
              const cursorClasses = item.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer";

              const content = (
                <>
                  <span>{item.name}</span>
                  <ChevronRight
                    size={14}
                    className={`text-slate-400 dark:text-gray-500 transition-transform ${
                      isActive ? "text-slate-900 dark:text-white translate-x-0.5" : ""
                    }`}
                  />
                </>
              );

              if (item.disabled) {
                return (
                  <li key={index}>
                    <button
                      type="button"
                      disabled
                      className={`${baseClasses} ${activeClasses} ${cursorClasses}`}
                    >
                      {content}
                    </button>
                  </li>
                );
              }

              return (
                <li key={index}>
                  <Link
                    to={item.path}
                    className={`${baseClasses} ${activeClasses} ${cursorClasses}`}
                  >
                    {content}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow min-w-0">
        {children}
      </div>
    </div>
  );
};

export default MentoringPageLayout;
