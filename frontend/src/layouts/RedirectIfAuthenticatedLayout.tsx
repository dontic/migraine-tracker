import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { authMeRetrieve } from "@/api/django/auth/auth";

interface Props {
  children: React.ReactNode;
}

const RedirectIfAuthenticatedLayout = ({ children }: Props) => {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();

    const fetchUserData = async () => {
      setIsLoading(true);

      try {
        await authMeRetrieve({ signal: controller.signal });
        setIsLoading(false);
        console.debug("User logged in, redirecting");
        navigate("/");
      } catch {
        console.debug("User not logged in");
        setIsLoading(false);
      }
    };

    fetchUserData();

    return () => {
      controller.abort();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        Loading...
      </div>
    );
  }

  return <div className="h-screen w-full">{children}</div>;
};

export default RedirectIfAuthenticatedLayout;
