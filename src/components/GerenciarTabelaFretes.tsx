'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, Plus, Pencil, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';

interface TabelaFrete {
  id: string;
  rota: string;
  tipo_veiculo: string;
  km: number | null;
  valor: number;
  created_at: string;
  updated_at: string;
}

export function GerenciarTabelaFretes() {
  const [fretes, setFretes] = useState<TabelaFrete[]>([]);
  const [filteredFretes, setFilteredFretes] = useState<TabelaFrete[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingFrete, setEditingFrete] = useState<TabelaFrete | null>(null);
  const [deletingFrete, setDeletingFrete] = useState<TabelaFrete | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    rota: '',
    tipo_veiculo: '',
    km: '',
    valor: '',
  });

  const fetchFretes = async () => {
    try {
      const res = await fetch('/api/tabela-fretes');
      const data = await res.json();
      if (data.success) {
        setFretes(data.fretes);
        setFilteredFretes(data.fretes);
      }
    } catch (error) {
      toast.error('Erro ao carregar tabela de fretes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFretes();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = fretes.filter((frete) =>
        frete.rota.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredFretes(filtered);
    } else {
      setFilteredFretes(fretes);
    }
  }, [searchTerm, fretes]);

  const handleOpenDialog = (frete?: TabelaFrete) => {
    if (frete) {
      setEditingFrete(frete);
      setFormData({
        rota: frete.rota,
        tipo_veiculo: frete.tipo_veiculo,
        km: frete.km?.toString() || '',
        valor: frete.valor.toString(),
      });
    } else {
      setEditingFrete(null);
      setFormData({
        rota: '',
        tipo_veiculo: '',
        km: '',
        valor: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingFrete(null);
    setFormData({
      rota: '',
      tipo_veiculo: '',
      km: '',
      valor: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.rota || !formData.tipo_veiculo || !formData.valor) {
      toast.error('Rota, tipo de veículo e valor são obrigatórios');
      return;
    }

    const valor = parseFloat(formData.valor);
    if (isNaN(valor) || valor <= 0) {
      toast.error('Valor deve ser um número positivo');
      return;
    }

    const km = formData.km ? parseFloat(formData.km) : null;
    if (formData.km && (isNaN(km!) || km! <= 0)) {
      toast.error('KM deve ser um número positivo');
      return;
    }

    try {
      const url = editingFrete
        ? `/api/tabela-fretes?id=${editingFrete.id}`
        : '/api/tabela-fretes';
      const method = editingFrete ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rota: formData.rota,
          tipo_veiculo: formData.tipo_veiculo,
          km,
          valor,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(
          editingFrete
            ? 'Frete atualizado com sucesso'
            : 'Frete criado com sucesso'
        );
        handleCloseDialog();
        fetchFretes();
      } else {
        toast.error(data.error || 'Erro ao salvar frete');
      }
    } catch (error) {
      toast.error('Erro ao salvar frete');
    }
  };

  const handleDelete = async () => {
    if (!deletingFrete) return;

    try {
      const res = await fetch(`/api/tabela-fretes?id=${deletingFrete.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Frete excluído com sucesso');
        setDeleteDialogOpen(false);
        setDeletingFrete(null);
        fetchFretes();
      } else {
        toast.error(data.error || 'Erro ao excluir frete');
      }
    } catch (error) {
      toast.error('Erro ao excluir frete');
    }
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'R$ 0,00';
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-[#0F5132]" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por rota..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="bg-[#0F5132] hover:bg-[#0F5132]/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Frete
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        Total de rotas: {filteredFretes.length}
        {searchTerm && ` (filtrado de ${fretes.length})`}
      </p>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rota</TableHead>
              <TableHead>Tipo Veículo</TableHead>
              <TableHead className="text-right">KM</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Atualizado em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFretes.map((frete) => (
              <TableRow key={frete.id}>
                <TableCell className="font-medium">{frete.rota}</TableCell>
                <TableCell>{frete.tipo_veiculo}</TableCell>
                <TableCell className="text-right">
                  {frete.km ? `${frete.km} km` : '-'}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {formatCurrency(frete.valor)}
                </TableCell>
                <TableCell>
                  {new Date(frete.updated_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDialog(frete)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setDeletingFrete(frete);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Dialog de Criar/Editar */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingFrete ? 'Editar Frete' : 'Novo Frete'}
            </DialogTitle>
            <DialogDescription>
              {editingFrete
                ? 'Atualize as informações do frete'
                : 'Preencha os dados para criar um novo frete'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="rota">Rota</Label>
                <Input
                  id="rota"
                  value={formData.rota}
                  onChange={(e) =>
                    setFormData({ ...formData, rota: e.target.value })
                  }
                  placeholder="Ex: São Paulo - Rio de Janeiro"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipo_veiculo">Tipo de Veículo</Label>
                <Input
                  id="tipo_veiculo"
                  value={formData.tipo_veiculo}
                  onChange={(e) =>
                    setFormData({ ...formData, tipo_veiculo: e.target.value })
                  }
                  placeholder="Ex: Truck, Carreta, VUC"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="km">KM (opcional)</Label>
                <Input
                  id="km"
                  type="number"
                  step="1"
                  min="0"
                  value={formData.km}
                  onChange={(e) =>
                    setFormData({ ...formData, km: e.target.value })
                  }
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="valor">Valor (R$)</Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.valor}
                  onChange={(e) =>
                    setFormData({ ...formData, valor: e.target.value })
                  }
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-[#0F5132] hover:bg-[#0F5132]/90"
              >
                {editingFrete ? 'Atualizar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o frete da rota{' '}
              <strong>{deletingFrete?.rota}</strong>? Esta ação não pode ser
              desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeletingFrete(null);
              }}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
