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
import files from './routes/files';

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
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
app.route('/api/files', files);

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

// Ruta para página de invitación (catch-all para /invite/*)
app.get('/invite/:token', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Aceptar Invitación - Smart Spaces</title>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap');
      body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }
      .animate-in {
        animation: fadeIn 0.5s ease-in;
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
    </style>
</head>
<body class="m-0 p-0 min-h-screen flex items-center justify-center">
    <div id="root"></div>
    <script type="text/babel">
      const { useState, useEffect } = React;
      
      const InvitationPage = () => {
        const [invitation, setInvitation] = useState(null);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);
        const [password, setPassword] = useState('');
        const [confirmPassword, setConfirmPassword] = useState('');
        const [submitting, setSubmitting] = useState(false);
        const [success, setSuccess] = useState(false);
        
        const token = window.location.pathname.split('/')[2];
        
        useEffect(() => {
          fetchInvitation();
        }, []);
        
        const fetchInvitation = async () => {
          try {
            const response = await fetch(\`/api/users/invite/\${token}\`);
            const data = await response.json();
            
            if (data.success) {
              setInvitation(data.invitation);
            } else {
              setError(data.error || 'Invitación no válida');
            }
          } catch (err) {
            setError('Error al cargar la invitación');
          } finally {
            setLoading(false);
          }
        };
        
        const handleSubmit = async (e) => {
          e.preventDefault();
          
          if (password.length < 6) {
            alert('La contraseña debe tener al menos 6 caracteres');
            return;
          }
          
          if (password !== confirmPassword) {
            alert('Las contraseñas no coinciden');
            return;
          }
          
          setSubmitting(true);
          
          try {
            const response = await fetch(\`/api/users/invite/\${token}/accept\`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ password })
            });
            
            const data = await response.json();
            
            if (data.success) {
              setSuccess(true);
              setTimeout(() => {
                window.location.href = '/';
              }, 3000);
            } else {
              alert(data.error || 'Error al aceptar la invitación');
            }
          } catch (err) {
            alert('Error al aceptar la invitación');
          } finally {
            setSubmitting(false);
          }
        };
        
        if (loading) {
          return (
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
              <div className="text-6xl mb-4">⏳</div>
              <div className="text-slate-600">Cargando invitación...</div>
            </div>
          );
        }
        
        if (error) {
          return (
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
              <div className="text-6xl mb-4">❌</div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Invitación No Válida</h2>
              <p className="text-slate-600 mb-6">{error}</p>
              <a href="/" className="px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors inline-block">
                Ir al Login
              </a>
            </div>
          );
        }
        
        if (success) {
          return (
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center animate-in">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">¡Cuenta Creada!</h2>
              <p className="text-slate-600 mb-4">Tu cuenta ha sido activada exitosamente.</p>
              <p className="text-sm text-slate-500">Redirigiendo al login...</p>
            </div>
          );
        }
        
        return (
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 animate-in">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">🏠</div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Bienvenido a Smart Spaces</h2>
              <p className="text-slate-600">Has sido invitado por {invitation.invited_by_name}</p>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-4 mb-6">
              <div className="text-sm font-medium text-slate-700 mb-2">Información de tu Cuenta:</div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-slate-500">📧</span>
                  <span className="text-sm text-slate-800">{invitation.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-slate-500">👤</span>
                  <span className="text-sm text-slate-800">{invitation.role === 'admin' ? 'Administrador' : 'Cliente'}</span>
                </div>
                {invitation.residence_count > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-500">🏢</span>
                    <span className="text-sm text-slate-800">{invitation.residence_count} espacios asignados</span>
                  </div>
                )}
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Crear Contraseña</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Mínimo 6 caracteres"
                  disabled={submitting}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Confirmar Contraseña</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Repite tu contraseña"
                  disabled={submitting}
                />
              </div>
              
              <button
                type="submit"
                disabled={submitting}
                className="w-full px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Activando cuenta...' : 'Activar Mi Cuenta'}
              </button>
            </form>
            
            <p className="text-xs text-center text-slate-500 mt-6">
              Esta invitación expira el {new Date(invitation.expires_at).toLocaleDateString('es-ES', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        );
      };
      
      ReactDOM.render(<InvitationPage />, document.getElementById('root'));
    </script>
</body>
</html>
  `);
});

export default app;
