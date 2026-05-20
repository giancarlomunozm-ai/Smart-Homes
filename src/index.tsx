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
import arrivalChecks from './routes/arrival-checks';
import quotes from './routes/quotes';
import pricingSettings from './routes/pricing-settings';
import serviceHistory from './routes/service-history';
import sales from './routes/sales';
import publicQuotes from './routes/public-quotes';

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
app.route('/api/arrival-checks', arrivalChecks);
app.route('/api/quotes', quotes);
app.route('/api/pricing-settings', pricingSettings);
app.route('/api/service-history', serviceHistory);
app.route('/api/sales', sales);
app.route('/api/public/quotes', publicQuotes);

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

app.get('/quote/:token', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quote - Smart Spaces</title>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap');
      body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; }
    </style>
</head>
<body class="m-0 p-0 min-h-screen">
  <div id="root"></div>
  <script type="text/babel">
    const { useEffect, useMemo, useState } = React;

    const QuotePublicPage = () => {
      const [quote, setQuote] = useState(null);
      const [items, setItems] = useState([]);
      const [language, setLanguage] = useState('es');
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);
      const [signatureName, setSignatureName] = useState('');
      const [signatureEmail, setSignatureEmail] = useState('');
      const [acceptedTerms, setAcceptedTerms] = useState(false);
      const [signatureData, setSignatureData] = useState('');
      const [signing, setSigning] = useState(false);
      const [signSuccess, setSignSuccess] = useState(false);
      const token = window.location.pathname.split('/')[2];

      const labels = {
        es: {
          quote: 'Cotización',
          summary: 'Resumen',
          subtotal: 'Subtotal',
          tax: 'IVA',
          total: 'Total',
          serviceRates: 'Tarifas de servicio',
          firstHour: 'Primera hora en sitio',
          extraHour: 'Horas extra en sitio',
          client: 'Cliente',
          project: 'Proyecto',
          status: 'Estado',
          notes: 'Notas',
          items: 'Partidas',
          quantity: 'Cantidad',
          unitPrice: 'Precio unitario',
          amount: 'Importe',
          signComing: 'Firma digital disponible en esta fase',
          payComing: 'Pago con Stripe disponible en la siguiente fase',
          invalid: 'No fue posible cargar esta cotización',
          empty: 'Esta cotización todavía no tiene partidas cargadas.',
          expires: 'Expira',
          rates: 'Condiciones base',
          signTitle: 'Firma de aceptación',
          signerName: 'Nombre completo',
          signerEmail: 'Email del firmante',
          acceptance: 'Acepto esta cotización y autorizo continuar con el proceso comercial.',
          signButton: 'Firmar cotización',
          signSuccess: 'Cotización firmada correctamente',
          signedBy: 'Firmada por',
          alreadySigned: 'Esta cotización ya está firmada'
        },
        en: {
          quote: 'Quotation',
          summary: 'Summary',
          subtotal: 'Subtotal',
          tax: 'Tax',
          total: 'Total',
          serviceRates: 'Service rates',
          firstHour: 'First on-site hour',
          extraHour: 'Extra on-site hours',
          client: 'Client',
          project: 'Project',
          status: 'Status',
          notes: 'Notes',
          items: 'Items',
          quantity: 'Quantity',
          unitPrice: 'Unit price',
          amount: 'Amount',
          signComing: 'Digital signature is available in this phase',
          payComing: 'Stripe payment will be enabled in the next phase',
          invalid: 'This quotation could not be loaded',
          empty: 'This quotation does not have any line items yet.',
          expires: 'Expires',
          rates: 'Base conditions',
          signTitle: 'Acceptance signature',
          signerName: 'Full name',
          signerEmail: 'Signer email',
          acceptance: 'I accept this quotation and authorize the commercial process to continue.',
          signButton: 'Sign quotation',
          signSuccess: 'Quotation signed successfully',
          signedBy: 'Signed by',
          alreadySigned: 'This quotation is already signed'
        }
      };

      const t = labels[language] || labels.es;

      const formatMoney = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: quote?.currency || 'USD' }).format(Number(value || 0));

      useEffect(() => {
        const fetchQuote = async (langParam) => {
          try {
            const response = await fetch('/api/public/quotes/' + token + '?lang=' + langParam);
            const data = await response.json();
            if (data.success) {
              setQuote(data.quote);
              setItems(data.items || []);
              setLanguage(data.language || langParam);
            } else {
              setError(data.error || t.invalid);
            }
          } catch (err) {
            setError(t.invalid);
          } finally {
            setLoading(false);
          }
        };
        fetchQuote(language);
      }, []);

      const switchLanguage = async (lang) => {
        setLoading(true);
        try {
          const response = await fetch('/api/public/quotes/' + token + '?lang=' + lang);
          const data = await response.json();
          if (data.success) {
            setQuote(data.quote);
            setItems(data.items || []);
            setLanguage(lang);
            setError(null);
          } else {
            setError(data.error || t.invalid);
          }
        } catch (err) {
          setError(t.invalid);
        } finally {
          setLoading(false);
        }
      };

      const submitSignature = async (e) => {
        e.preventDefault();
        setSigning(true);
        try {
          const response = await fetch('/api/public/quotes/' + token + '/sign', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              signer_name: signatureName,
              signer_email: signatureEmail,
              signature_data: signatureData,
              accepted_terms: acceptedTerms
            })
          });
          const data = await response.json();
          if (data.success) {
            setQuote(prev => ({ ...prev, status: 'signed', signed_at: data.signed_at, signature_name: data.signer_name }));
            setSignSuccess(true);
            setError(null);
          } else {
            setError(data.error || t.invalid);
          }
        } catch (err) {
          setError(t.invalid);
        } finally {
          setSigning(false);
        }
      };

      if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading quotation...</div>;
      }

      if (error || !quote) {
        return <div className="min-h-screen flex items-center justify-center p-6"><div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-lg w-full text-center"><div className="text-5xl mb-4">⚠️</div><h2 className="text-2xl font-bold text-slate-900 mb-2">{t.invalid}</h2><p className="text-slate-500">{error}</p></div></div>;
      }

      return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.5em] text-slate-400 font-black mb-3">Smart Spaces / Infrastructure OS</div>
                  <h1 className="text-3xl sm:text-5xl font-light tracking-tight">{t.quote}</h1>
                  <div className="mt-4 text-sm sm:text-base text-slate-500 space-y-1">
                    <div><strong>{quote.quote_number}</strong></div>
                    <div>{quote.title}</div>
                    <div>{quote.project_name || quote.project_id}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 self-start">
                  <button onClick={() => switchLanguage('es')} className={language === 'es' ? 'px-4 py-2 rounded-full text-sm font-semibold border bg-slate-900 text-white border-slate-900' : 'px-4 py-2 rounded-full text-sm font-semibold border bg-white text-slate-700 border-slate-200'}>ES</button>
                  <button onClick={() => switchLanguage('en')} className={language === 'en' ? 'px-4 py-2 rounded-full text-sm font-semibold border bg-slate-900 text-white border-slate-900' : 'px-4 py-2 rounded-full text-sm font-semibold border bg-white text-slate-700 border-slate-200'}>EN</button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-6">
              <div className="space-y-6">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-sm">
                    <div><div className="text-slate-400 uppercase tracking-[0.25em] text-[10px] font-black mb-2">{t.client}</div><div className="text-slate-900 font-medium">{quote.client_name || '-'}</div><div className="text-slate-500 mt-1">{quote.client_email || '-'}</div></div>
                    <div><div className="text-slate-400 uppercase tracking-[0.25em] text-[10px] font-black mb-2">{t.project}</div><div className="text-slate-900 font-medium">{quote.project_name || '-'}</div><div className="text-slate-500 mt-1">{quote.project_address || ''}</div></div>
                    <div><div className="text-slate-400 uppercase tracking-[0.25em] text-[10px] font-black mb-2">{t.status}</div><div className="inline-flex px-3 py-1 rounded-full bg-slate-100 text-slate-700 uppercase tracking-[0.2em] text-xs font-bold">{quote.status}</div></div>
                    <div><div className="text-slate-400 uppercase tracking-[0.25em] text-[10px] font-black mb-2">{t.expires}</div><div className="text-slate-900 font-medium">{quote.public_expires_at ? new Date(quote.public_expires_at).toLocaleDateString(language === 'en' ? 'en-US' : 'es-ES') : '—'}</div><div className="text-slate-500 mt-1">{quote.project_type || 'project'}</div></div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-6"><h2 className="text-2xl font-bold">{t.items}</h2><span className="text-sm text-slate-500">{items.length} items</span></div>
                  <div className="space-y-4">
                    {items.length === 0 ? (
                      <div className="border border-dashed border-slate-300 rounded-2xl p-6 text-sm text-slate-500 text-center">{t.empty}</div>
                    ) : items.map(item => {
                      const title = language === 'en' ? (item.title_en || item.title_es) : item.title_es;
                      const description = language === 'en' ? (item.description_en || item.description_es) : item.description_es;
                      return (
                        <div key={item.id} className="border border-slate-200 rounded-2xl p-4 sm:p-5">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <div className="text-lg font-semibold text-slate-900">{title}</div>
                              <div className="text-sm text-slate-500 mt-1">{description || item.item_type}</div>
                            </div>
                            <div className="text-right text-sm text-slate-700">
                              <div>{t.quantity}: {item.quantity}</div>
                              <div>{t.unitPrice}: {formatMoney(item.unit_price)}</div>
                              <div className="font-bold text-slate-900 mt-1">{t.amount}: {formatMoney(item.line_total)}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="space-y-6 xl:sticky xl:top-8 self-start">
                <div className="bg-white border border-slate-200 rounded-3xl p-6">
                  <h2 className="text-xl font-bold mb-4">{t.summary}</h2>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span>{t.subtotal}</span><span>{formatMoney(quote.subtotal)}</span></div>
                    <div className="flex justify-between"><span>{t.tax}</span><span>{formatMoney(quote.tax_amount)}</span></div>
                    <div className="flex justify-between text-base font-bold pt-3 border-t border-slate-200"><span>{t.total}</span><span>{formatMoney(quote.total)}</span></div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl p-6">
                  <h3 className="text-lg font-bold mb-4">{t.serviceRates}</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span>{t.firstHour}</span><span>{formatMoney(quote.first_hour_rate)}</span></div>
                    <div className="flex justify-between"><span>{t.extraHour}</span><span>{formatMoney(quote.extra_hour_rate)}</span></div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-200 text-xs text-slate-500 leading-relaxed">{t.rates}: {quote.currency || 'USD'} · IVA {Math.round(Number(quote.tax_rate || 0.16) * 100)}%</div>
                </div>

                {(quote.notes_client_es || quote.notes_client_en) && (
                  <div className="bg-white border border-slate-200 rounded-3xl p-6">
                    <h3 className="text-lg font-bold mb-4">{t.notes}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{language === 'en' ? (quote.notes_client_en || quote.notes_client_es) : (quote.notes_client_es || quote.notes_client_en)}</p>
                  </div>
                )}

                <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{t.signTitle}</h3>
                    <p className="text-sm text-slate-500 mt-2">{quote.status === 'signed' ? t.alreadySigned : t.signComing}</p>
                  </div>

                  {quote.status === 'signed' ? (
                    <div className="rounded-2xl bg-green-50 border border-green-200 p-4 text-sm text-green-800">
                      <div className="font-semibold">{signSuccess ? t.signSuccess : t.alreadySigned}</div>
                      <div className="mt-1">{t.signedBy}: {quote.signature_name || '-'}</div>
                    </div>
                  ) : (
                    <form onSubmit={submitSignature} className="space-y-4">
                      <input value={signatureName} onChange={(e) => setSignatureName(e.target.value)} placeholder={t.signerName} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm" required />
                      <input value={signatureEmail} onChange={(e) => setSignatureEmail(e.target.value)} placeholder={t.signerEmail} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm" />
                      <input value={signatureData} onChange={(e) => setSignatureData(e.target.value)} placeholder="/s/ signature" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm" />
                      <label className="flex items-start gap-3 text-sm text-slate-600">
                        <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} className="mt-1" />
                        <span>{t.acceptance}</span>
                      </label>
                      <button type="submit" disabled={signing || !acceptedTerms} className="w-full px-4 py-3 bg-slate-950 text-white rounded-xl text-sm font-semibold disabled:opacity-50">
                        {signing ? '...' : t.signButton}
                      </button>
                    </form>
                  )}

                  <div className="text-sm text-slate-400">{t.payComing}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    };

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<QuotePublicPage />);
  </script>
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
