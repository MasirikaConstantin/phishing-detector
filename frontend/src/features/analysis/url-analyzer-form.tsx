import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, ShieldAlert } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const schema = z.object({
  url: z
    .string()
    .min(4, "Veuillez saisir une URL.")
    .max(2048, "URL trop longue.")
    .refine((value) => /^https?:\/\/|^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(value), "URL invalide."),
});

export type UrlAnalyzerFormValues = z.infer<typeof schema>;

export function UrlAnalyzerForm({
  onSubmit,
  isPending,
  initialValue = "",
}: {
  onSubmit: (values: UrlAnalyzerFormValues) => void;
  isPending?: boolean;
  initialValue?: string;
}) {
  const form = useForm<UrlAnalyzerFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { url: initialValue },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL suspecte</FormLabel>
              <FormControl>
                <Input placeholder="https://exemple.com/login" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button type="submit" size="lg" disabled={isPending}>
            {isPending ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <ShieldAlert className="mr-2 h-4 w-4" />}
            Lancer l'analyse
          </Button>
          <p className="text-sm text-muted-foreground">
            La plateforme bloque les cibles locales et les réseaux privés avant toute requête.
          </p>
        </div>
      </form>
    </Form>
  );
}
