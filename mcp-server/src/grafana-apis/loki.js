import axios from 'axios';

const LOKI_URL = process.env.LOKI_URL || 'http://localhost:3101';

/**
 * Busca logs do Loki usando uma query LogQL
 * @param {string} query LogQL query (ex: '{job="frontend-logs"}')
 * @param {number} limit Limite de logs retornados
 * @param {string} since Tempo de busca no passado (ex: '1h', '30m')
 */
export async function queryLoki(query, limit = 100, since = '1h') {
  try {
    const start = new Date(Date.now() - parseTime(since)).getTime() * 1000000; // Loki usa nanosegundos
    const url = `${LOKI_URL}/loki/api/v1/query_range`;
    
    const response = await axios.get(url, {
      params: {
        query,
        limit,
        start
      }
    });
    
    return response.data.data.result;
  } catch (error) {
    console.error('Erro ao buscar logs do Loki:', error.message);
    throw new Error(`Falha na conexão com o Loki: ${error.message}`);
  }
}

/**
 * Função utilitária para converter strings como '1h', '30m' para milissegundos
 */
function parseTime(timeStr) {
  const match = timeStr.match(/^(\d+)([smhd])$/);
  if (!match) return 60 * 60 * 1000; // Padrão: 1 hora
  
  const value = parseInt(match[1]);
  const unit = match[2];
  
  switch(unit) {
    case 's': return value * 1000;
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    default: return 60 * 60 * 1000;
  }
}

/**
 * Analisa a estabilidade baseada nos logs retornados pelo Loki.
 */
export async function analyzeSystemHealth(since = '1h') {
  const query = '{job="frontend-logs"}'; // Filtro padrão para os logs que vamos injetar
  const logs = await queryLoki(query, 500, since);
  
  let totalLogs = 0;
  let errors = 0;
  let slowRequests = 0;
  const errorDetails = [];
  
  // O Loki retorna os dados no formato de streams
  logs.forEach(stream => {
    stream.values.forEach(([timestamp, logLine]) => {
      totalLogs++;
      
      try {
        const parsedLog = JSON.parse(logLine);
        
        // Simples detecção de erros e lentidão baseada no JSON parseado
        if (parsedLog.level === 'error' || (parsedLog.status && parsedLog.status >= 500)) {
          errors++;
          errorDetails.push({ time: new Date(timestamp / 1000000).toISOString(), message: parsedLog.message || 'Erro Desconhecido' });
        }
        
        if (parsedLog.duration && parsedLog.duration > 1000) { // Maior que 1000ms = lento
          slowRequests++;
        }
      } catch (e) {
        // Se não for JSON, fazemos match por string
        const lowerLine = logLine.toLowerCase();
        if (lowerLine.includes('error') || lowerLine.includes('exception') || lowerLine.includes('fail')) {
          errors++;
          errorDetails.push({ time: new Date(timestamp / 1000000).toISOString(), message: logLine.substring(0, 100) });
        }
        if (lowerLine.includes('timeout') || lowerLine.includes('slow')) {
          slowRequests++;
        }
      }
    });
  });

  const stabilityScore = totalLogs === 0 ? 100 : Math.max(0, 100 - ((errors / totalLogs) * 100) - ((slowRequests / totalLogs) * 50));
  
  let status = "Saudável";
  if (stabilityScore < 70) status = "Instável";
  if (stabilityScore < 40) status = "Crítico";

  return {
    period: since,
    totalLogsAnalyzed: totalLogs,
    systemStatus: status,
    stabilityScore: Math.round(stabilityScore),
    metrics: {
      errors,
      slowRequests
    },
    recentErrors: errorDetails.slice(-5) // Retorna os últimos 5 erros para o relatório
  };
}
