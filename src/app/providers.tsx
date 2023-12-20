import { SessionProvider } from "next-auth/react";
import { JSX, ReactNode } from "react";
import { RecoilRoot } from "recoil";

type Props = {
  children?: ReactNode;
};

export default function Providers({ children }: Props): JSX.Element {
  return (
    <RecoilRoot>
      <SessionProvider>{children}</SessionProvider>
    </RecoilRoot>
  );
}
