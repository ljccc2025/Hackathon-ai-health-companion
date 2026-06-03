import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '..', '.env.local') });
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import reminder from './ai/reminder';
import emotionFood from './ai/emotion-food';
import greeting from './ai/greeting';
import moodTreeHole from './ai/mood-tree-hole';
import weeklyReport from './ai/weekly-report';
import snackInsight from './ai/snack-insight';
import snackBatch from './ai/snack-batch';
import dailyPoem from './ai/daily-poem';
import dietPattern from './ai/diet-pattern';
import bmi from './ai/bmi';

const app = new Hono();

app.use('/*', cors({ origin: 'http://localhost:5173' }));

app.route('/api/ai/reminder', reminder);
app.route('/api/ai/emotion-food', emotionFood);
app.route('/api/ai/greeting', greeting);
app.route('/api/ai/mood-tree-hole', moodTreeHole);
app.route('/api/ai/weekly-report', weeklyReport);
app.route('/api/ai/snack-insight', snackInsight);
app.route('/api/ai/snack-batch', snackBatch);
app.route('/api/ai/daily-poem', dailyPoem);
app.route('/api/ai/diet-pattern', dietPattern);
app.route('/api/ai/bmi', bmi);

app.get('/api/health', (c) => c.json({ status: 'ok' }));

const port = Number(process.env.API_PORT) || 8787;
console.log(`API server running on http://localhost:${port}`);
serve({ fetch: app.fetch, port });
