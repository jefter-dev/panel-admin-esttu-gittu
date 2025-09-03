"use client";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserUpdateInput } from "@/schemas/user.schema";
import { Control } from "react-hook-form";

interface UserFormPaymentSectionProps {
  control: Control<UserUpdateInput>;
  isDisabled?: boolean;
}

export function UserFormPaymentSection({
  control,
  isDisabled,
}: UserFormPaymentSectionProps) {
  return (
    <div className="col-span-3 space-y-4 rounded-md border p-6">
      <h2 className="text-xl font-semibold">Pagamento</h2>
      <FormField
        control={control}
        name="pagamentoEfetuado"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Pagamento efetuado</FormLabel>
            <FormControl>
              <Select
                disabled={isDisabled}
                value={field.value ? "true" : "false"} // <-- aqui
                onValueChange={(value) => field.onChange(value === "true")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Sim</SelectItem>
                  <SelectItem value="false">Não</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
