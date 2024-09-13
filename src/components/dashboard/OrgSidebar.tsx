"use client";

import { CirclePlus, LayoutDashboard, Star } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useQuery } from "react-query";
import { useRecoilState } from "recoil";

import { fetchOrganization } from "@/_services";
import { CustomSession } from "@/_types";
import { Organization } from "@/_types/Organization";
import { Button } from "@/components/ui/button";
import { organizationState, selectedOrganizationState } from "@/state";
import { uppercaseFirstLetter } from "@/utils";

import { Link } from "../../navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui";

export function OrgSidebar() {
  const session = useSession();

  const text = useTranslations("Index");
  const textOrga = useTranslations("Organization");

  const searchParams = useSearchParams();

  const favourites = searchParams.get("favourites");

  const [isOpen, setIsOpen] = useRecoilState(organizationState);

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  const [selectedOrganization, setSelectedOrganization] = useRecoilState<Organization | undefined>(
    selectedOrganizationState,
  );

  const safeSession = session ? (session as unknown as CustomSession) : null;

  const fetchUserMindmaps = () => fetchOrganization({ session: safeSession });
  const { isLoading, data: userOrganizations } = useQuery("userOrganizations", fetchUserMindmaps, {
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    onSuccess: (data) => {
      if (data.length > 0) {
        const savedOrganization = localStorage.getItem("selected-organization");

        if (savedOrganization) {
          setSelectedOrganization(JSON.parse(savedOrganization)); // Load from local storage
        } else if (data.length > 0) {
          setSelectedOrganization(data[0]); // Save the first organization
        }
      }
    },
  });

  const handleSelectChange = (value: string) => {
    const selectedOrg = userOrganizations.find((org: Organization) => org.name === value);

    if (selectedOrg) {
      setSelectedOrganization(selectedOrg);
    } else {
      setSelectedOrganization(userOrganizations[0]);
    }
  };

  if (isLoading) return <>Loading...</>;

  if (selectedOrganization)
    return (
      <div className="hidden lg:flex flex-col space-y-6 w-[206px]">
        <Select value={selectedOrganization.name || ""} onValueChange={handleSelectChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Organization" />
          </SelectTrigger>
          <SelectContent className="bg-white border-2 shadow-lg backdrop-filter backdrop-blur-lg dark:bg-slate-900 dark:bg-opacity-70 dark:shadow-slate-900 dark:border-slate-800">
            {userOrganizations.map((organization: Organization) => (
              <SelectItem key={organization.id} value={organization.name} className="py-4">
                {organization.name}
              </SelectItem>
            ))}
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
