import React from "react";
import {
  IoSchool,
  IoBus,
  IoBook,
  IoArrowForward,
  IoSettingsSharp,
} from "react-icons/io5";
import { FaUsers, FaBook } from "react-icons/fa";
import { MainPageCards } from "../utils/data";
import { IconBaseProps } from "react-icons";
import { LocalStorageHelper } from "../utils/localStorageHelper";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
// import { roleRoutes } from "../routes/routeConfig";

const configurationCards = [
  {
    title: "User Roles",
    pageUrl: "user_roles",
  },
  {
    title: "User Master",
    pageUrl: "user_master",
  },
  {
    title: "User Access",
    pageUrl: "user_access",
  },
  { title: "Department", pageUrl: "department" },
  { title: "Program Type", pageUrl: "program_type" },
  { title: "Program", pageUrl: "program" },
  { title: "Academic Batch", pageUrl: "academic_batch" },
  { title: "Academic Semester", pageUrl: "semester" },
  { title: "Course", pageUrl: "course" },
  { title: "Bulk Course Import", pageUrl: "bulk_course_import" },
] as const;

const MainPage: React.FC = () => {
  const navigator = useNavigate();

  const { isAuthenticated, setApplicationRole } = useAuth();

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigator("/login");
    }
  }, [isAuthenticated, navigator]);

  // Map icon names from JSON to actual React Icon components
  const iconMapping: { [key: string]: React.ComponentType<IconBaseProps> } = {
    ems: IoBook,
    transport: IoBus,
    admission: IoSchool,
    settings: IoSettingsSharp,
    mentoring: FaUsers,
    curriculum: FaBook,
  };

  const handleNavigate = React.useCallback(
    (url: string, keyname: string) => {
      LocalStorageHelper.setObject("role", keyname);
      setApplicationRole(keyname);
      navigator(url);
    },
    [navigator, setApplicationRole],
  );

  return (
    <div className="flex-grow ">
      <h1 className="text-color-1 text-lg font-semibold pb-3">Modules</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Dynamically generate module cards */}
        {MainPageCards.map((card, index) => {
          const IconComponent = iconMapping[card.iconName] || IoSchool;
          return (
            <div
              key={index}
              className="flex flex-col bg-white shadow-sm border border-slate-200 rounded-lg
                           p-4 hover:bg-gradient-to-br from-blue-50 to-red-50 hover:shadow-md
                           transition-all cursor-pointer"
              onClick={() => {
                handleNavigate(card.url, card.keyname);
              }}
            >
              <div className="flex items-center text-color-1 mb-4">
                <IconComponent className="h-6 w-6" />
                <h5 className="ml-3 text-xl font-semibold">{card.name}</h5>
              </div>
              <p className="text-slate-600 text-sm">
                {card.description || "Explore the features of this module."}
              </p>
              <div className="mt-auto pt-4">
                <span className="text-sm font-semibold main-page-text-color hover:text-red-500">
                  Go to {card.name} <IoArrowForward className="inline ml-1" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <h1 className="text-color-1 text-lg font-semibold mt-5 py-3">
        Configuration
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
        {configurationCards.map((card, index) => {
          return (
            <div
              key={index}
              className="flex flex-col bg-white shadow-sm border border-slate-200 rounded-lg
                           px-4 py-2 hover:bg-gradient-to-br from-blue-50 to-red-50 hover:shadow-md
                           transition-all cursor-pointer"
              onClick={() => {
                navigator(card.pageUrl);
              }}
            >
              <div className="mt-auto">
                <span className="text-sm font-semibold main-page-text-color hover:text-red-500 flex justify-between items-center">
                  {card.title} <IoArrowForward className="inline ml-1" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MainPage;
