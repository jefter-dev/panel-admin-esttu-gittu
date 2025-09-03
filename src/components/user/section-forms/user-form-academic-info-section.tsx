import { Control } from "react-hook-form";
import { UserUpdateInput } from "@/schemas/user.schema";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface AcademicInfoSectionProps {
  control: Control<UserUpdateInput>;
  isDisabled: boolean;
}

export function AcademicInfoSection({
  control,
  isDisabled,
}: AcademicInfoSectionProps) {
  return (
    <div className="col-span-12 lg:col-span-5 space-y-4 rounded-md border p-6">
      <h2 className="text-xl font-semibold">Informações Acadêmicas</h2>

      <FormField
        control={control}
        name="instituicao"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Instituição de Ensino</FormLabel>
            <FormControl>
              <Input
                placeholder="Universidade Exemplo"
                {...field}
                disabled={isDisabled}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="curso"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Curso</FormLabel>
            <FormControl>
              <Input
                placeholder="Ciência da Computação"
                {...field}
                disabled={isDisabled}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <FormField
          control={control}
          name="escolaridade"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Escolaridade</FormLabel>
              <FormControl>
                <Input
                  placeholder="Superior Incompleto"
                  {...field}
                  disabled={isDisabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="anoParaRenovacao"
          render={({ field }) => (
            <FormItem className="md:col-span-1">
              <FormLabel>Ano para Renovação</FormLabel>
              <FormControl>
                <Input placeholder="2025" {...field} disabled={isDisabled} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
