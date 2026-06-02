/**
 * Shared render utility — wraps RTL render with any providers the app needs.
 * Use this instead of importing directly from @testing-library/react.
 */
import React from "react";
import { render, type RenderOptions } from "@testing-library/react";

function Providers({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function customRender(ui: React.ReactElement, options?: Omit<RenderOptions, "wrapper">) {
  return render(ui, { wrapper: Providers, ...options });
}

export * from "@testing-library/react";
export { customRender as render };
