'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface User {
  id: string;
  usuario: string;
  tipo: 'novo' | 'supervisor' | 'administrador';
  nome_completo?: string;
  ativo: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (usuario: string, senha: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  hasAccess: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Verificar se há usuário salvo no localStorage
    const savedUser = localStorage.getItem('conferelog_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (usuario: string, senha: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, senha }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao fazer login');
      }

      setUser(data.user);
      localStorage.setItem('conferelog_user', JSON.stringify(data.user));

      // Registrar log de login
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: data.user.id,
          usuario: data.user.usuario,
          tipo_usuario: data.user.tipo,
          acao: 'login',
          detalhes: { timestamp: new Date().toISOString() },
        }),
      });

      // Redirecionar baseado no tipo de usuário
      if (data.user.tipo === 'novo') {
        router.push('/aguardando-autorizacao');
      } else {
        router.push('/');
      }

      toast.success('Login realizado com sucesso!');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const logout = async () => {
    if (user) {
      // Registrar log de logout
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: user.id,
          usuario: user.usuario,
          tipo_usuario: user.tipo,
          acao: 'logout',
          detalhes: { timestamp: new Date().toISOString() },
        }),
      });
    }

    setUser(null);
    localStorage.removeItem('conferelog_user');
    router.push('/login');
    toast.success('Logout realizado com sucesso!');
  };

  const hasAccess = () => {
    return user?.tipo === 'supervisor' || user?.tipo === 'administrador';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        hasAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
