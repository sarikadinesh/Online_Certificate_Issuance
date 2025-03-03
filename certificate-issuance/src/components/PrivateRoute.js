import { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

const PrivateRoute = ({ component: Component, requiredRole }) => {
  const { user } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1000); 
  }, []);

  if (isLoading) {
    return <p>Loading...</p>; 
  }

  if (!user) {
    return <Navigate to="/login" />; 
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" />;
  }

  return <Component />;
};

export default PrivateRoute;
