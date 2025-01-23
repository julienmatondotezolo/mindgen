/* eslint-disable max-len */
"use client";

import { motion } from "framer-motion";
import { Menu, Settings } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "react-query";
import { useSetRecoilState } from "recoil";

import { updateBoardMetadataById } from "@/_services";
import { CanvasMode, CustomSession, MindMapDetailsProps } from "@/_types";
import { Button, Input, Textarea } from "@/components/";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, Switch } from "@/components/ui";
import { Link } from "@/navigation";
import { canvasStateAtom } from "@/state";
import { checkPermission, uppercaseFirstLetter } from "@/utils";

function NavLeft({ userMindmapDetails }: { userMindmapDetails: MindMapDetailsProps | undefined }) {
  const session = useSession();
  const safeSession = session ? (session as unknown as CustomSession) : null;
  const text = useTranslations("Index");
  const setCanvasState = useSetRecoilState(canvasStateAtom);
  const PERMISSIONS = userMindmapDetails?.connectedMemberPermissions;

  const [newMindMapName, setNewMindMapName] = useState("");
  const [newMindMapDescription, setNewMindMapDescription] = useState("");
  const [newMindMapVisibility, setNewMindMapVisibility] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const mindMapId = userMindmapDetails?.id;
  const mindMapName = userMindmapDetails?.name;
  const mindMapDescription = userMindmapDetails?.description;
  const mindMapVisibility = userMindmapDetails?.visibility;

  const queryClient = useQueryClient();
  const updateMindmapMutation = useMutation(updateBoardMetadataById, {
    onSuccess: () => {
      queryClient.invalidateQueries("mindmaps");
      setIsSheetOpen(false);
    },
  });

  useEffect(() => {
    if (mindMapName) setNewMindMapName(mindMapName);
    if (mindMapDescription) setNewMindMapDescription(mindMapDescription);
    if (mindMapVisibility) setNewMindMapVisibility(mindMapVisibility);
  }, [mindMapName, mindMapDescription, mindMapVisibility]);

  const handleSheetOpenChange = (open: boolean) => {
    setIsSheetOpen(!isSheetOpen);
    if (open === true) {
      setCanvasState({ mode: CanvasMode.Typing });
    } else {
      setCanvasState({ mode: CanvasMode.None });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateMindmapMutation.mutate({
      session: safeSession,
      mindmapId: mindMapId,
      mindmapObject: {
        name: newMindMapName ?? "",
        description: newMindMapDescription ?? "",
        visibility: newMindMapVisibility ?? "PRIVATE",
      },
    });
  };

  return (
    <Sheet open={isSheetOpen} onOpenChange={(open) => handleSheetOpenChange(open)}>
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex px-2 py-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50"
      >
        <div className="flex items-center gap-3">
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="h-5 w-5 text-slate-700 dark:text-slate-200" />
            </Button>
          </SheetTrigger>

          <Link href="/dashboard">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="font-bold text-base dark:text-white"
            >
              MIND<span className="text-primary-color">GEN</span>
            </motion.div>
          </Link>
        </div>
      </motion.nav>

      <SheetContent
        side="left"
        className="rounded-r-2xl border-r border-slate-200/50 dark:border-slate-700/50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg shadow-2xl p-6"
      >
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="h-full flex flex-col">
          <SheetHeader className="mb-6">
            <SheetTitle className="flex items-center gap-2 text-xl">
              <Settings className="h-5 w-5" />
              {uppercaseFirstLetter(text("save"))} mind map
            </SheetTitle>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
            <div className="space-y-6 flex-1">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2 block">
                  {text("name")}
                </label>
                <Input
                  value={newMindMapName}
                  onChange={(e) => setNewMindMapName(e.target.value)}
                  placeholder={`${text("untitled")} ${text("name").toLowerCase()}`}
                  disabled={updateMindmapMutation.isLoading || !checkPermission(PERMISSIONS, "UPDATE")}
                  className="w-full"
                />
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2 block">
                  {text("description")}
                </label>
                <Textarea
                  value={newMindMapDescription}
                  onChange={(e) => setNewMindMapDescription(e.target.value)}
                  placeholder={`${text("untitled")} ${text("description").toLowerCase()}`}
                  disabled={updateMindmapMutation.isLoading || !checkPermission(PERMISSIONS, "UPDATE")}
                  className="h-32 resize-none"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50"
              >
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white">{text("private")}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{text("onlyViewable")}</p>
                </div>
                <Switch
                  checked={newMindMapVisibility === "PRIVATE"}
                  onCheckedChange={(checked) => setNewMindMapVisibility(checked ? "PRIVATE" : "PUBLIC")}
                  disabled={!checkPermission(PERMISSIONS, "UPDATE")}
                />
              </motion.div>
            </div>

            {checkPermission(PERMISSIONS, "UPDATE") && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-6"
              >
                <Button
                  className="w-full h-11 rounded-xl text-base font-medium"
                  type="submit"
                  disabled={updateMindmapMutation.isLoading}
                >
                  {updateMindmapMutation.isLoading ? text("loading") : uppercaseFirstLetter(text("save"))}
                </Button>
              </motion.div>
            )}
          </form>
        </motion.div>
      </SheetContent>
    </Sheet>
  );
}

export { NavLeft };
