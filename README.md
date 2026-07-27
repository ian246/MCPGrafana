# Analisador de Logs Grafana via MCP + IA (OpenRouter) 🚀

Uma aplicação web avançada que utiliza a inovadora arquitetura **MCP (Model Context Protocol)** para criar uma ponte segura entre a sua infraestrutura de logs (Grafana Loki) e as Inteligências Artificiais. 

Em vez de olhar para painéis confusos ou analisar JSONs massivos, este sistema coleta seus logs de sistema através do MCP e os envia para uma IA (via OpenRouter), que atua como um Engenheiro SRE gerando um diagnóstico textual limpo e visual sobre a saúde da sua aplicação.

---

## 🏗️ Arquitetura do Projeto

O projeto está dividido em camadas que trabalham juntas:
*   **Dados (Grafana + Loki)**: Rodando em Docker, atua como o banco de logs da aplicação.
*   **Servidor MCP (Node.js)**: Um servidor isolado que se conecta ao Loki e expõe uma "Ferramenta Universal" (`analyze_system_health`) usando o SDK do Model Context Protocol.
*   **Frontend (Next.js)**: Uma interface premium onde o usuário pode simular erros. Ela atua como um **Cliente MCP** em background para chamar o servidor Node.js.
*   **Inteligência Artificial (OpenRouter)**: O Next.js passa os dados extraídos pelo MCP para uma IA gerar um relatório SRE formatado em Markdown.

---

## 🚀 Como Rodar o Projeto Localmente

Siga o passo a passo abaixo para rodar toda a arquitetura na sua máquina (Não é necessário subir na nuvem, tudo foi desenhado para rodar e ser testado localmente).

### Pré-requisitos
- [Docker e Docker Compose](https://www.docker.com/products/docker-desktop/) instalados.
- [Node.js](https://nodejs.org/) (versão 18+ recomendada) instalado.
- Uma chave de API gratuita no [OpenRouter](https://openrouter.ai/).

### Passo 1: Subir a Infraestrutura (Loki & Grafana)
Abra um terminal na pasta raiz do projeto e execute:
```bash
docker-compose up -d
```
*Isso vai baixar as imagens e iniciar o Grafana na porta `3005` e o Loki na porta `3101`.*

### Passo 2: Configurar as Variáveis de Ambiente
1. Entre na pasta `frontend`:
   ```bash
   cd frontend
   ```
2. Crie um arquivo chamado `.env.local` usando o arquivo de exemplo como base:
   - Copie o arquivo `.env.example` e renomeie a cópia para `.env.local`.
   - Abra o `.env.local` e cole a sua chave do OpenRouter:
     ```env
     OPENROUTER_API_KEY=sua_chave_aqui
     ```

### Passo 3: Iniciar a Aplicação Next.js + MCP
Ainda dentro da pasta `frontend`, instale as dependências e rode o projeto:
```bash
npm install
npm run dev
```
*O Next.js será iniciado na porta `3001`.*

---

## 🧪 Como Testar

1. Acesse o Frontend no seu navegador: [http://localhost:3001](http://localhost:3001)
2. **Injete Logs**: Clique nos botões de "Simular Tráfego" (Acesso, Erro 500, Lentidão). O Frontend vai enviar esses dados reais para o seu Loki rodando no Docker.
3. *(Opcional)* Veja os dados no Grafana: Acesse [http://localhost:3005](http://localhost:3005), vá em "Explore", escolha o "Label Filter: job = frontend-logs" e clique em Run Query.
4. **Mágica do MCP + IA**: De volta ao seu Frontend, clique no botão gigante azul **"Gerar Relatório Inteligente"**. A aplicação iniciará a conexão MCP com o servidor, analisará as métricas e a IA escreverá um diagnóstico lindamente formatado na tela para você!

---

## 🔒 Segurança de Dados
Este projeto foi configurado para que o arquivo `.env.local` (que contém sua chave de API pessoal) seja ignorado pelo Git (veja o `.gitignore`). **Nunca de um commit (push) da sua chave real para o GitHub.** Sempre utilize o `.env.example` para mostrar aos usuários quais chaves são necessárias.
