# Analisador de Logs Grafana via MCP

Uma aplicação web avançada que utiliza um frontend em Next.js e um servidor Node.js com o Protocolo de Contexto de Modelo (Model Context Protocol - MCP) para analisar logs de sistema a partir do Grafana Loki, reportando instabilidades e erros.

## Contexto

Este projeto demonstra a integração de tecnologias modernas de frontend com o emergente Protocolo de Contexto de Modelo (MCP). Ele apresenta uma interface de usuário premium e interativa construída com Next.js, e um servidor MCP robusto no backend que se conecta ao Grafana Loki para extrair e analisar logs em tempo real.

O objetivo deste projeto é fornecer uma arquitetura limpa e baseada em funcionalidades (features), muito bem documentada e pronta para ser exibida em plataformas como GitHub e LinkedIn.

## Arquitetura

*   **Frontend**: Next.js (App Router) oferecendo uma interface de usuário dinâmica e refinada.
*   **Servidor MCP**: Aplicação Node.js utilizando o SDK `@modelcontextprotocol/sdk` para expor as ferramentas de análise de logs.
*   **Integração**: As rotas da API do Next.js atuam como um Cliente MCP para interagir com o servidor MCP (Node.js), que por sua vez consulta a API HTTP do Grafana Loki.

## Funcionalidades (Planejadas)

*   **Dashboard Interativo**: Uma interface elegante com tema escuro (dark mode) para iniciar a análise dos logs.
*   **Integração MCP**: Comunicação perfeita entre o cliente web e o servidor MCP.
*   **Conectividade com Grafana Loki**: Consultas diretas às streams de logs com base em parâmetros personalizados.
*   **Detecção de Instabilidade**: Análise automatizada de logs para detectar erros, lentidão e instabilidade no sistema.

## Como Começar

*(As instruções serão adicionadas conforme a implementação do projeto avançar)*
