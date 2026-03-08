'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, User, Settings, Moon, Sun } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

export function UserHeader() {
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  if (!user) return null;

  const getTipoBadgeColor = (tipo: string) => {
    switch (tipo) {
      case 'administrador':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'supervisor':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <div className="border-b dark:border-gray-800 bg-white dark:bg-[#0F0F0F]">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="ConfereLOG"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">ConfereLOG</h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">Sistema de Validação de Fretes</p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 max-w-xs">
                <User className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline truncate max-w-[150px]">
                  {user.nome_completo || user.usuario}
                </span>
                <Badge className={`${getTipoBadgeColor(user.tipo)} flex-shrink-0`}>
                  {user.tipo}
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user.nome_completo || user.usuario}</p>
                  <p className="text-xs text-gray-500">@{user.usuario}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={toggleTheme} className="cursor-pointer">
                {theme === 'light' ? (
                  <>
                    <Moon className="w-4 h-4 mr-2" />
                    Tema Escuro
                  </>
                ) : (
                  <>
                    <Sun className="w-4 h-4 mr-2" />
                    Tema Claro
                  </>
                )}
              </DropdownMenuItem>
              {user.tipo === 'administrador' && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/configuracoes" className="cursor-pointer">
                      <Settings className="w-4 h-4 mr-2" />
                      Configurações
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600">
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
