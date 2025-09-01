"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/types/user";

interface UserCellProps {
  user: User;
}

export const UserCell: React.FC<UserCellProps> = ({ user }) => {
  const initialsName =
    (user.nome.charAt(0) ?? "").toUpperCase() +
    (user.sobrenome.charAt(0).toUpperCase() ?? "");

  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-10 w-10">
        <AvatarImage
          src={user.fotoIdentificacao ?? undefined}
          alt={user.nome}
        />
        <AvatarFallback>{initialsName}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="font-medium text-foreground">
          {user.nome} {user.sobrenome}
        </span>
        <span className="text-xs text-muted-foreground">{user.email}</span>
      </div>
    </div>
  );
};
