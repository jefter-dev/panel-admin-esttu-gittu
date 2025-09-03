import * as React from "react";
import { Table as TanstackTable } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, SearchX } from "lucide-react";
import {
  ALLOWED_FILTER_TYPES,
  FilterPayment,
  FilterType,
  FilterValue,
} from "@/types/filters-user.type";

interface DataTableToolbarProps<TData> {
  table: TanstackTable<TData>;
  search: string;
  filterPagamento: FilterPayment;
  onFilterChange: (filters: {
    search: string;
    pagamentoEfetuado?: boolean;
    filterType?: FilterType;
    filterValue?: FilterValue;
  }) => void;
}

export function DataTableToolbar<TData>({
  search,
  filterPagamento,
  onFilterChange,
}: DataTableToolbarProps<TData>) {
  const [currentSearch, setCurrentSearch] = React.useState(search);
  const [filterType, setFilterType] = React.useState<FilterType | undefined>(
    undefined
  );
  const [filterValue, setFilterValue] = React.useState("");

  // Nenhuma mudança na lógica dos hooks e funções
  React.useEffect(() => {
    const handler = setTimeout(() => {
      onFilterChange({
        search: currentSearch,
        pagamentoEfetuado:
          filterPagamento === "all" ? undefined : filterPagamento === "true",
      });
    }, 300);

    return () => clearTimeout(handler);
  }, [currentSearch, filterPagamento, onFilterChange]);

  const applyFilters = () => {
    onFilterChange({
      search: currentSearch,
      pagamentoEfetuado:
        filterPagamento === "all" ? undefined : filterPagamento === "true",
      filterType,
      filterValue,
    });
  };

  const clearFilters = () => {
    setCurrentSearch("");
    setFilterType(undefined);
    setFilterValue("");
    onFilterChange({
      search: "",
      pagamentoEfetuado: undefined,
      filterType: undefined,
      filterValue: undefined,
    });
  };

  return (
    // 👇 MUDANÇA 1: O container principal agora é flex-col por padrão e vira flex-row em telas médias (md) ou maiores.
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between py-4">
      {/* Esquerda: busca global + pagamento */}
      {/* 👇 MUDANÇA 2: Este grupo também se adapta. Em telas pequenas (sm), os itens ficam em linha. Em telas muito pequenas, eles se empilham. */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Input
          placeholder="Pesquisar por nome, CPF ou e-mail"
          value={currentSearch}
          onChange={(event) => setCurrentSearch(event.target.value)}
          // Ocupa toda a largura em telas pequenas e tem largura definida em telas maiores
          className="w-full sm:w-64"
        />

        <Select
          value={filterPagamento}
          onValueChange={(value) =>
            onFilterChange({
              search: currentSearch,
              pagamentoEfetuado: value === "all" ? undefined : value === "true",
            })
          }
        >
          <SelectTrigger className="w-full sm:w-[200px] cursor-pointer">
            <SelectValue placeholder="Status Pagamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="true">Pagamento efetuado</SelectItem>
            <SelectItem value="false">Pagamento pendente</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Direita: filtro avançado (tipo + valor + ações) */}
      {/* 👇 MUDANÇA 3: O grupo de filtros avançados usa `flex-wrap` para que os itens quebrem para a próxima linha se não houver espaço. */}
      <div className="flex flex-col lg:flex-row items-center gap-4">
        <div className="flex flex-col sm:flex-row w-full lg:w-auto items-center gap-4">
          <Select
            value={filterType ?? ""}
            onValueChange={(value) => setFilterType(value as FilterType)}
          >
            <SelectTrigger className="w-full sm:w-[160px] cursor-pointer">
              <SelectValue placeholder="Filtrar por" />
            </SelectTrigger>
            <SelectContent>
              {ALLOWED_FILTER_TYPES.map((type) => (
                <SelectItem className="cursor-pointer" key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder={`Digite ${filterType || "o valor"}...`}
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            className="w-full sm:w-[220px]"
            disabled={!filterType}
          />
        </div>

        {/* 👇 MUDANÇA 4: Agrupador para os botões para que fiquem juntos e se adaptem melhor. */}
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <Button
            variant="default"
            className="w-full lg:w-auto cursor-pointer"
            onClick={applyFilters}
            disabled={!filterType || !filterValue}
          >
            <Search className="mr-2 h-4 w-4" />
            Pesquisar
          </Button>
          {/* 
          <Button
            variant="outline"
            className="w-full lg:w-auto cursor-pointer"
            onClick={clearFilters}
          >
            <SearchX className="mr-2 h-4 w-4" />
            Limpar
          </Button> */}
        </div>
      </div>
    </div>
  );
}
