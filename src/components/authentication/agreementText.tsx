import { useTranslations } from "next-intl";
import React from "react";

import { Link } from "@/navigation";

function AgreementText() {
  const authText = useTranslations("Auth");

  return (
    <p className="px-8 text-center text-sm text-muted-foreground">
      {authText("clickAgreement")}{" "}
      <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
        {authText("termsOfService")}
      </Link>{" "}
      &{" "}
      <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
        {authText("privacyPolicy")}
      </Link>
      .
    </p>
  );
}

export { AgreementText };
