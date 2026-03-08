'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface Quinzena {
  id: string;
  id_quinzenal: string;
  descricao: string;
  mes: number;
  ano: number;
  quinzena: number;
}

interface QuinzenaModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (idQuinzenal: string) => void;
  title: string;
  description: string;
}

export function QuinzenaModal({ open, onClose, onConfirm, title, description }: QuinzenaModalProps) {
  const [mode, setMode] = useState<'new' | 'existing'>('new');
  const [quinzena, setQuinzena] = useState<string>('1');
  const [mes, setMes] = useState<string>('');
  const [ano, setAno] = useState<string>(new Date().getFullYear().toString());
  const [existingQuinzenas, setExistingQuinzenas] = useState<Quinzena[]>([]);
  const [selectedExisting, setSelectedExisting] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingQuinzenas, setLoadingQuinzenas] = useState(false);

  const meses = [
    { value: '1', label: 'Janeiro' },
    { value: '2', label: 'Fevereiro' },
    { value: '3', label: 'Março' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Maio' },
    { value: '6', label: 'Junho' },
    { value: '7', label: 'Julho' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' },
  ];

  useEffect(() => {
    if (open) {
      fetchQuinzenas();
      // Set default month to current month
      setMes(String(new Date().getMonth() + 1));
    }
  }, [open]);

  const fetchQuinzenas = async () => {
    setLoadingQuinzenas(true);
    try {
      const res = await fetch('/api/quinzenas');
      const data = await res.json();
      setExistingQuinzenas(data || []);
    } catch (error) {
      toast.error('Erro ao carregar quinzenas');
    } finally {
      setLoadingQuinzenas(false);
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      if (mode === 'existing') {
        if (!selectedExisting) {
          toast.error('Selecione uma quinzena');
          setLoading(false);
          return;
        }
        onConfirm(selectedExisting);
      } else {
        if (!quinzena || !mes || !ano) {
          toast.error('Preencha todos os campos');
          setLoading(false);
          return;
        }

        // Create or get quinzena
        const res = await fetch('/api/quinzenas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quinzena: parseInt(quinzena),
            mes: parseInt(mes),
            ano: parseInt(ano),
          }),
        });

        const data = await res.json();
        if (data.quinzena) {
          onConfirm(data.quinzena.id_quinzenal);
        } else {
          toast.error('Erro ao criar quinzena');
          setLoading(false);
        }
      }
    } catch (error) {
      toast.error('Erro ao processar quinzena');
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#0F5132]" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <RadioGroup value={mode} onValueChange={(v) => setMode(v as 'new' | 'existing')}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="new" id="new" />
              <Label htmlFor="new" className="font-normal cursor-pointer">
                Nova quinzena
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="existing" id="existing" />
              <Label htmlFor="existing" className="font-normal cursor-pointer">
                Atualizar quinzena existente
              </Label>
            </div>
          </RadioGroup>

          {mode === 'new' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quinzena">Quinzena</Label>
                  <Select value={quinzena} onValueChange={setQuinzena}>
                    <SelectTrigger id="quinzena">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1ª Quinzena</SelectItem>
                      <SelectItem value="2">2ª Quinzena</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mes">Mês</Label>
                  <Select value={mes} onValueChange={setMes}>
                    <SelectTrigger id="mes">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {meses.map((m) => (
                        <SelectItem key={m.value} value={m.value}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ano">Ano</Label>
                  <Select value={ano} onValueChange={setAno}>
                    <SelectTrigger id="ano">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[2024, 2025, 2026, 2027].map((y) => (
                        <SelectItem key={y} value={String(y)}>
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="existing-quinzena">Selecione a quinzena</Label>
              {loadingQuinzenas ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-[#0F5132]" />
                </div>
              ) : existingQuinzenas.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Nenhuma quinzena importada ainda
                </p>
              ) : (
                <Select value={selectedExisting} onValueChange={setSelectedExisting}>
                  <SelectTrigger id="existing-quinzena">
                    <SelectValue placeholder="Selecione uma quinzena" />
                  </SelectTrigger>
                  <SelectContent>
                    {existingQuinzenas.map((q) => (
                      <SelectItem key={q.id} value={q.id_quinzenal}>
                        {q.descricao}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading || (mode === 'existing' && !selectedExisting)}
            className="bg-[#0F5132] hover:bg-[#0F5132]/90"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              'Confirmar'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
