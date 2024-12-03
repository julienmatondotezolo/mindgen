import { AnimatePresence, motion } from "framer-motion";
import { Mail, Shield, UserPlus, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { useMutation, useQueryClient } from "react-query";

import { createInvitations } from "@/_services";
import { CustomSession, Member, Organization } from "@/_types";
import {
  Button,
  Card,
  CardContent,
  CardFooter,
  Label,
  Skeleton,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Textarea,
} from "@/components/ui/";
import { uppercaseFirstLetter } from "@/utils";

interface OrgProps {
  userOrgaData: Organization | undefined;
  isLoading: boolean;
}

function OrgMembers({ userOrgaData, isLoading }: OrgProps) {
  const session = useSession();
  const safeSession: any = session ? (session as unknown as CustomSession) : null;

  const queryClient = useQueryClient();

  const text = useTranslations("Index");
  const textAuth = useTranslations("Auth");
  const textMember = useTranslations("Member");

  const members = userOrgaData?.members;

  const currentUserid = safeSession?.data.session.user.id;

  const currentMember: Member | undefined = userOrgaData?.members.filter((member) => member.userId == currentUserid)[0];

  const [openInvite, setOpenInvite] = useState(false);
  const [textAreaValue, setTextAreaValue] = useState("");
  const [memberState, setMemberState] = useState("ADMIN");

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextAreaValue(e.target.value);
  };

  const handleMemberRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMemberState(e.target.value);
  };

  function isValidEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return regex.test(email);
  }

  const createInvMutation = useMutation(createInvitations, {
    onSuccess: () => {
      queryClient.invalidateQueries("userOrgaById");
      queryClient.invalidateQueries("userOrganizations");
      setOpenInvite(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const emails = textAreaValue.split(",").map((email) => email.trim());
    const allValid = emails.every(isValidEmail);

    if (allValid && memberState) {
      const newOrgaObject = {
        organizationId: userOrgaData?.id,
        emails: emails,
        role: memberState,
      };

      createInvMutation.mutate({
        session: safeSession,
        invitationObject: newOrgaObject,
      });

      setTextAreaValue("");
      setMemberState("ADMIN");
    } else {
      alert("Please enter valid email(s).");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <motion.div className="w-full" initial="hidden" animate="visible" variants={containerVariants}>
      <motion.div className="flex items-center space-x-3 pb-4 border-b dark:border-slate-800" variants={itemVariants}>
        <Users className="w-6 h-6 text-primary" />
        <p className="font-bold text-lg">{uppercaseFirstLetter(text("members"))}</p>
      </motion.div>

      <article className="relative overflow-hidden h-[475px]">
        <section>
          {isLoading && (
            <div className="space-y-4 mt-8">
              <Skeleton className="w-full h-24 bg-grey-blue animate-pulse" />
              <Skeleton className="w-full h-24 bg-grey-blue animate-pulse" />
              <Skeleton className="w-full h-24 bg-grey-blue animate-pulse" />
            </div>
          )}

          <AnimatePresence>
            {userOrgaData && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {openInvite ? (
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    transition={{ type: "spring", duration: 0.5 }}
                  >
                    <Card className="mt-8 border dark:border-slate-800 shadow-lg transition-shadow hover:shadow-xl">
                      <form onSubmit={handleSubmit}>
                        <CardContent>
                          <div className="grid w-full items-center pt-6 gap-4">
                            <div className="flex flex-col space-y-1.5">
                              <Label htmlFor="name" className="flex items-center space-x-2">
                                <UserPlus className="w-4 h-4 text-primary" />
                                <span>{textMember("inviteMembers")}</span>
                              </Label>
                              <p className="text-xs text-neutral-500">{textMember("inviteMembersText")}</p>
                              <Textarea
                                id="description"
                                value={textAreaValue}
                                className="h-[100px] transition-all duration-300 focus:ring-2 focus:ring-primary"
                                onChange={handleTextAreaChange}
                                placeholder="example@email.com, example2@email.com"
                                required
                              />
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="flex items-end justify-between">
                          <div className="flex flex-col space-y-1.5">
                            <select
                              className="bg-transparent border p-2 rounded-lg text-sm transition-all duration-300 focus:ring-2 focus:ring-primary hover:border-primary"
                              value={memberState ?? ""}
                              onChange={(e) => handleMemberRoleChange(e)}
                              required
                            >
                              <option value="ADMIN">{textMember("admin")}</option>
                              <option value="MEMBER">{uppercaseFirstLetter(textMember("member"))}</option>
                              <option value="GUEST">{textMember("guest")}</option>
                            </select>
                          </div>
                          <div className="space-x-2">
                            <Button
                              onClick={() => setOpenInvite(false)}
                              variant="outline"
                              className="hover:bg-gray-100 dark:hover:bg-slate-800"
                            >
                              {text("cancel")}
                            </Button>
                            <Button type="submit" disabled={createInvMutation.isLoading} className="relative group">
                              <motion.div
                                className="absolute inset-0 bg-primary/20 rounded-lg"
                                animate={{ scale: createInvMutation.isLoading ? [1, 1.1, 1] : 1 }}
                                transition={{ duration: 1, repeat: createInvMutation.isLoading ? Infinity : 0 }}
                              />
                              <span className="relative z-10">
                                {createInvMutation.isLoading ? "Loading..." : "Send"}
                              </span>
                            </Button>
                          </div>
                        </CardFooter>
                      </form>
                    </Card>
                  </motion.div>
                ) : (
                  currentMember?.organizationRole == "OWNER" && (
                    <Button onClick={() => setOpenInvite(true)} className="mt-8 group">
                      <UserPlus className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                      {textMember("inviteMembers")}
                    </Button>
                  )
                )}

                <motion.div
                  className="text-sm w-full mt-8 p-6 rounded-2xl bg-[#f3f5f7] dark:bg-slate-500 dark:bg-opacity-20 border dark:border-slate-800 shadow-lg transition-shadow hover:shadow-xl"
                  variants={itemVariants}
                  layout
                >
                  <Table>
                    <TableCaption>A list of members in the organization</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4" />
                            <span>{textAuth("usernameInput")}</span>
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4" />
                            <span>{textAuth("mailInput")}</span>
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="flex items-center space-x-2">
                            <Shield className="w-4 h-4" />
                            <span>Role</span>
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {members?.map((member) => (
                        <TableRow
                          key={member.memberId}
                          className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <TableCell className="font-medium">{member.username}</TableCell>
                          <TableCell>{member.email}</TableCell>
                          <TableCell>{member.organizationRole}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" className="hover:text-red-500 transition-colors">
                              Delete member
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </article>
    </motion.div>
  );
}

export { OrgMembers };
