// Create: ProtectedRoute.jsx
import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";

const ProtectedRoute = ({ children }) => {
  const { isLoggedin, isLoading } = useContext(ShopContext);

  if (isLoading) {
    return <div>Loading...</div>; // Or your loading component
  }

  if (!isLoggedin) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
