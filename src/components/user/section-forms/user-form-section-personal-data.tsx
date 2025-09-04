import { Control } from "react-hook-form";
import { InputMask } from "@react-input/mask";

import { UserUpdateInput } from "@/schemas/user.schema";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface PersonalDataSectionProps {
  control: Control<UserUpdateInput>;
  isDisabled: boolean;
}

export function PersonalDataSection({
  control,
  isDisabled,
}: PersonalDataSectionProps) {
  return (
    <div className="col-span-12 lg:col-span-7 space-y-4 rounded-md border p-6">
      <h2 className="text-xl font-semibold">Dados Pessoais</h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <FormField
          control={control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="João" {...field} disabled={isDisabled} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="sobrenome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sobrenome</FormLabel>
              <FormControl>
                <Input
                  placeholder="da Silva"
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
          name="cpf"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CPF</FormLabel>
              <FormControl>
                <InputMask
                  component={Input}
                  mask="###.###.###-##"
                  replacement={{ "#": /\d/ }}
                  placeholder="123.456.789-00"
                  {...field}
                  disabled={isDisabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <FormField
          control={control}
          name="email"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input
                  placeholder="joao.silva@example.com"
                  {...field}
                  disabled={isDisabled}
                  type="email"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="celular"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Celular</FormLabel>
              <FormControl>
                <InputMask
                  component={Input}
                  mask="(##) #####-####"
                  replacement={{ "#": /\d/ }}
                  placeholder="(11) 98765-4321"
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
          name="rg"
          render={({ field }) => (
            <FormItem>
              <FormLabel>RG</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="1234567"
                  {...field}
                  value={field.value ?? ""}
                  disabled={isDisabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="dataNascimento"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data de Nascimento</FormLabel>
              <FormControl>
                <InputMask
                  component={Input}
                  mask="##/##/####"
                  replacement={{ "#": /\d/ }}
                  placeholder="dd/mm/aaaa"
                  {...field}
                  disabled={isDisabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
