import { NextResponse } from 'next/server';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function GET() {
  let transport = null;
  
  try {
    const mcpServerPath = path.resolve(process.cwd(), '../mcp-server/src/index.js');
    
    transport = new StdioClientTransport({
      command: 'node',
      args: [mcpServerPath]
    });

    const client = new Client(
      { name: 'nextjs-client', version: '1.0.0' },
      { capabilities: {} }
    );

    await client.connect(transport);

    // Obtém os dados do servidor MCP
    const result = await client.callTool({
      name: 'analyze_system_health',
      arguments: { since: '1h' }
    });

    let mcpData;
    if (result.content && result.content[0] && result.content[0].type === 'text') {
      try {
        mcpData = JSON.parse(result.content[0].text);
      } catch (e) {
        mcpData = { rawText: result.content[0].text };
      }
    }

    if (result.isError) {
      return NextResponse.json({ error: mcpData || result }, { status: 500 });
    }

    // Chama o OpenRouter para interpretar os dados
    const systemPrompt = `
      Você é um SRE (Engenheiro de Confiabilidade de Sistemas) Senior especialista em observabilidade (Grafana Loki).
      Você receberá um JSON com métricas recém extraídas do sistema.
      Sua missão é analisar os dados e escrever um relatório executivo curto e altamente visual (em Markdown) para a equipe.
      Diretrizes:
      - Use títulos (##), listas e negrito para destacar informações importantes.
      - Inclua emojis para deixar o relatório agradável.
      - Fale sobre o "Índice de Estabilidade" (Stability Score) e o que ele significa.
      - Se houver lentidão ou erros listados, cite-os brevemente e sugira como a equipe pode investigar.
      - Não repita simplesmente o JSON, aja como um especialista humano elaborando um insight.
    `;

    const completion = await openai.chat.completions.create({
      model: 'openrouter/free',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Aqui estão os dados recentes extraídos do Loki:\n\n${JSON.stringify(mcpData, null, 2)}` }
      ],
    });

    const aiReport = completion.choices[0].message.content;

    return NextResponse.json({ report: aiReport });

  } catch (error) {
    console.error('Erro na comunicação MCP / OpenRouter:', error);
    return NextResponse.json(
      { error: `Falha na integração: ${error.message}` },
      { status: 500 }
    );
  } finally {
    if (transport && typeof transport.close === 'function') {
      try {
        await transport.close();
      } catch(e) {
        console.error('Erro ao fechar transport:', e);
      }
    }
  }
}
