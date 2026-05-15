import { useEffect, useState } from "react";
import { useLocation, Navigate, Outlet } from "react-router-dom";

import { useUserStore } from "@/stores/UserStore";
import { authMeRetrieve } from "@/api/django/auth/auth";

const ProtectedLayout = () => {
  const location = useLocation();
  const { setUser, user } = useUserStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      if (user) {
        setIsAuthenticated(true);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const userDetails = await authMeRetrieve({ signal: controller.signal });

        console.debug("User logged in:", userDetails);
        setUser(userDetails);
        setIsAuthenticated(true);
      } catch (error: any) {
        if (error.name !== "AbortError" && error.name !== "CanceledError") {
          console.debug("User not logged in:", error);
          setIsAuthenticated(false);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      controller.abort();
    };
  }, [user, setUser]);

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        Loading...
      </div>
    );
  }

  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

export default ProtectedLayout;
