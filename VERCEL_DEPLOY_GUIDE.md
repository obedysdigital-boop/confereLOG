# 🚀 Guia de Deploy na Vercel - ConfereLOG

## Pré-requisitos

1. Conta na Vercel (https://vercel.com)
2. Projeto no GitHub/GitLab/Bitbucket
3. Credenciais do Supabase

## Passo a Passo

### 1. Preparar o Repositório

Certifique-se de que todos os arquivos estão commitados:

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. Importar Projeto na Vercel

1. Acesse https://vercel.com/new
2. Clique em "Import Git Repository"
3. Selecione seu repositório do ConfereLOG
4. Clique em "Import"

### 3. Configurar Variáveis de Ambiente

Na página de configuração do projeto, adicione as seguintes variáveis de ambiente:

#### Variáveis Obrigatórias

| Nome | Valor | Descrição |
|------|-------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://seu-projeto.supabase.co` | URL do seu projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sua-chave-anonima` | Chave anônima do Supabase |
| `AUTH_PASSWORD` | `sua-senha-segura` | Senha de acesso ao sistema |

**Como adicionar:**
1. Na página do projeto, vá em "Settings" → "Environment Variables"
2. Adicione cada variável clicando em "Add"
3. Selecione "Production", "Preview" e "Development" para cada variável
4. Clique em "Save"

### 4. Configurações de Build

A Vercel detectará automaticamente as configurações do Next.js. Verifique se estão corretas:

- **Framework Preset**: Next.js
- **Build Command**: `next build` (padrão)
- **Output Directory**: `.next` (padrão)
- **Install Command**: `npm install` (padrão)
- **Development Command**: `next dev` (padrão)

### 5. Deploy

1. Clique em "Deploy"
2. Aguarde o build completar (2-5 minutos)
3. Acesse a URL fornecida pela Vercel

## Configurações Avançadas

### Região

Por padrão, a Vercel usa a região mais próxima. Para forçar São Paulo (Brasil):

1. Vá em "Settings" → "Functions"
2. Em "Function Region", selecione "São Paulo (gru1)"

### Domínio Customizado

1. Vá em "Settings" → "Domains"
2. Clique em "Add"
3. Digite seu domínio (ex: conferelog.seudominio.com.br)
4. Siga as instruções para configurar DNS

### Limites de Função

Para uploads de arquivos grandes:

1. Vá em "Settings" → "Functions"
2. Ajuste "Max Duration" para 60s (plano Pro)
3. Ajuste "Memory" para 1024 MB se necessário

## Troubleshooting

### Erro: "Module not found"

**Solução**: Limpe o cache e faça redeploy
```bash
# No dashboard da Vercel
Settings → General → Clear Cache → Redeploy
```

### Erro: "Environment variable not found"

**Solução**: Verifique se todas as variáveis de ambiente estão configuradas
1. Settings → Environment Variables
2. Adicione as variáveis faltantes
3. Redeploy

### Erro: "Build timeout"

**Solução**: Otimize o build
1. Remova dependências não utilizadas
2. Verifique se não há loops infinitos
3. Considere upgrade para plano Pro (mais tempo de build)

### Erro: "Function timeout"

**Solução**: Otimize as funções API
1. Reduza o volume de dados processados
2. Adicione paginação
3. Use cache quando possível
4. Upgrade para plano Pro (60s timeout)

### Erro de CORS

**Solução**: Configure CORS no Supabase
1. Acesse Supabase Dashboard
2. Settings → API
3. Adicione o domínio da Vercel em "CORS Origins"

## Monitoramento

### Logs

Acesse os logs em tempo real:
1. Dashboard da Vercel → Seu projeto
2. Clique em "Logs"
3. Filtre por tipo (Build, Runtime, Edge)

### Analytics

Ative o Vercel Analytics:
1. Dashboard → Seu projeto
2. Analytics → Enable
3. Visualize métricas de performance

### Speed Insights

Ative o Speed Insights:
1. Dashboard → Seu projeto
2. Speed Insights → Enable
3. Monitore Core Web Vitals

## Atualizações

### Deploy Automático

Cada push para a branch principal fará deploy automático:

```bash
git add .
git commit -m "Update feature"
git push origin main
# Deploy automático iniciará
```

### Preview Deployments

Branches e Pull Requests geram preview automático:

```bash
git checkout -b feature/nova-funcionalidade
git push origin feature/nova-funcionalidade
# Preview URL será gerado automaticamente
```

### Rollback

Para voltar a uma versão anterior:
1. Dashboard → Deployments
2. Encontre o deployment desejado
3. Clique nos três pontos → "Promote to Production"

## Otimizações

### Cache

A Vercel faz cache automático de:
- Páginas estáticas
- Imagens otimizadas
- Assets públicos

### Edge Functions

Para melhor performance, considere usar Edge Functions para:
- Autenticação
- Redirecionamentos
- Headers customizados

### Image Optimization

As imagens são otimizadas automaticamente. Para melhor performance:
1. Use o componente `next/image`
2. Defina width e height
3. Use formatos modernos (WebP, AVIF)

## Segurança

### Headers de Segurança

Adicione headers de segurança em `next.config.ts`:

```typescript
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'Referrer-Policy',
          value: 'origin-when-cross-origin',
        },
      ],
    },
  ];
}
```

### Proteção de Rotas

As rotas API já estão protegidas por autenticação. Mantenha `AUTH_PASSWORD` seguro.

### HTTPS

HTTPS é automático na Vercel. Todos os domínios recebem certificado SSL gratuito.

## Custos

### Plano Hobby (Gratuito)
- 100 GB bandwidth/mês
- Deployments ilimitados
- 10s function timeout
- Domínios customizados

### Plano Pro ($20/mês)
- 1 TB bandwidth/mês
- 60s function timeout
- Analytics avançado
- Suporte prioritário

## Suporte

### Documentação Oficial
- https://vercel.com/docs
- https://nextjs.org/docs

### Comunidade
- Discord da Vercel
- GitHub Discussions
- Stack Overflow

## Checklist de Deploy

- [ ] Código commitado e pushed
- [ ] Variáveis de ambiente configuradas
- [ ] Build local testado (`npm run build`)
- [ ] Supabase configurado e acessível
- [ ] Projeto importado na Vercel
- [ ] Deploy realizado com sucesso
- [ ] URL de produção testada
- [ ] Login funcionando
- [ ] Upload de arquivos testado
- [ ] Dashboard carregando
- [ ] Tema escuro funcionando
- [ ] Responsividade testada
- [ ] Domínio customizado configurado (opcional)

## Comandos Úteis

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login na Vercel
vercel login

# Deploy do diretório atual
vercel

# Deploy para produção
vercel --prod

# Ver logs em tempo real
vercel logs

# Listar deployments
vercel ls

# Remover deployment
vercel rm [deployment-url]
```

## Próximos Passos

Após o deploy bem-sucedido:

1. ✅ Teste todas as funcionalidades
2. ✅ Configure domínio customizado
3. ✅ Ative Analytics
4. ✅ Configure alertas de erro
5. ✅ Documente a URL de produção
6. ✅ Treine usuários no sistema

---

**Última atualização**: Março 2026
**Versão**: 1.0.0
