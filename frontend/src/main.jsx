import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";

import LoginPage from "./pages/LoginPage/LoginPage";
import MainPage from "./pages/MainPage/MainPage";
import CustomerPage from "./pages/CustomerPage/CustomerPage"
import CustomerViewRequest from "./pages/CustomerViewRequest/CustomerViewRequest";


import PasswordResetPage from "./pages/PasswordResetPage/PasswordResetPage";
import RegisterPage from "./pages/RegisterPage/RegisterPage";
import EmployeePage from "./pages/EmployeePage/EmployeePage";
import TechnicalPage from "./pages/TechnicalPage/TechnicalPage";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainPage />,
  },
  {
    path: "login",
    element: <LoginPage />,
  },
  {
    path: "customerDashboard",
    element: <CustomerViewRequest /> 
  },

  {
    path: "resetPasswordPage",
    element: <PasswordResetPage />,
  },
  {
    path: "register",
    element: <RegisterPage />,
  },
  {
    path: "employeeDashboard",
    element: <EmployeePage />,
  },
  {
    path: "technicianDashboard",
    element: <TechnicalPage />,
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
