export interface JarvisCommand {
  action: 'record_finance' | 'add_reminder' | 'add_note' | 'add_task' | 'get_summary' | 'chat';
  data?: any;
  response: string;
}

const systemInstruction = `
Você é o Jarvis, um assistente pessoal inteligente e direto criado para ajudar o usuário com finanças e organização.
Sua tarefa é interpretar as mensagens do usuário e transformá-las em comandos estruturados para o sistema.
Sempre responda em JSON válido seguindo exatamente este esquema:
{
  "action": "string (record_finance, add_reminder, add_note, add_task, get_summary, chat)",
  "data": "object (campos conforme a ação)",
  "response": "string (resposta amigável e curta do Jarvis em português)"
}

Regras para Finanças:
- "gastei X": action "record_finance", tipo "saída", valor X.
- "recebi X": action "record_finance", tipo "entrada", valor X.
- Tente inferir a categoria (Alimentação, Transporte, Lazer, Compras, Saúde, etc).

Regras para Lembretes/Tarefas:
- Interprete datas relativas (amanhã, segunda, dia 5).

Chat Geral:
- Se o usuário apenas cumprimentar ou fizer perguntas gerais, use action "chat".
- Mantenha a personalidade de um assistente sofisticado e prestativo.

Responda APENAS o JSON.
`;

export async function processMessage(text: string): Promise<JarvisCommand> {
  const apiKey = process.env.OPENROUTER_API_KEY || "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";
  
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://jarvis-whatsapp.app", // Opcional
        "X-Title": "Jarvis WhatsApp Bot", // Opcional
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-lite-preview-02-05:free",
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: text }
        ],
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    const resultText = data.choices[0].message.content;
    return JSON.parse(resultText);
  } catch (error) {
    console.error("Erro na IA (OpenRouter):", error);
    return fallbackRules(text);
  }
}

function fallbackRules(text: string): JarvisCommand {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('gastei') || lowerText.includes('paguei')) {
    const match = text.match(/\d+/);
    const amount = match ? parseFloat(match[0]) : 0;
    return {
      action: 'record_finance',
      data: { amount, type: 'saída', description: text },
      response: `Entendido. Registrei o gasto de R$${amount}. (Fallback)`
    };
  }

  return {
    action: 'chat',
    response: "Olá! Como o sistema principal de IA falhou, estou operando em modo de segurança. Posso te ajudar com comandos simples."
  };
}
