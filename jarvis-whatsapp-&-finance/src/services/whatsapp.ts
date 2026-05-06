import makeWASocket, { 
  DisconnectReason, 
  useMultiFileAuthState, 
  fetchLatestBaileysVersion,
  delay
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import path from 'path';
import QRCode from 'qrcode';
import { processMessage } from './ai.ts';
import { db } from '../lib/firebaseAdmin.ts';

const logger = pino({ level: 'silent' });

export let qrCodeData: string | null = null;
export let isConnected = false;

export async function startWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info');
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger,
    printQRInTerminal: true,
    auth: state,
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;
    
    if (qr) {
      QRCode.toDataURL(qr, (err, url) => {
        qrCodeData = url;
      });
    }

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
      isConnected = false;
      if (shouldReconnect) startWhatsApp();
    } else if (connection === 'open') {
      isConnected = true;
      qrCodeData = null;
      console.log('WhatsApp conectado!');
    }
  });

  sock.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const jid = msg.key.remoteJid!;
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';

    if (!text) return;

    // Jarvis pensando...
    const command = await processMessage(text);
    
    // Executar ação no banco
    await handleAction(command, jid);

    // Responder no WhatsApp
    await sock.sendMessage(jid, { text: command.response });
  });

  async function handleAction(command: any, jid: string) {
    const { action, data } = command;

    try {
      const now = new Date().toISOString();
      
      switch (action) {
        case 'record_finance':
          await db.collection('finances').add({
            amount: Number(data.amount) || 0,
            category: data.category || 'Geral',
            description: data.description || 'Sem descrição',
            type: data.type || 'saída',
            date: now
          });
          break;

        case 'add_reminder':
          await db.collection('reminders').add({
            title: data.title || 'Lembrete',
            due_date: data.due_date || 'Amanhã',
            status: 'pending',
            created_at: now
          });
          break;

        case 'add_note':
          await db.collection('notes').add({
            content: data.content || 'Nota vazia',
            created_at: now
          });
          break;

        case 'add_task':
          await db.collection('tasks').add({
            title: data.title || 'Tarefa',
            status: 'todo',
            created_at: now
          });
          break;
          
        case 'get_summary':
          const snapshot = await db.collection('finances').get();
          let income = 0;
          let outcome = 0;
          snapshot.forEach(doc => {
            const data = doc.data();
            if (data.type === 'entrada') income += data.amount;
            else outcome += data.amount;
          });
          const balance = income - outcome;
          command.response = `📊 *Resumo Financeiro Jarvis*\n\n💰 Saldo: R$ ${balance.toFixed(2)}\n📈 Entradas: R$ ${income.toFixed(2)}\n📉 Saídas: R$ ${outcome.toFixed(2)}`;
          break;
      }
    } catch (e) {
      console.error("Erro ao salvar no banco Firebase:", e);
    }
  }
}
