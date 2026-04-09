import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;
const TabsList = ({ className, ...props }: TabsPrimitive.TabsListProps) => (
  <TabsPrimitive.List className={cn("inline-flex rounded-2xl bg-muted p-1", className)} {...props} />
);
const TabsTrigger = ({ className, ...props }: TabsPrimitive.TabsTriggerProps) => (
  <TabsPrimitive.Trigger
    className={cn("rounded-xl px-4 py-2 text-sm text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground", className)}
    {...props}
  />
);
const TabsContent = ({ className, ...props }: TabsPrimitive.TabsContentProps) => (
  <TabsPrimitive.Content className={cn("mt-6", className)} {...props} />
);

export { Tabs, TabsContent, TabsList, TabsTrigger };
