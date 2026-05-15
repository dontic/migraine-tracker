import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { authMePartialUpdate } from "@/api/django/auth/auth";
import { useUserStore } from "@/stores/UserStore";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

const usernameSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .max(150, "Username must be 150 characters or fewer")
    .regex(/^[\w.@+-]+$/, "Letters, digits and @/./+/-/_ only"),
});

type UsernameFormValues = z.infer<typeof usernameSchema>;

const UsernameForm = () => {
  const { user, setUser } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<UsernameFormValues>({
    resolver: zodResolver(usernameSchema),
    defaultValues: { username: user?.username ?? "" },
  });

  const onSubmit = async (values: UsernameFormValues) => {
    try {
      setIsLoading(true);
      const updated = await authMePartialUpdate({ username: values.username });
      setUser(updated);
      toast.success("Username updated.");
    } catch (error: any) {
      const msg = error?.response?.data?.username?.[0];
      if (msg) {
        form.setError("username", { message: msg });
      } else {
        toast.error("Failed to update username.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Username</CardTitle>
        <CardDescription>Change your login username.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent>
            <FormField
              control={form.control}
              name="username"
              required
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input autoComplete="username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="justify-center pt-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default UsernameForm;
