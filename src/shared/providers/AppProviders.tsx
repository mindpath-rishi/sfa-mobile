import React from "react";
import { QueryProvider } from "@/shared/providers/QueryProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <QueryProvider>{children}</QueryProvider>;
}
