'use client';

import { MainLayout } from '@/components/MainLayout';
import { LogsAtividades } from '@/components/LogsAtividades';
import { HistoricoImportacoes } from '@/components/HistoricoImportacoes';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { History, Upload } from 'lucide-react';

export default function HistoricosPage() {
  return (
    <MainLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Históricos</h1>
          <p className="text-muted-foreground">
            Visualize o histórico de atividades e importações do sistema
          </p>
        </div>

        <Tabs defaultValue="atividades" className="space-y-4">
          <TabsList>
            <TabsTrigger value="atividades">
              <History className="w-4 h-4 mr-2" />
              Logs de Atividades
            </TabsTrigger>
            <TabsTrigger value="importacoes">
              <Upload className="w-4 h-4 mr-2" />
              Histórico de Importações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="atividades" className="space-y-4">
            <LogsAtividades />
          </TabsContent>

          <TabsContent value="importacoes" className="space-y-4">
            <HistoricoImportacoes />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
