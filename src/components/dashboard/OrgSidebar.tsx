"use client";

import { OrganizationSwitcher } from "@clerk/nextjs";
import { CirclePlus, LayoutDashboard, Star } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRecoilState } from "recoil";

import { Button } from "@/components/ui/button";
import { organizationState } from "@/state";
import { uppercaseFirstLetter } from "@/utils";

import { Link } from "../../navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui";

export function OrgSidebar() {
  const text = useTranslations("Index");
  const textOrga = useTranslations("Organization");

  const searchParams = useSearchParams();

  const favourites = searchParams.get("favourites");

  const [isOpen, setIsOpen] = useRecoilState(organizationState);

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="hidden lg:flex flex-col space-y-6 w-[206px]">
      <Select className="w-full">
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select Organization" />
        </SelectTrigger>
        <SelectContent className="bg-white">
          {/* Add options here */}
          <SelectItem value="org1">My Organization</SelectItem>
          <SelectItem value="org2">Organization 2</SelectItem>
          {/*  other options  */}
        </SelectContent>
      </Select>
      <Button className="mt-2" onClick={handleClick}>
        <span className=" text-base mr-2">
          <CirclePlus size={18} />
        </span>
        {`${uppercaseFirstLetter(text("create"))} ${textOrga("organization")}`}
      </Button>

      <div className="space-y-1 w-full">
        <Button variant="ghost" asChild size="lg" className="font-normal justify-start px-2 w-full">
          <Link href="/dashboard">
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Team Boards
          </Link>
        </Button>
        <Button
          variant={favourites ? "secondary" : "ghost"}
          asChild
          size="lg"
          className="font-normal justify-start px-2 w-full"
        >
          <Link
            href={{
              pathname: "/dashboard",
              query: {
                favourites: "true",
              },
            }}
          >
            <Star className="h-4 w-4 mr-2" />
            Favourite Boards
          </Link>
        </Button>
      </div>
    </div>
  );
}
