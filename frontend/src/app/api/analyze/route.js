import { NextResponse } from 'next/server';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import path from 'path';

export async function GET() {
  let transport = null;
  
  try {
    // Caminho absoluto para o servidor mcp
    // Considerando que a API roda no Next.js (frontend/) e o MCP está em ../mcp-server/src/index.js
    const mcpServerPath = path.resolve(process.cwd(), '../mcp-server/src/index.js');
    
    transport = new StdioClientTransport({
      command: 'node',
      args: [mcpServerPath]
    });

    const client = new Client(
      {
        name: 'nextjs-client',
        version: '1.0.0'
      },
      {
        capabilities: {}
      }
    );

    // Conecta ao servidor MCP
    await client.connect(transport);

    // Invoca a ferramenta (tool) que criamos no mcp-server
    const result = await client.callTool({
      name: 'analyze_system_health',
      arguments: {
        since: '1h' // Poderia ser passado pela query string
      }
    });

    let parsedContent;
    if (result.content && result.content[0] && result.content[0].type === 'text') {
      try {
        parsedContent = JSON.parse(result.content[0].text);
      } catch (e) {
        parsedContent = { rawText: result.content[0].text };
      }
    }

    if (result.isError) {
      return NextResponse.json({ error: parsedContent || result }, { status: 500 });
    }

    return NextResponse.json(parsedContent || result);

  } catch (error) {
    console.error('Erro na comunicação com o MCP Server:', error);
    return NextResponse.json(
      { error: `Falha na integração MCP: ${error.message}` },
      { status: 500 }
    );
  } finally {
    // Fechar o transporte se ele foi aberto para evitar vazamento de processos (zombies)
    if (transport && typeof transport.close === 'function') {
      try {
        await transport.close();
      } catch(e) {
        console.error('Erro ao fechar transport:', e);
      }
    }
  }
}
