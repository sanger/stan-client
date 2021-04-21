import React, { createContext } from "react";
import { Maybe } from "../types/sdk";
import { StanConfig } from "../types/stan";

export const configContext = createContext<Maybe<StanConfig>>(null);
const { Provider } = configContext;

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  return <Provider value={window.STAN_CONFIG ?? null}>{children}</Provider>;
}
