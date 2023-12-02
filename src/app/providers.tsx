"use client";

import { SessionProvider } from "next-auth/react";
import { JSX, ReactNode } from "react";

type Props = {
  children?: ReactNode;
};

export const Providers = ({ children }: Props): JSX.Element => <SessionProvider>{children}</SessionProvider>;
