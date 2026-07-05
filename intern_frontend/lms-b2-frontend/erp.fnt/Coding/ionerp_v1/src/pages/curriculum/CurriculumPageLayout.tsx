import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";

interface CurriculumPageLayoutProps {
  children: React.ReactNode;
}

const CurriculumPageLayout: React.FC<CurriculumPageLayoutProps> = ({ children }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const menuItems = [
    { name: "Student to Course Registration", path: "/curriculum", disabled: false },
    { name: "Curriculum Structure", path: "#", disabled: true },
    { name: "Course Syllabus", path: "#", disabled: true },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 md:p-6 bg-gray-50 dark:bg-gray-900 transition-colors duration-300 min-h-[calc(100vh-120px)]">
      {/* Sidebar Navigation */}
      <div className="w-full lg:w-64 flex-shrink-0">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
          <ul className="divide-y divide-gray-150 dark:divide-gray-700">
            {menuItems.map((item, index) => {
              const isActive =
                item.path === "/curriculum"
                  ? currentPath === "/curriculum" || currentPath === "/curriculum/"
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

export default CurriculumPageLayout;
