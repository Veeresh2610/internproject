import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { roleRoutes, RouteItem } from "./routeConfig";
import Login from "../pages/login/loginPage";
import { VerticalLayout, HorizontalLayout } from "../components/Layout/index";
import { useLayout } from "../contexts/LayoutContext";
import { LocalStorageHelper } from "../utils/localStorageHelper";
import ForgotPasswordPage from "../pages/login/forgotPassword";


// import MainPage from "../pages/mainPage";

const ProtectedRoute: React.FC<{
  element: React.ReactElement;
  roles?: string[];
}> = ({ element }) => {
  const { isAuthenticated, setApplicationRole } = useAuth();

  // console.log('applicationRole:', applicationRole);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (isAuthenticated && !localStorage.getItem("role")) {
    LocalStorageHelper.setObject("role", "main");
    setApplicationRole("main");
    return <Navigate to="/" replace />;
  }
  return element;
};

const renderRoutes = (
  routes: RouteItem[],
  parentPath: string = ""
): React.ReactNode => {
  return routes.map((route) => {
    const fullPath = `${parentPath}/${route.href}`.replace(/\/+/g, "/");
    const hasNamedChildren =
      route.subItems &&
      route.subItems.length > 0 &&
      route.subItems.some(
        (s) => s.name !== "" && s.name !== "Create" && s.name !== "Update" && !s.hidden
      );

    return (
      <Route
        key={fullPath}
        path={fullPath}
        element={
          <ProtectedRoute
            element={hasNamedChildren ? <Outlet /> : <route.element />}
            roles={route.roles}
          />
        }
      >
        {/* If this route has named sub-routes, add parent's component as index */}
        {hasNamedChildren && (
          <Route index element={<route.element />} />
        )}
        {/* Render named sub-route children */}
        {route.subItems && renderRoutes(route.subItems, fullPath)}
        {/* Legacy: index for routes with empty subItems array */}
        {route.subItems && route.subItems.length === 0 && (
          <Route index element={<route.element />} />
        )}
      </Route>
    );
  });
};

const AppRoutes: React.FC = () => {
  const { layout } = useLayout();
  const { isAuthenticated, applicationRole } = useAuth();
  // const [applicationRole, setApplicationRole] = React.useState<string>(() => {
  //   const savedRole = localStorage.getItem(AUTH_APPLICATION_ROLE);
  //   return savedRole ? savedRole : 'main';
  // });
  // Memoize routes based on the applicationRole to avoid unnecessary recalculations
  const routesForProduct = React.useMemo(() => {
    return roleRoutes[applicationRole as keyof typeof roleRoutes];
  }, [applicationRole]);

  const Layout =
    layout === "HORIZONTAL" || applicationRole === "main"
      ? HorizontalLayout
      : VerticalLayout;

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />

      <Route element={<Layout />}>
        {routesForProduct && renderRoutes(routesForProduct)}
      </Route>

      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
