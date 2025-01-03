// Importing Ably
import Spaces from "@ably/spaces";
import * as Ably from "ably";
import { AblyProvider, ChannelProvider } from "ably/react";
import { enablePatches } from "immer";
import { nanoid } from "nanoid";
import { SessionProvider } from "next-auth/react";
import { NextIntlClientProvider } from "next-intl";
import { ThemeProvider } from "next-themes";
import React, { JSX, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactFlowProvider } from "reactflow";
import { RecoilRoot } from "recoil";

// Manually import messages for each locale
import enMessages from "../../messages/en.json";
import frMessages from "../../messages/fr.json";
import nlMessages from "../../messages/nl.json";

type Props = {
  children?: ReactNode;
  locale: string;
};

const ABLY_API_KEY: string | undefined = process.env.NEXT_PUBLIC_ABLY_API_KEY;

// Connect to Ably using the AblyProvider component and your API key
export const ablyClient = new Ably.Realtime({ clientId: nanoid(), key: ABLY_API_KEY });
const queryClient = new QueryClient();

// Function to select the correct messages based on the locale
function selectMessages(locale: string) {
  switch (locale) {
    case "nl":
      return nlMessages;
    case "fr":
      return frMessages;
    // ... add cases for other locales as needed
    default:
      return enMessages; // Default to English messages
  }
}

enablePatches();

// Initialize Spaces
export const spaces = new Spaces(ablyClient);

export default function Providers({ children, locale }: Props): JSX.Element {
  // const messages = useMessages();
  const timeZone = "Europe/Brussels";
  const messages = selectMessages(locale);

  return (
    <SessionProvider>
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <NextIntlClientProvider locale={locale} messages={messages} timeZone={timeZone}>
              <AblyProvider client={ablyClient}>
                <ChannelProvider channelName={"mindgen-socket"}>
                  <ReactFlowProvider>{children}</ReactFlowProvider>
                </ChannelProvider>
              </AblyProvider>
            </NextIntlClientProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </RecoilRoot>
    </SessionProvider>
  );
}
