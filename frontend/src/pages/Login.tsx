import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { authLoginCreate } from "@/api/django/auth/auth";
import { useUserStore } from "@/stores/UserStore";
import RedirectIfAuthenticatedLayout from "@/layouts/RedirectIfAuthenticatedLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/assets/icon.svg?react";

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useUserStore();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      const user = await authLoginCreate({ username, password });
      setUser(user);
      navigate("/");
    } catch (error: any) {
      if (error?.response?.status === 400 || error?.response?.status === 401) {
        toast.error("Invalid username or password.");
      } else {
        toast.error("Something went wrong. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <RedirectIfAuthenticatedLayout>
      <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="w-full max-w-sm">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-2">
              <Icon className="h-[50px]" />
              <h1 className="text-xl font-bold">Welcome to Migraine Tracker</h1>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </RedirectIfAuthenticatedLayout>
  );
};

export default Login;
