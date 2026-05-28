const express = require('express');
const twilio = require('twilio');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
const FROM = process.env.TWILIO_FROM;

app.post('/sos', async (req, res) => {
  const { name, phone, partnerPhone } = req.body;
  const msg = `🚨 SOS from momsCare: ${name} has pressed the emergency button. Please check on her immediately.`;
  try {
    const targets = [phone, partnerPhone].filter(Boolean);
    await Promise.all(targets.map(to =>
      client.messages.create({ body: msg, from: FROM, to })
    ));
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(process.env.PORT || 3000);
