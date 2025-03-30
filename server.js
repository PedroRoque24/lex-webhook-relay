const express = require('express');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

console.log('[BOOT] Starting Lex Webhook Relay...');
console.log('[BOOT] Supabase URL:', process.env.SUPABASE_URL || '[MISSING]');
console.log('[BOOT] Supabase KEY:', process.env.SUPABASE_KEY ? '[LOADED]' : '[MISSING]');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.post('/relay', async (req, res) => {
    const { type, payload } = req.body;

    if (!type || !payload) {
        console.error('[Relay] ERROR: Missing type or payload');
        return res.status(400).json({ error: 'Missing type or payload' });
    }

    const { error } = await supabase
        .from('live_task')
        .insert([
            {
                type,
                payload,
                timestamp: Date.now()
            }
        ]);

    if (error) {
        console.error('[Relay] Supabase insert error:', error.message);
        return res.status(500).json({ error: error.message });
    }

    console.log('[Relay] ✅ Task inserted into Supabase:', { type, payload });
    res.status(200).json({ status: 'ok' });
});

app.get('/', (req, res) => {
    res.send('Lex Webhook Relay is live.');
});

app.listen(PORT, () => {
    console.log(`🚀 Relay server running on port ${PORT}`);
});
