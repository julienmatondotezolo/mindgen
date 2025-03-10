/* eslint-disable no-unused-vars */
"use client";

import { AlertCircle, CheckCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import React, { createContext, ReactNode, useContext } from "react";

import { toast } from "@/components/ui/use-toast";

// Types for the context
type MessageStatus = "success" | "error";

interface MessageContextType {
  showMessage: (status: MessageStatus, description?: string) => void;
}

// Create the context
const MessageContext = createContext<MessageContextType | undefined>(undefined);

interface MessageProviderProps {
  children: ReactNode;
}

export function MessageProvider({ children }: MessageProviderProps) {
  const responseMessageText = useTranslations("ResponseMessage");
  const responseMessagesCode = useTranslations("ResponseMesssagesCode");
  // Function to show a message using the toast system
  const showMessage = (status: MessageStatus, description?: string) => {
    toast({
      title: responseMessageText(status),
      variant: status === "error" ? "destructive" : "default",
      action: (
        <>
          {status === "success" ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
        </>
      ),
      description: responseMessagesCode(description),
    });
  };

  const value = {
    showMessage,
  };

  return <MessageContext.Provider value={value}>{children}</MessageContext.Provider>;
}

// Hook to use the message context
export function useMessage() {
  const context = useContext(MessageContext);

  if (context === undefined) {
    throw new Error("useMessage must be used within a MessageProvider");
  }
  return context;
}
