"use client";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, IdCard } from "lucide-react";
import { UserDetailsRow } from "@/components/user/user-datails-row";
import { useUserDetails } from "@/hooks/user/use-user-details";
import { DialogTitle } from "@radix-ui/react-dialog";
import * as React from "react";
import { UserDetailsSkeleton } from "@/components/user/user-details-row-skeleton";
import { UserNotFound } from "@/components/user/user-not-found";

export function UserDetailsDialog({ userId }: { userId: string }) {
  const [open, setOpen] = React.useState(false);
  const [fetchDetails, setFetchDetails] = React.useState(false);

  const { userDetails, isLoading } = useUserDetails(
    fetchDetails ? userId : null
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (value) setFetchDetails(true);
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="ml-2 p-1 h-auto cursor-pointer"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-5xl max-h-[80vh] overflow-y-auto">
        <DialogTitle className="flex text-xl gap-2">
          <IdCard size={32} /> Detalhes do usuário
        </DialogTitle>

        {isLoading ? (
          <UserDetailsSkeleton />
        ) : userDetails ? (
          <UserDetailsRow user={userDetails} />
        ) : (
          <UserNotFound />
        )}
      </DialogContent>
    </Dialog>
  );
}
