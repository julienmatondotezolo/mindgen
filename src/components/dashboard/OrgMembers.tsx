import { useTranslations } from "next-intl";
import React, { useState } from "react";

import { Organization } from "@/_types";
import {
  Button,
  Card,
  CardContent,
  CardFooter,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
  const text = useTranslations("Index");
  const textAuth = useTranslations("Auth");
  const textMember = useTranslations("Member");

  const members = userOrgaData?.members;

  // Open inviation
  const [openInvite, setOpenInvite] = useState(false);

  // Initialize state for title and description
  const [textAreaValue, setTextAreaValue] = useState("");

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextAreaValue(e.target.value);
  };

  return (
    <div className="w-full">
      <p className="font-bold text-lg pb-4 border-b dark:border-slate-800">{uppercaseFirstLetter(text("members"))}</p>
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
              <CardContent>
                <form>
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
                      />
                    </div>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex items-end justify-between">
                <div className="flex flex-col space-y-1.5">
                  <Select>
                    <SelectTrigger id="framework">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent position="item-aligned">
                      <SelectItem value="next">Next.js</SelectItem>
                      <SelectItem value="sveltekit">SvelteKit</SelectItem>
                      <SelectItem value="astro">Astro</SelectItem>
                      <SelectItem value="nuxt">Nuxt.js</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-x-2">
                  <Button onClick={() => setOpenInvite(false)} variant="outline">
                    {text("cancel")}
                  </Button>
                  <Button type="submit">Send</Button>
                </div>
              </CardFooter>
            </Card>
          ) : (
            <Button onClick={() => setOpenInvite(true)} className="mt-8" type="submit">
              {textMember("inviteMembers")}
            </Button>
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
                {members.map((member) => (
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
    </div>
  );
}

export { OrgMembers };
