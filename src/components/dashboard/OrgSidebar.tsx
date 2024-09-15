"use client";

import { CirclePlus, LayoutDashboard, Settings, Star } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useIsMutating, useQuery, useQueryClient } from "react-query";
import { useRecoilState } from "recoil";

import { fetchOrganization } from "@/_services";
import { Organization } from "@/_types/Organization";
import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Skeleton } from "@/components/ui";
import { organizationSettingsState, organizationState, selectedOrganizationState } from "@/state";
import { uppercaseFirstLetter } from "@/utils";

import { Link } from "../../navigation";

export function OrgSidebar() {
  const text = useTranslations("Index");
  const textOrga = useTranslations("Organization");

  const searchParams = useSearchParams();

  const favourites = searchParams.get("favourites");

  const [isOpen, setIsOpen] = useRecoilState(organizationState);
  const [isOpenSettings, setIsOpenSettings] = useRecoilState(organizationSettingsState);

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  const handleSettingsClick = () => {
    setIsOpenSettings(!isOpenSettings);
  };

  const [selectedOrganization, setSelectedOrganization] = useRecoilState<Organization | undefined>(
    selectedOrganizationState,
  );

  const queryClient = useQueryClient();

  const fetchUserOrganizations = () => fetchOrganization();
  const { isLoading, data: userOrganizations } = useQuery("userOrganizations", fetchUserOrganizations, {
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    onSuccess: (data) => {
      if (data.length > 0) {
        const savedOrganization = localStorage.getItem("selected-organization");

        if (savedOrganization) {
          setSelectedOrganization(JSON.parse(savedOrganization)); // Load from local storage
        } else {
          setSelectedOrganization(data[0]); // Save the first organization
        }
      }
    },
  });

  const handleSelectChange = (value: string) => {
    const selectedOrg = userOrganizations.find((org: Organization) => org.name === value);

    if (selectedOrg) {
      console.log("selectedOrg:", selectedOrg.id);
      setSelectedOrganization(selectedOrg);
    } else {
      setSelectedOrganization(userOrganizations[0]);
    }

    queryClient.invalidateQueries("userMindmap");
  };

  const isCreatingOrga = useIsMutating({ mutationKey: "CREATE_ORGANIZATION" });

  if (isLoading) return <>Loading...</>;

  if (selectedOrganization)
    return (
      <div className="hidden lg:flex flex-col space-y-4 w-[206px]">
        {isCreatingOrga ? (
          <Skeleton className="w-full h-10 bg-grey-blue" />
        ) : (
          <Select value={selectedOrganization.name || ""} onValueChange={handleSelectChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Organization" />
            </SelectTrigger>
            <SelectContent className="cursor-pointer bg-white border-2 shadow-lg backdrop-filter backdrop-blur-lg dark:bg-slate-900 dark:bg-opacity-70 dark:shadow-slate-900 dark:border-slate-800">
              {userOrganizations.map((organization: Organization) => (
                <SelectItem key={organization.id} value={organization.name} className="cursor-pointer py-4">
                  <p>{organization.name}</p>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Button onClick={handleClick}>
          <span className=" text-base mr-2">
            <CirclePlus size={18} />
          </span>
          {`${uppercaseFirstLetter(text("create"))} ${textOrga("organization")}`}
        </Button>
        <Button onClick={handleSettingsClick} variant="board">
          <span className=" text-base mr-2">
            <Settings size={18} />
          </span>
          {`${uppercaseFirstLetter(text("settings"))}`}
        </Button>

        <div className="!mt-14 w-full h-full">
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
