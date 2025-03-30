const express = require('express');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

console.log('\n[BOOT] Lex Webhook Relay Starting...');
console.log('[BOOT] Supabase URL:', process.env.SUPABASE_URL || '[MISSING]');
console.log('[BOOT] Supabase KEY:', process.env.SUPABASE_KEY ? '[LOADED]' : '[MISSING]');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.get('/', (req, res) => {
  res.send('Lex Webhook Relay is live.');
});

app.post('/relay', async (req, res) => {
  console.log('\n[Relay] 🔔 Incoming POST to /relay');
  console.log('[Relay] Payload:', req.body);

  const { type, payload } = req.body;

  if (!type || !payload) {
    console.warn('[Relay] ❗ Missing type or payload');
    return res.status(400).json({ error: 'Missing type or payload' });
  }

  try {
    const { error } = await supabase
      .from('live_task')
      .insert([{ type, payload, timestamp: Date.now() }]);

    if (error) {
      console.error('[Relay] ❌ Supabase insert error:', error.message);
      return res.status(500).json({ error: error.message });
    }

    console.log('[Relay] ✅ Task inserted into Supabase:', { type, payload });
    res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error('[Relay] ❌ Unexpected error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Relay server running on port ${PORT}`);
});
