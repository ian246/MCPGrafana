"use client";

import { useState } from 'react';
import './globals.css';

export default function Home() {
  const [reportStatus, setReportStatus] = useState('idle'); // idle, generating, done, error
  const [reportData, setReportData] = useState(null);
  const [logStatus, setLogStatus] = useState('');

  const handleSimulateLog = async (type) => {
    setLogStatus(`Enviando simulação de ${type}...`);
    try {
      const res = await fetch('/api/test-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });
      if (res.ok) {
        setLogStatus(`Simulação de ${type} enviada com sucesso!`);
        setTimeout(() => setLogStatus(''), 3000);
      } else {
        throw new Error('Falha ao enviar log');
      }
    } catch (err) {
      setLogStatus(`Erro ao enviar log: ${err.message}`);
    }
  };

  const handleGenerateReport = async () => {
    setReportStatus('generating');
    setReportData(null);
    
    try {
      const res = await fetch('/api/analyze');
      const data = await res.json();
      
      if (data.error) throw new Error(data.error);
      
      setReportData(data);
      setReportStatus('done');
    } catch (err) {
      console.error(err);
      setReportData({ error: 'Falha ao comunicar com o servidor MCP: ' + err.message });
      setReportStatus('error');
    }
  };

  return (
    <main className="container">
      <header className="header">
        <h1 className="title">Monitoramento de Instabilidade</h1>
        <p className="subtitle">Análise avançada de logs usando MCP e Grafana Loki</p>
      </header>

      <div className="dashboard">
        <section className="card">
          <h2 className="card-title">🔬 Simulador de Tráfego</h2>
          <p style={{ marginBottom: '1rem', color: '#94a3b8', fontSize: '0.9rem' }}>
            Injete logs no Loki local para testar a ferramenta de análise.
          </p>
          <div className="button-group">
            <button onClick={() => handleSimulateLog('success')} className="btn btn-success">
              ✓ Simular Acesso 200
            </button>
            <button onClick={() => handleSimulateLog('error')} className="btn btn-danger">
              ⚠️ Simular Erro 500
            </button>
            <button onClick={() => handleSimulateLog('slow')} className="btn btn-warning">
              ⏳ Simular Lentidão
            </button>
          </div>
          {logStatus && (
            <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#818cf8' }}>
              {logStatus}
            </div>
          )}
        </section>

        <section className="card">
          <h2 className="card-title">📊 Análise MCP</h2>
          <button 
            onClick={handleGenerateReport} 
            disabled={reportStatus === 'generating'}
            className={`btn btn-primary ${reportStatus === 'generating' ? 'loading' : ''}`}
          >
            {reportStatus === 'generating' ? 'Gerando Relatório...' : 'Gerar Relatório de Instabilidade'}
          </button>

          <div className="report-container">
            {reportStatus === 'idle' && (
              <div className="report-placeholder">O relatório gerado aparecerá aqui</div>
            )}
            
            {reportStatus === 'generating' && (
              <div className="report-placeholder loading">Analisando logs via Model Context Protocol...</div>
            )}

            {(reportStatus === 'done' || reportStatus === 'error') && reportData && (
              <pre className="report-content">
                {JSON.stringify(reportData, null, 2)}
              </pre>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
