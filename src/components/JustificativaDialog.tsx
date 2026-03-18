'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, FileText, History, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface JustificativaDialogProps {
  open: boolean;
  onClose: () => void;
  id: string; // UUID do registro
  idCarga: string; // Número da carga (para exibição)
  fretista: string;
  rota: string;
  currentJustificativa?: string;
  onSave: () => void;
}

export function JustificativaDialog({
  open,
  onClose,
  id,
  idCarga,
  fretista,
  rota,
  currentJustificativa,
  onSave,
}: JustificativaDialogProps) {
  const [justificativa, setJustificativa] = useState(currentJustificativa || '');
  const [loading, setLoading] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [justificativasAnteriores, setJustificativasAnteriores] = useState<string[]>([]);

  // Buscar justificativas anteriores quando o dialog abrir
  useEffect(() => {
    if (open && rota) {
      fetchJustificativasAnteriores();
    }
  }, [open, rota]);

  // Resetar justificativa quando abrir o dialog
  useEffect(() => {
    if (open) {
      setJustificativa(currentJustificativa || '');
    }
  }, [open, currentJustificativa]);

  const fetchJustificativasAnteriores = async () => {
    setLoadingSuggestions(true);
    try {
      const res = await fetch(`/api/fretes/justificativas-anteriores?rota=${encodeURIComponent(rota)}`);
      const data = await res.json();

      if (data.success && data.justificativas.length > 0) {
        setJustificativasAnteriores(data.justificativas);
      }
    } catch (error) {
      console.error('Erro ao buscar justificativas anteriores:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/fretes/justificativa', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: id, // Usar o UUID do registro
          justificativa: justificativa.trim() || null,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Justificativa salva com sucesso!');
        onSave();
        onClose();
      } else {
        toast.error('Erro ao salvar justificativa');
      }
    } catch (error) {
      toast.error('Erro ao salvar justificativa');
    } finally {
      setLoading(false);
    }
  };

  const handleUsarSugestao = (sugestao: string) => {
    setJustificativa(sugestao);
    toast.success('Justificativa sugerida aplicada! Você pode editá-la.');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#0F5132]" />
            Justificativa da Divergência
          </DialogTitle>
          <DialogDescription>
            Carga {idCarga} - {fretista} - {rota}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Sugestões de justificativas anteriores */}
          {justificativasAnteriores.length > 0 && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm text-muted-foreground">
                <History className="w-4 h-4" />
                Justificativas anteriores desta rota
              </Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                    disabled={loadingSuggestions}
                  >
                    {loadingSuggestions ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Carregando sugestões...
                      </>
                    ) : (
                      <>
                        <span>Usar justificativa anterior</span>
                        <ChevronDown className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[550px]">
                  <DropdownMenuLabel>Selecione uma justificativa</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {justificativasAnteriores.map((just, index) => (
                    <DropdownMenuItem
                      key={index}
                      onClick={() => handleUsarSugestao(just)}
                      className="cursor-pointer whitespace-normal h-auto py-2"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="text-sm">{just}</span>
                        <span className="text-xs text-muted-foreground">
                          Clique para usar (você pode editar depois)
                        </span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="justificativa">Justificativa</Label>
            <Textarea
              id="justificativa"
              value={justificativa}
              onChange={(e) => setJustificativa(e.target.value)}
              placeholder="Digite a justificativa para esta divergência..."
              rows={6}
              className="resize-none"
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                {justificativa.length} caracteres
              </p>
              {justificativa && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setJustificativa('')}
                  className="text-xs h-7"
                >
                  Limpar
                </Button>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-[#0F5132] hover:bg-[#0F5132]/90"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
