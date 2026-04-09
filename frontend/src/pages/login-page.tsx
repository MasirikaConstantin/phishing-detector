import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { login } from "@/lib/api";

const schema = z.object({
  username: z.string().min(3),
  password: z.string().min(8),
});

type Values = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { login: loginLocally } = useAuth();
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { username: "admin", password: "Admin123!" } });

  const mutation = useMutation({
    mutationFn: (values: Values) => login(values.username, values.password),
    onSuccess: (payload) => {
      loginLocally(payload);
      toast.success("Connexion établie.");
      navigate("/admin");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <AppShell>
      <section className="container py-16">
        <Card className="mx-auto max-w-lg">
          <CardHeader>
            <CardTitle>Connexion administrateur</CardTitle>
            <CardDescription>Accès au dashboard global et aux statistiques consolidées.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form className="space-y-5" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom d'utilisateur</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mot de passe</FormLabel>
                      <FormControl><Input type="password" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={mutation.isPending}>Se connecter</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
