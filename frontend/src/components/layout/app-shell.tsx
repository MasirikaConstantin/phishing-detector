import type { PropsWithChildren } from "react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-mesh">
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
