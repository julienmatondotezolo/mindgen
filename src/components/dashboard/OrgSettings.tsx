import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useRecoilValue, useSetRecoilState } from "recoil";

import { deleteOrganizationById, getOrganizationById, updateOrganization } from "@/_services";
import { Organization } from "@/_types/Organization";
import { Button, Input, Skeleton } from "@/components/ui";
import { organizationSettingsState, selectedOrganizationState } from "@/state";
import { uppercaseFirstLetter } from "@/utils";

function OrgSettings() {
  const queryClient = useQueryClient();

  const text = useTranslations("Index");
  const textOrga = useTranslations("Organization");
  const textProfile = useTranslations("Profile");

  // Initialize state for title and description
  const [inputTitle, setInputTitle] = useState("");

  // Update state when input changes
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputTitle(e.target.value);
  };

  const isOrgaSettings = useRecoilValue(organizationSettingsState);

  const selectedOrga = useRecoilValue<Organization | undefined>(selectedOrganizationState);
  const setOrgaSettings = useSetRecoilState(organizationSettingsState);

  const fetchOrgaById = () => getOrganizationById({ organizationId: selectedOrga!.id });

  const { isLoading, data: userOrgaData } = useQuery("userOrgaById", fetchOrgaById, {
    enabled: isOrgaSettings,
    onSuccess: (data: Organization) => {
      if (data) {
        setInputTitle(data.name);
      }
    },
  });

  const updateOrgaMutation = useMutation(updateOrganization, {
    onSuccess: () => {
      // Optionally, invalidate or refetch other queries to update the UI
      queryClient.invalidateQueries("userOrgaById");
      queryClient.invalidateQueries("userOrganizations");
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newOrgaObject = {
      name: inputTitle,
      type: "PERSONAL",
    };

    updateOrgaMutation.mutate({
      organizationId: selectedOrga!.id,
      organizationObject: newOrgaObject,
    });
  };

  const deleteOrgaMutation = useMutation(deleteOrganizationById, {
    onSuccess: async () => {
      await queryClient.invalidateQueries("userOrgaById");
      await queryClient.invalidateQueries("userOrganizations");
    },
  });

  const handleDeleteOrga = async () => {
    try {
      deleteOrgaMutation.mutate({
        organizationId: selectedOrga!.id,
      });

      localStorage.removeItem("selected-organization");
      setOrgaSettings(false);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`An error has occurred: ${error.message}`);
      }
    }
  };

  return (
    <div className="w-full">
      <p className="font-bold text-lg pb-4 border-b dark:border-slate-800">{uppercaseFirstLetter(text("general"))}</p>
      {isLoading && (
        <div className="space-y-4">
          <Skeleton className=" mt-12 w-full h-24 bg-grey-blue" />
          <Skeleton className=" mt-12 w-full h-24 bg-grey-blue" />
          <Skeleton className=" mt-12 w-full h-24 bg-grey-blue" />
        </div>
      )}
      {userOrgaData && (
        <div className="text-sm w-full mt-8 p-6 rounded-2xl bg-[#f3f5f7] dark:bg-slate-500 dark:bg-opacity-20 pb-4 border-b dark:border-slate-800">
          <form onSubmit={handleSubmit} className="flex pb-4 border-b dark:border-slate-800">
            <p className="mr-4">{`${textProfile("update")} ${text("name")}:`}</p>
            <section className="space-y-4">
              {/* <p className="text-grey dark:text-grey-blue text-sm mb-2">{text("name")}</p> */}
              <Input
                type="text"
                placeholder={`${uppercaseFirstLetter(textOrga("organization"))} ${text("name").toLowerCase()}`}
                value={inputTitle}
                onChange={handleTitleChange}
              />
              <Button type="submit" disabled={updateOrgaMutation.isLoading}>
                {updateOrgaMutation.isLoading ? text("loading") : uppercaseFirstLetter(text("save"))}
              </Button>
            </section>
          </form>
          <article className="flex py-4 border-b dark:border-slate-800">
            <p className="mr-4">{`${uppercaseFirstLetter(text("leave"))} ${textOrga("organization")}:`}</p>
            <p className="cursor-pointer font-semibold text-red-500">
              {`${uppercaseFirstLetter(text("leave"))} ${textOrga("organization")}`}
            </p>
          </article>
          <article className="flex py-4">
            <p className="mr-4">{`${uppercaseFirstLetter(text("remove"))} ${textOrga("organization")}:`}</p>
            <button
              onClick={() => handleDeleteOrga()}
              disabled={deleteOrgaMutation.isLoading}
              className={`cursor-pointer font-semibold text-red-500 ${deleteOrgaMutation.isLoading && "opacity-50"}`}
            >
              {deleteOrgaMutation.isLoading
                ? `${uppercaseFirstLetter(text("loading"))}...`
                : `${uppercaseFirstLetter(text("remove"))} ${textOrga("organization")}`}
            </button>
          </article>
        </div>
      )}
    </div>
  );
}

export { OrgSettings };
