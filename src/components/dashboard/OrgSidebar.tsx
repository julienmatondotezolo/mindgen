"use client";

import { CirclePlus, Settings } from "lucide-react";
import { useTranslations } from "next-intl";
import { useIsMutating, useQuery, useQueryClient } from "react-query";
import { useRecoilState } from "recoil";
import { motion, AnimatePresence } from "framer-motion";

import { fetchOrganization } from "@/_services";
import { Organization } from "@/_types/Organization";
import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Skeleton } from "@/components/ui";
import { organizationSettingsState, organizationState, selectedOrganizationState } from "@/state";
import { uppercaseFirstLetter } from "@/utils";

export function OrgSidebar() {
  const text = useTranslations("Index");
  const textOrga = useTranslations("Organization");

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
      if (data) {
        const savedOrganization = localStorage.getItem("selected-organization");

        if (savedOrganization === undefined) {
          setSelectedOrganization(JSON.parse(savedOrganization));
        } else {
          setSelectedOrganization(data[0]);
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

    queryClient.invalidateQueries("userMindmap");
  };

  const isCreatingOrga = useIsMutating({ mutationKey: "CREATE_ORGANIZATION" });

  if (isLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="hidden lg:flex flex-col space-y-4"
      >
        <Skeleton className="w-full h-10 bg-grey-blue/30 rounded-xl animate-pulse" />
        <Skeleton className="w-full h-10 bg-grey-blue/30 rounded-xl animate-pulse" />
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="hidden lg:flex flex-col space-y-4"
    >
      <AnimatePresence mode="wait">
        {isCreatingOrga ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Skeleton className="w-full h-10 bg-grey-blue/30 rounded-xl" />
          </motion.div>
        ) : (
          <motion.div
            key="select"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full"
          >
            <Select value={selectedOrganization?.name || ""} onValueChange={handleSelectChange}>
              <SelectTrigger className="w-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg border-2 border-primary-color/10 hover:border-primary-color/30 transition-all duration-300">
                <SelectValue placeholder="Select organization" />
              </SelectTrigger>
              <SelectContent className="cursor-pointer bg-white/80 border-2 shadow-lg backdrop-blur-lg dark:bg-slate-900/80 dark:shadow-slate-900/30 dark:border-slate-800 animate-in fade-in-0 zoom-in-95">
                {userOrganizations?.map((organization: Organization) => (
                  <SelectItem 
                    key={organization.id} 
                    value={organization.name} 
                    className="cursor-pointer py-4 hover:bg-primary-color/5 transition-colors duration-200"
                  >
                    <p>{organization.name}</p>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full"
      >
        <Button 
          onClick={handleClick}
          className="w-full bg-primary-color hover:opacity-90 transition-all duration-300 group"
        >
          <motion.span 
            className="text-base mr-2"
            animate={{ rotate: isOpen ? 135 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <CirclePlus size={18} />
          </motion.span>
          <span className="font-medium">
            {`${uppercaseFirstLetter(text("create"))} ${textOrga("organization")}`}
          </span>
        </Button>
      </motion.div>

      <AnimatePresence>
        {selectedOrganization && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full"
          >
            <Button 
              onClick={handleSettingsClick} 
              variant="board"
              className="w-full border-2 border-primary-color/10 hover:border-primary-color/30 dark:bg-slate-800/50 backdrop-blur-lg group"
            >
              <motion.span 
                className="text-base mr-2"
                animate={{ rotate: isOpenSettings ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <Settings size={18} className="group-hover:text-primary-color transition-colors duration-300" />
              </motion.span>
              <span className="font-medium group-hover:text-primary-color transition-colors duration-300">
                {`${uppercaseFirstLetter(text("settings"))}`}
              </span>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
