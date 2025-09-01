"use client";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, IdCard } from "lucide-react";
import { UserDetailsRow } from "@/components/user/user-datails-row";
import { useUserDetails } from "@/hooks/user/use-user-details";
import { DialogTitle } from "@radix-ui/react-dialog";

export function UserDetailsDialog({ userId }: { userId: string }) {
  const { userDetails, isLoading } = useUserDetails(userId);

  return (
    <Dialog>
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
          <p>Carregando...</p>
        ) : userDetails ? (
          <UserDetailsRow user={userDetails} />
        ) : (
          <p className="text-muted-foreground">Usuário não encontrado</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
