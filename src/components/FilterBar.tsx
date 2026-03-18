'use client';

import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { X, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FilterBarProps {
  onFilterChange: (filters: FilterValues) => void;
  quinzenas: string[];
  fretistas: string[];
  rotas: string[];
  veiculos: string[];
}

export interface FilterValues {
  quinzena: string;
  data: string;
  fretista: string;
  rota: string;
  veiculo: string;
  status: string;
  validacao: string;
}

export function FilterBar({ onFilterChange, quinzenas, fretistas, rotas, veiculos }: FilterBarProps) {
  const [filters, setFilters] = useState<FilterValues>({
    quinzena: '',
    data: '',
    fretista: '',
    rota: '',
    veiculo: '',
    status: '',
    validacao: '',
  });
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Selecionar a quinzena mais recente por padrão (apenas uma vez)
  useEffect(() => {
    if (quinzenas.length > 0 && !initialized) {
      // Ordenar quinzenas (mais recente primeiro)
      const sortedQuinzenas = [...quinzenas].sort((a, b) => b.localeCompare(a));
      setFilters(prev => ({ ...prev, quinzena: sortedQuinzenas[0] }));
      setInitialized(true);
    }
  }, [quinzenas, initialized]);

  useEffect(() => {
    onFilterChange(filters);
  }, [filters]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      const formatted = format(date, 'dd/MM/yyyy');
      setFilters({ ...filters, data: formatted });
    } else {
      setFilters({ ...filters, data: '' });
    }
    setDatePickerOpen(false);
  };

  const handleClearFilters = () => {
    setFilters({
      quinzena: '',
      data: '',
      fretista: '',
      rota: '',
      veiculo: '',
      status: '',
      validacao: '',
    });
    setSelectedDate(undefined);
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '');

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {quinzenas.length > 0 && (
        <Select value={filters.quinzena || undefined} onValueChange={(v) => setFilters({ ...filters, quinzena: v })}>
          <SelectTrigger className="w-[200px] h-9 text-sm">
            <SelectValue placeholder="Quinzena" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TODAS">Todas as quinzenas</SelectItem>
            {[...quinzenas].sort((a, b) => b.localeCompare(a)).map((q) => (
              <SelectItem key={q} value={q}>{q}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {fretistas.length > 0 && (
        <>
          <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`w-[180px] h-9 text-sm justify-start text-left font-normal ${
                  !selectedDate && 'text-muted-foreground'
                }`}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : 'Selecionar data'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                locale={ptBR}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Select value={filters.fretista || undefined} onValueChange={(v) => setFilters({ ...filters, fretista: v })}>
            <SelectTrigger className="w-[160px] h-9 text-sm">
              <SelectValue placeholder="Fretista" />
            </SelectTrigger>
            <SelectContent>
              {fretistas.map((f) => (
                <SelectItem key={f} value={f}>{f}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.rota || undefined} onValueChange={(v) => setFilters({ ...filters, rota: v })}>
            <SelectTrigger className="w-[200px] h-9 text-sm">
              <SelectValue placeholder="Rota/Região" />
            </SelectTrigger>
            <SelectContent>
              {rotas.map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.veiculo || undefined} onValueChange={(v) => setFilters({ ...filters, veiculo: v })}>
            <SelectTrigger className="w-[140px] h-9 text-sm">
              <SelectValue placeholder="Veículo" />
            </SelectTrigger>
            <SelectContent>
              {veiculos.map((v) => (
                <SelectItem key={v} value={v}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.status || undefined} onValueChange={(v) => setFilters({ ...filters, status: v })}>
            <SelectTrigger className="w-[160px] h-9 text-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Conforme Tabela">OK</SelectItem>
              <SelectItem value="Diverge da Tabela">Diverge</SelectItem>
              <SelectItem value="Sem dados BI">Sem dados BI</SelectItem>
              <SelectItem value="Sem valor tabela">Sem valor tabela</SelectItem>
              <SelectItem value="Justificado">Justificado</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.validacao || undefined} onValueChange={(v) => setFilters({ ...filters, validacao: v })}>
            <SelectTrigger className="w-[160px] h-9 text-sm">
              <SelectValue placeholder="Validação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Não autorizado">Não autorizado</SelectItem>
              <SelectItem value="Validado e Autorizado">Autorizado</SelectItem>
            </SelectContent>
          </Select>
        </>
      )}

      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleClearFilters}
          className="h-9 text-sm border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
        >
          <X className="w-4 h-4 mr-1" />
          Limpar filtros
        </Button>
      )}
    </div>
  );
}
