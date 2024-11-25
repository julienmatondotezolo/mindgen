import { useTranslations } from "next-intl";

import { Button } from "@/components/ui";
import { Link } from "@/navigation";

export default function NotFoundPage() {
  const errorText = useTranslations("Error");

  return (
    <div>
      <h1>{errorText("pageNotFound")}</h1>
      <p>{errorText("pageNotFoundDescription")}</p>
      <Link href="/">
        <Button>{errorText("backHome")}</Button>
      </Link>
    </div>
  );
}
