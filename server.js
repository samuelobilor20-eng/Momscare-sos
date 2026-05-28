const express = require('express');
const twilio = require('twilio');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
const FROM = process.env.TWILIO_FROM;
const ANTHROPIC_KEY = process.env.ANTHROPIC_KEY;

app.post('/sos', async (req, res) => {
  const { name, phone, partnerPhone } = req.body;
  const message = `🚨 SOS from momsCare: ${name} has pressed the emergency button. Please check on her immediately.`;
  try {
    const targets = [phone, partnerPhone].filter(Boolean);
    await Promise.all(targets.map(to =>
      twilioClient.messages.create({ body: message, from: FROM, to })
    ));
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/chat', async (req, res) => {
  const { system, messages } = req.body;
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 1000,
        system,
        messages
      })
    });
    const data = await response.json();
    const reply = data.content?.[0]?.text || "I'm having trouble right now. Please try again.";
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => res.json({ status: 'momsCare server running' }));

app.listen(process.env.PORT || 3000, () => console.log('momsCare server running'));
