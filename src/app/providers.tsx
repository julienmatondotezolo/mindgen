import { SessionProvider } from "next-auth/react";
import { JSX, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { RecoilRoot } from "recoil";

type Props = {
  children?: ReactNode;
};

const queryClient = new QueryClient();

export default function Providers({ children }: Props): JSX.Element {
  return (
    <RecoilRoot>
      <QueryClientProvider client={queryClient}>
        <SessionProvider>{children}</SessionProvider>
      </QueryClientProvider>
    </RecoilRoot>
  );
}
