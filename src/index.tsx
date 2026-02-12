import { Hono } from 'hono';
import { cors } from 'hono/cors';

// Importar rutas
import auth from './routes/auth';
import residences from './routes/residences';
import devices from './routes/devices';
import systems from './routes/systems';
import events from './routes/events';
import support from './routes/support';
import users from './routes/users';

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// CORS para permitir peticiones del frontend
app.use('/api/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Rutas API
app.route('/api/auth', auth);
app.route('/api/residences', residences);
app.route('/api/devices', devices);
app.route('/api/systems', systems);
app.route('/api/events', events);
app.route('/api/support', support);
app.route('/api/users', users);

// Health check
app.get('/api/health', (c) => {
  return c.json({ 
    status: 'ok', 
    message: 'Smart Spaces Infrastructure OS',
    timestamp: new Date().toISOString()
  });
});

// Servir app.js
app.get('/app.js', async (c) => {
  const appJs = await fetch(new URL('../public/app.js', import.meta.url)).then(r => r.text());
  return c.text(appJs, 200, { 'Content-Type': 'application/javascript' });
});

// Ruta principal - HTML de la aplicación
app.get('/', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Smart Spaces - Infrastructure OS</title>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap');
      body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }
      .animate-in {
        animation: fadeIn 0.5s ease-in;
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    </style>
</head>
<body class="m-0 p-0">
    <div id="root"></div>
    <script type="text/babel" src="/app.js"></script>
</body>
</html>
  `);
});

export default app;
