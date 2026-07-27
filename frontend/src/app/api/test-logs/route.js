import { NextResponse } from 'next/server';

const LOKI_URL = process.env.LOKI_URL || 'http://localhost:3100';

export async function POST(request) {
  try {
    const { type } = await request.json();
    
    let logMessage = '';
    let logLevel = 'info';
    let status = 200;
    let duration = 50;

    switch (type) {
      case 'error':
        logMessage = 'Internal Server Error encountered in /api/users';
        logLevel = 'error';
        status = 500;
        break;
      case 'slow':
        logMessage = 'Database query timeout while fetching user profile';
        logLevel = 'warning';
        duration = 5000;
        break;
      case 'success':
        logMessage = 'User authenticated successfully';
        break;
      default:
        logMessage = 'Unknown event';
    }

    const logEntry = {
      level: logLevel,
      message: logMessage,
      status: status,
      duration: duration
    };

    // Formato Push API do Grafana Loki
    const lokiPayload = {
      streams: [
        {
          stream: {
            job: "frontend-logs",
            level: logLevel
          },
          values: [
            [
              (Date.now() * 1000000).toString(), // Nanosegundos
              JSON.stringify(logEntry)
            ]
          ]
        }
      ]
    };

    const response = await fetch(`${LOKI_URL}/loki/api/v1/push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(lokiPayload)
    });

    if (!response.ok) {
      throw new Error(`Loki respondeu com erro: ${response.status}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao enviar log pro Loki:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
