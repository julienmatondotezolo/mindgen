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
import { checkPermission, uppercaseFirstLetter } from "@/utils";

interface OrgProps {
  userOrgaData: Organization | undefined;
  isLoading: boolean;
}

function OrgMembers({ userOrgaData, isLoading }: OrgProps) {
  const session = useSession();
  const safeSession = session ? (session as unknown as CustomSession) : null;

  const queryClient = useQueryClient();

  const text = useTranslations("Index");
  const textAuth = useTranslations("Auth");
  const textMember = useTranslations("Member");

  const members = userOrgaData?.members;

  const currentUserid = safeSession?.data.session.user.id;

  const currentMember: Member | undefined = userOrgaData?.members.filter((member) => member.userId == currentUserid)[0];

  // Open inviation
  const [openInvite, setOpenInvite] = useState(false);

  // Initialize state for title and description
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
    onSuccess: (data) => {
      console.log("data:", data);
      // Optionally, invalidate or refetch other queries to update the UI
      queryClient.invalidateQueries("userOrgaById");
      queryClient.invalidateQueries("userOrganizations");
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

      // updateOrgaMutation.mutate({
      //   organizationId: selectedOrga!.id,
      //   organizationObject: newOrgaObject,
      // });
    } else {
      alert("Please enter valid email(s).");
    }
  };

  return (
    <div className="w-full">
      <p className="font-bold text-lg pb-4 border-b dark:border-slate-800">{uppercaseFirstLetter(text("members"))}</p>
      <article className="relative overflow-scroll h-[475px]">
        <section>
          {isLoading && (
            <div className="space-y-4">
              <Skeleton className=" mt-12 w-full h-24 bg-grey-blue" />
              <Skeleton className=" mt-12 w-full h-24 bg-grey-blue" />
              <Skeleton className=" mt-12 w-full h-24 bg-grey-blue" />
            </div>
          )}
          {userOrgaData && (
            <>
              {openInvite ? (
                <Card className="mt-8">
                  <form onSubmit={handleSubmit}>
                    <CardContent>
                      <div className="grid w-full items-center pt-6 gap-4">
                        <div className="flex flex-col space-y-1.5">
                          <Label htmlFor="name">{textMember("inviteMembers")}</Label>
                          <p className="text-xs text-neutral-500">{textMember("inviteMembersText")}</p>
                          <Textarea
                            id="description"
                            value={textAreaValue}
                            className=" h-[100px]"
                            onChange={handleTextAreaChange}
                            placeholder="example@email.com, exmaple2@email.com"
                            required
                          />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex items-end justify-between">
                      <div className="flex flex-col space-y-1.5">
                        <select
                          className="bg-transparent border p-2 rounded-lg text-sm"
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
                        <Button onClick={() => setOpenInvite(false)} variant="outline">
                          {text("cancel")}
                        </Button>
                        <Button type="submit" disabled={createInvMutation.isLoading}>
                          {createInvMutation.isLoading ? "Loading..." : "Send"}
                        </Button>
                      </div>
                    </CardFooter>
                  </form>
                </Card>
              ) : (
                currentMember?.organizationRole == "OWNER" && (
                  <Button onClick={() => setOpenInvite(true)} className="mt-8" type="submit">
                    {textMember("inviteMembers")}
                  </Button>
                )
              )}
              <div className="text-sm w-full mt-8 p-6 rounded-2xl bg-[#f3f5f7] dark:bg-slate-500 dark:bg-opacity-20 pb-4 border-b dark:border-slate-800">
                <Table>
                  <TableCaption>A list of members in the organizations</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">{textAuth("usernameInput")}</TableHead>
                      <TableHead>{textAuth("mailInput")}</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">{text("remove")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members?.map((member) => (
                      <TableRow key={member.memberId}>
                        <TableCell className="font-medium">{member.username}</TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>{member.organizationRole}</TableCell>
                        <TableCell className="text-right">Delete member</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </section>
      </article>
    </div>
  );
}

export { OrgMembers };
