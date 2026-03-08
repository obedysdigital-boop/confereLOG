'use client';

import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Loader2 } from 'lucide-react';
import { useState } from 'react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

interface ExportButtonProps {
  data: Array<Record<string, unknown>>;
  filename: string;
  label?: string;
}

export function ExportButton({ data, filename, label = 'Exportar XLSX' }: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);

  const handleExport = () => {
    if (data.length === 0) {
      toast.error('Não há dados para exportar');
      return;
    }

    setExporting(true);

    try {
      // Criar worksheet
      const ws = XLSX.utils.json_to_sheet(data);

      // Criar workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Dados');

      // Gerar arquivo
      XLSX.writeFile(wb, `${filename}.xlsx`);

      toast.success(`Arquivo ${filename}.xlsx exportado com sucesso!`);
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast.error('Erro ao exportar arquivo');
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={exporting || data.length === 0}
      size="sm"
      className="h-9 bg-[#0F5132] hover:bg-[#0F5132]/90 text-white"
    >
      {exporting ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Exportando...
        </>
      ) : (
        <>
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          {label}
        </>
      )}
    </Button>
  );
}
