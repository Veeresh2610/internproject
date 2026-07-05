import React from "react";
import { Link, useLocation } from "react-router-dom";
import { roleRoutes, RouteItem } from "../../routes/routeConfig";
import { useAuth } from "../../hooks/useAuth";

interface BreadcrumbProps {
  location: ReturnType<typeof useLocation>;
}

const findRouteName = (pathname: string, routes: RouteItem[]): string | null => {
  for (const route of routes) {
    if (route.href === pathname) {
      return route.name;
    }
    if (pathname === "change_password") {
      return "Change Password";
    }
    if (route.subItems) {
      const subRouteName = findRouteName(pathname, route.subItems);
      if (subRouteName) {
        return subRouteName;
      }
    }
  }
  return null;
};

const Breadcrumb: React.FC<BreadcrumbProps> = ({ location }) => {
  const { applicationRole } = useAuth();
  // const navigator = useNavigate();
  const pathnames = location.pathname.split("/").filter((x) => x);

  const routesForRole = roleRoutes[applicationRole as string];

  //   findRouteName(location.pathname, routesForRole);

  return (
    <nav className='breadcrumb mb-6  text-sm '>
      <ol className='list-reset flex '>
        <li>
          <Link to={"/"} className='hover:underline text-gray-500 text-sm'>
            Home
          </Link>
        </li>
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join("/")}`;
          const isLast = index === pathnames.length - 1;
          return (
            <li key={to} className='flex items-center'>
              <span className='mx-2'>/</span>
              {isLast ? (
                <span className='text-color-1 dark:text-text-dark'>
                  {" "}
                  {findRouteName(value, routesForRole)}
                </span>
              ) : (
                <Link to={to} className='hover:underline text-gray-500 text-sm'>
                  {findRouteName(value, routesForRole)}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
