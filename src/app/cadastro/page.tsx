'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';

export default function CadastroPage() {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (senha !== confirmarSenha) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (senha.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, senha, nome_completo: nomeCompleto }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao criar conta');
      }

      toast.success(data.message);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0F5132] to-[#16A34A] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <Image
              src="/logo.png"
              alt="ConfereLOG"
              width={80}
              height={80}
              className="rounded-lg"
            />
          </div>
          <div className="text-center">
            <CardTitle className="text-2xl font-bold">Criar Conta</CardTitle>
            <CardDescription>Cadastre-se no ConfereLOG</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nomeCompleto">Nome Completo</Label>
              <Input
                id="nomeCompleto"
                type="text"
                placeholder="Digite seu nome completo"
                value={nomeCompleto}
                onChange={(e) => setNomeCompleto(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="usuario">Usuário</Label>
              <Input
                id="usuario"
                type="text"
                placeholder="Escolha um nome de usuário"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmarSenha">Confirmar Senha</Label>
              <Input
                id="confirmarSenha"
                type="password"
                placeholder="Digite a senha novamente"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-[#0F5132] hover:bg-[#0F5132]/90"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando conta...
                </>
              ) : (
                'Criar Conta'
              )}
            </Button>
            <div className="text-center text-sm">
              <span className="text-gray-600">Já tem uma conta? </span>
              <Link href="/login" className="text-[#0F5132] hover:underline font-medium">
                Faça login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
