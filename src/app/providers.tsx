import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
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
        <SessionProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
          </ThemeProvider>
        </SessionProvider>
      </QueryClientProvider>
    </RecoilRoot>
  );
}
