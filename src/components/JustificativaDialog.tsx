'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, FileText } from 'lucide-react';
import { toast } from 'sonner';

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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
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
          <div className="space-y-2">
            <Label htmlFor="justificativa">Justificativa</Label>
            <Textarea
              id="justificativa"
              value={justificativa}
              onChange={(e) => setJustificativa(e.target.value)}
              placeholder="Digite a justificativa para esta divergência..."
              rows={5}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {justificativa.length} caracteres
            </p>
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
