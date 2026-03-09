# Changelog - ConfereLOG

## [2.0.0] - 2026-03-09

### Adicionado
- Sistema de autenticação com usuário e senha
- Cadastro de novos usuários
- 3 tipos de usuário: Novo, Supervisor, Administrador
- Tela de aguardando autorização para novos usuários
- Tela de configurações para administradores gerenciarem usuários
- Botão de status de validação em cada linha da tabela (Não autorizado / Validado e Autorizado)
- Registro de validações com usuário, tipo e data
- Tabela de validações no relatório HTML do dashboard
- Logs de atividades dos usuários
- Botão de tema movido para menu dropdown do usuário
- Tabelas `usuarios` e `logs_atividades` no banco de dados
- Colunas de validação em `dados_fretes`: status_validacao, validado_por_usuario, validado_por_tipo, data_validacao

### Modificado
- Filtro de divergências agora mostra todos os registros com status !== 'Conforme Tabela'
- Autenticação migrada de senha única para usuário e senha
- Layout do header com menu dropdown do usuário
- README.md atualizado com todas as novas funcionalidades
- .gitignore otimizado e organizado
- .vercelignore otimizado

### Corrigido
- Arquivo `src/app/api/upload/route.ts` estava truncado causando erro 404 na Vercel
- Exportação correta da função POST na rota de upload

### Removido
- Arquivo temporário "1"
- DEPLOY_VERCEL.md (documentação temporária)
- VERCEL_CHECKLIST.md (checklist temporário)
- .dockerignore (não usado)
- Caddyfile (não usado)
- Sistema antigo de autenticação por senha única

## [1.0.0] - 2026-03-08

### Inicial
- Sistema de validação de fretes
- Importação de dados BI, APP e Tabela
- Sistema de quinzenas
- Dashboard analítico com gráficos
- Filtros avançados
- Tema claro/escuro
- Exportação XLSX
- Relatório HTML
- Integração com Supabase
