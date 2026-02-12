const { useState, useEffect, createContext, useContext } = React;

// API Client
const API_BASE = '/api';

const api = {
  // Autenticación
  login: async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return res.json();
  },

  verify: async (token) => {
    const res = await fetch(`${API_BASE}/auth/verify`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  // Residencias
  getResidences: async (token) => {
    const res = await fetch(`${API_BASE}/residences`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  getResidence: async (token, id) => {
    const res = await fetch(`${API_BASE}/residences/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  // Dispositivos
  getDevicesByResidence: async (token, residenceId) => {
    const res = await fetch(`${API_BASE}/devices/residence/${residenceId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  // Sistemas
  getSystems: async (token) => {
    const res = await fetch(`${API_BASE}/systems`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  // Eventos
  getEventsByResidence: async (token, residenceId) => {
    const res = await fetch(`${API_BASE}/events/residence/${residenceId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  }
};

// Context para autenticación
const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.verify(token).then(result => {
        if (result.valid) {
          setUser(result.user);
        } else {
          localStorage.removeItem('token');
          setToken(null);
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const result = await api.login(email, password);
    if (result.success) {
      localStorage.setItem('token', result.token);
      setToken(result.token);
      setUser(result.user);
      return { success: true };
    }
    return result;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

// Componente de iconos (usando Lucide React icons)
const Icon = ({ name, size = 16, className = '' }) => {
  const icons = {
    Plus: () => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className={className}>
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    ),
    Eye: () => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className={className}>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>
    ),
    EyeOff: () => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className={className}>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
        <line x1="1" y1="1" x2="23" y2="23"></line>
      </svg>
    ),
    MapPin: () => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className={className}>
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
    ),
    ChevronRight: () => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className={className}>
        <polyline points="9 18 15 12 9 6"></polyline>
      </svg>
    ),
    LogOut: () => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className={className}>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
        <polyline points="16 17 21 12 16 7"></polyline>
        <line x1="21" y1="12" x2="9" y2="12"></line>
      </svg>
    ),
    Search: () => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className={className}>
        <circle cx="11" cy="11" r="8"></circle>
        <path d="m21 21-4.35-4.35"></path>
      </svg>
    ),
    Settings: () => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className={className}>
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M12 1v6m0 6v6"></path>
        <path d="m1 12h6m6 0h6"></path>
      </svg>
    ),
    Box: () => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className={className}>
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
      </svg>
    ),
    X: () => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className={className}>
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    ),
    ArrowLeft: () => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className={className}>
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
      </svg>
    ),
    Lightbulb: () => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className={className}>
        <path d="M9 18h6"></path>
        <path d="M10 22h4"></path>
        <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"></path>
      </svg>
    ),
    Music: () => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className={className}>
        <path d="M9 18V5l12-2v13"></path>
        <circle cx="6" cy="18" r="3"></circle>
        <circle cx="18" cy="16" r="3"></circle>
      </svg>
    ),
    Wifi: () => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className={className}>
        <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
        <path d="M1.42 9a16 16 0 0 1 21.16 0"></path>
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
        <line x1="12" y1="20" x2="12.01" y2="20"></line>
      </svg>
    ),
    Cctv: () => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className={className}>
        <path d="M16 16v4a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V10c0-1.1.9-2 2-2h12a2 2 0 0 1 2 2v4z"></path>
        <path d="M16 8l6-4v12l-6-4"></path>
      </svg>
    ),
    DoorOpen: () => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className={className}>
        <path d="M13 4h3a2 2 0 0 1 2 2v14"></path>
        <path d="M2 20h3"></path>
        <path d="M13 20h9"></path>
        <path d="M10 12v.01"></path>
        <path d="M13 4.562v15.157a1 1 0 0 1-.5.865l-10 5.719A.5.5 0 0 1 2 25.876V4"></path>
      </svg>
    ),
    Wind: () => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className={className}>
        <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"></path>
      </svg>
    ),
    Cpu: () => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className={className}>
        <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
        <rect x="9" y="9" width="6" height="6"></rect>
        <line x1="9" y1="1" x2="9" y2="4"></line>
        <line x1="15" y1="1" x2="15" y2="4"></line>
        <line x1="9" y1="20" x2="9" y2="23"></line>
        <line x1="15" y1="20" x2="15" y2="23"></line>
        <line x1="20" y1="9" x2="23" y2="9"></line>
        <line x1="20" y1="14" x2="23" y2="14"></line>
        <line x1="1" y1="9" x2="4" y2="9"></line>
        <line x1="1" y1="14" x2="4" y2="14"></line>
      </svg>
    ),
  };

  const IconComponent = icons[name] || icons.Box;
  return <IconComponent />;
};

// Header Global
const GlobalHeader = ({ currentView, currentResidence, onNavigate, onLogout }) => {
  return (
    <header className="fixed top-0 left-0 right-0 h-28 bg-[#F9F9F9]/70 backdrop-blur-3xl z-40 px-12 md:px-20 flex items-center justify-between border-b border-slate-200/40">
      <div 
        className="flex items-center gap-8 cursor-pointer group"
        onClick={() => onNavigate('directory')}
      >
        <div className="relative">
          <div className="w-10 h-10 bg-slate-950 flex items-center justify-center group-hover:rotate-180 transition-transform duration-1000">
            <Icon name="Box" size={20} className="text-white" />
          </div>
          <div className="absolute -inset-2 border border-slate-200 opacity-40 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="flex flex-col">
          <span className="text-[12px] uppercase tracking-[0.8em] font-black leading-none">Smart Spaces</span>
          <span className="text-[9px] uppercase tracking-[0.4em] text-slate-400 font-bold mt-2 italic">Infrastructure OS</span>
        </div>
      </div>

      <div className="flex gap-14 items-center">
        <div className="hidden lg:flex gap-10 border-r border-slate-200 pr-14 text-slate-400 text-[10px] uppercase tracking-[0.4em] font-black">
          {currentView === 'dashboard' && currentResidence ? (
            <div className="flex items-center gap-4">
              <span className="text-slate-950">{currentResidence.name}</span>
              <span className="opacity-30">/</span>
              <span className="animate-pulse">Active Session</span>
            </div>
          ) : (
            <span>Fleet Manager</span>
          )}
        </div>
        <div className="flex gap-10">
          <button className="text-slate-400 hover:text-slate-950 transition-all hover:scale-125">
            <Icon name="Search" size={20} />
          </button>
          <button className="text-slate-400 hover:text-slate-950 transition-all hover:scale-125">
            <Icon name="Settings" size={20} />
          </button>
          <button 
            onClick={onLogout}
            className="text-slate-400 hover:text-red-600 transition-all hover:scale-125"
            title="Cerrar sesión"
          >
            <Icon name="LogOut" size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

// Footer Global
const GlobalFooter = () => {
  return (
    <footer className="mt-40 pt-16 border-t border-slate-200/60 flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
      <div className="flex flex-col gap-6">
        <div className="h-[2px] w-16 bg-slate-950" />
        <div className="flex flex-col">
          <span className="text-[11px] uppercase tracking-[0.6em] text-slate-950 font-black">Smart Spaces</span>
          <span className="text-[9px] uppercase tracking-[0.3em] text-slate-400 font-bold mt-2 tracking-widest">Global Automation & Design © 2024</span>
        </div>
      </div>
      
      <div className="flex flex-col md:items-end gap-3">
        <div className="flex gap-8 text-[9px] uppercase tracking-[0.4em] font-black text-slate-400">
          <button className="hover:text-slate-950 transition-colors">Documentation</button>
          <button className="hover:text-slate-950 transition-colors">Privacy</button>
          <button className="hover:text-slate-950 transition-colors">System Status</button>
        </div>
        <div className="flex flex-col md:items-end">
          <span className="text-[9px] uppercase tracking-[0.5em] text-slate-300 font-bold mb-1">Encrypted Infrastructure</span>
          <span className="text-[9px] uppercase tracking-[0.4em] text-slate-950 font-black">Relay: 10.0.4.1 — Stable</span>
        </div>
      </div>
    </footer>
  );
};

// Directorio de Residencias
const ResidenceDirectory = ({ residences, onSelectResidence }) => {
  return (
    <div className="animate-in fade-in duration-1000">
      <div className="mb-24 space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-[2px] w-12 bg-slate-950" />
          <p className="text-[11px] uppercase tracking-[0.6em] text-slate-950 font-black">Portfolio Management</p>
        </div>
        <h1 className="text-7xl font-extralight text-slate-950 tracking-tighter">Residences</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
        {residences.map((res) => (
          <button 
            key={res.id} 
            onClick={() => onSelectResidence(res)}
            className="group relative flex flex-col gap-8 text-left"
          >
            <div className="aspect-[16/10] overflow-hidden relative">
              <img 
                src={res.image} 
                alt={res.name} 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000 ease-out"
              />
              <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex items-center justify-center">
                <span className="text-[10px] uppercase tracking-[0.5em] text-white font-black bg-slate-950/80 px-6 py-3">Access Console</span>
              </div>
              <div className="absolute top-6 left-6">
                <span className="text-[8px] uppercase tracking-[0.4em] text-white font-bold bg-slate-950 px-3 py-1.5">
                  {res.status}
                </span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <h3 className="text-3xl font-extralight text-slate-950 tracking-tight">{res.name}</h3>
                <Icon name="ChevronRight" size={20} className="text-slate-300 group-hover:text-slate-950 group-hover:translate-x-2 transition-all" />
              </div>
              <p className="text-[11px] text-slate-500 uppercase tracking-widest">{res.address}</p>
              <div className="h-[1px] w-12 bg-slate-200 group-hover:w-full group-hover:bg-slate-950 transition-all duration-700" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// Header de Residencia
const ResidenceHeader = ({ residence, activeTab, onTabChange, onBack }) => {
  return (
    <div className="relative mb-32">
      <div className="absolute -top-24 left-0 w-full h-[500px] pointer-events-none overflow-hidden">
        <img 
          src={residence.image} 
          className="w-full h-full object-cover opacity-[0.12] grayscale mix-blend-multiply transition-opacity duration-1000" 
          alt="Propiedad" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#F9F9F9]/40 to-[#F9F9F9]" />
      </div>

      <div className="relative z-10 pt-20 flex flex-col gap-12">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 opacity-100">
              <div className="h-[2px] w-12 bg-slate-950" />
              <p className="text-[11px] uppercase tracking-[0.6em] text-slate-950 font-black">
                Smart Spaces <span className="text-slate-400 font-medium">/ Infrastructure</span>
              </p>
            </div>
            <button 
              onClick={onBack}
              className="flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] font-black text-slate-400 hover:text-red-600 transition-all group pointer-events-auto"
            >
              <Icon name="LogOut" size={14} className="group-hover:-translate-x-1 transition-transform" /> 
              Exit Terminal
            </button>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <h2 className="text-8xl font-extralight text-slate-950 tracking-tighter leading-[0.85] max-w-4xl">
              {residence.name}
            </h2>
            <div className="flex flex-col items-end gap-2 pb-2">
              <span className="text-[13px] font-medium text-slate-800 flex items-center gap-2 tracking-tight text-right">
                <Icon name="MapPin" size={14} className="text-slate-950" /> {residence.address}
              </span>
              <span className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-bold">Node ID: {residence.id}</span>
            </div>
          </div>
        </div>

        <nav className="flex gap-16 border-b border-slate-200/60 w-full">
          {['systems', 'history', 'support'].map(tab => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`text-[11px] uppercase tracking-[0.5em] pb-6 transition-all relative ${
                activeTab === tab ? 'text-slate-950 font-black' : 'text-slate-300 hover:text-slate-500'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-[3px] bg-slate-950 animate-in fade-in slide-in-from-bottom-2 duration-500" />
              )}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

// Pantalla de Login
const LoginScreen = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    if (!result.success) {
      setError(result.error || 'Error al iniciar sesión');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="mb-16 text-center">
          <div className="flex items-center justify-center gap-6 mb-8">
            <div className="w-16 h-16 bg-slate-950 flex items-center justify-center">
              <Icon name="Box" size={32} className="text-white" />
            </div>
          </div>
          <h1 className="text-[12px] uppercase tracking-[0.8em] font-black mb-2">Smart Spaces</h1>
          <p className="text-[9px] uppercase tracking-[0.4em] text-slate-400 font-bold">Infrastructure OS</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-slate-100 p-12 space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.4em] font-black text-slate-950">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 text-sm focus:outline-none focus:border-slate-950 transition-colors"
              placeholder="usuario@ejemplo.com"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.4em] font-black text-slate-950">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 text-sm focus:outline-none focus:border-slate-950 transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="text-[11px] text-red-600 bg-red-50 px-4 py-3 border border-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-950 text-white py-4 text-[10px] uppercase tracking-[0.5em] font-black hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {loading ? 'Accediendo...' : 'Acceder'}
          </button>

          <div className="pt-6 border-t border-slate-100 space-y-2">
            <p className="text-[9px] uppercase tracking-[0.3em] text-slate-400 font-bold">Credenciales de prueba:</p>
            <p className="text-[10px] text-slate-600">Admin: admin@smartspaces.com / admin123</p>
            <p className="text-[10px] text-slate-600">Cliente 1: cliente1@example.com / cliente123</p>
            <p className="text-[10px] text-slate-600">Cliente 2: cliente2@example.com / cliente123</p>
          </div>
        </form>
      </div>
    </div>
  );
};

// Grid de Sistemas
const SystemsGrid = ({ systems, devices, onSelectSystem }) => {
  const getDeviceCount = (systemId) => {
    return devices.filter(d => d.system_id === systemId).length;
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-12 gap-y-24 animate-in fade-in duration-1000">
      {systems.map(sys => {
        const count = getDeviceCount(sys.id);
        return (
          <button 
            key={sys.id}
            onClick={() => onSelectSystem(sys.id)}
            className="group text-left space-y-10"
          >
            <div className="aspect-square bg-white flex items-center justify-center relative transition-all duration-700 ease-out">
              <div className="absolute inset-0 border border-slate-100" />
              <div className="absolute inset-0 border-[1.5px] border-transparent group-hover:border-slate-950 transition-all duration-500 m-[-1px]" />
              <div className="text-slate-200 group-hover:text-slate-950 transition-all duration-500 transform group-hover:scale-75">
                <Icon name={sys.icon} size={32} />
              </div>
              <div className="absolute bottom-8 opacity-0 group-hover:opacity-100 group-hover:-translate-y-2 transition-all duration-500">
                <span className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-950">{count} Units</span>
              </div>
            </div>
            <div className="space-y-3 px-1">
              <h3 className="text-[12px] font-black text-slate-950 uppercase tracking-[0.5em] group-hover:tracking-[0.6em] transition-all">{sys.name}</h3>
              <div className="h-[2px] w-8 bg-slate-900/10 group-hover:w-full group-hover:bg-slate-950 transition-all duration-700" />
            </div>
          </button>
        );
      })}
    </div>
  );
};

// Lista de Dispositivos por Sistema
const SystemDevices = ({ system, devices, onBack, onSelectDevice }) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <button 
        onClick={onBack} 
        className="flex items-center gap-4 text-[11px] uppercase tracking-[0.5em] text-slate-400 hover:text-slate-950 transition-all mb-20 font-bold"
      >
        <Icon name="ArrowLeft" size={14} /> Return to Grid
      </button>

      <div className="mb-24 flex items-baseline gap-10">
        <h3 className="text-6xl font-extralight text-slate-950 tracking-tighter">{system.name}</h3>
        <div className="h-[1px] flex-1 bg-slate-100" />
        <div className="flex flex-col items-end">
          <span className="text-[10px] uppercase tracking-[0.4em] text-slate-950 font-black">Active Nodes</span>
          <span className="text-[10px] text-slate-400 uppercase tracking-widest">{devices.length} Components</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-24 gap-y-20">
        {devices.map(device => (
          <button 
            key={device.id}
            onClick={() => onSelectDevice(device)}
            className="group text-left space-y-8"
          >
            <div className="h-[3px] w-16 bg-slate-100 group-hover:w-full group-hover:bg-slate-950 transition-all duration-700 ease-in-out" />
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-black">{device.ip}</p>
                <div className={`w-2 h-2 rounded-full transition-colors duration-500 ${
                  device.status === 'Online' ? 'bg-emerald-500' : 
                  device.status === 'Maintenance' ? 'bg-yellow-500' : 'bg-slate-200'
                }`} />
              </div>
              <h4 className="text-3xl font-light text-slate-900 group-hover:text-slate-950 transition-colors tracking-tighter leading-tight">{device.name}</h4>
              <p className="text-[11px] text-slate-500 uppercase tracking-[0.25em] font-black">{device.brand} • {device.model}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// Panel de Detalles del Dispositivo
const DeviceDetails = ({ device, onClose }) => {
  const [showPass, setShowPass] = useState(false);

  return (
    <>
      <div className="fixed inset-y-0 right-0 w-full md:w-[450px] bg-white z-50 animate-in slide-in-from-right duration-500 shadow-[0_0_150px_rgba(0,0,0,0.1)] flex flex-col border-l border-slate-100">
        <div className="p-14 pb-10 flex justify-between items-start">
          <div className="space-y-3">
            <h3 className="text-4xl font-extralight text-slate-950 tracking-tighter">{device.name}</h3>
            <div className="flex items-center gap-3">
              <div className="h-[1px] w-6 bg-slate-900" />
              <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500 font-black">{device.brand} / {device.model}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-200 hover:text-slate-950 transition-all">
            <Icon name="X" size={32} />
          </button>
        </div>
        
        <div className="px-14 py-8 space-y-12 overflow-y-auto flex-1">
          <div className="space-y-10">
            <div className="flex flex-col gap-3">
              <span className="text-[10px] uppercase tracking-[0.4em] text-slate-400 font-black">Network Topology</span>
              <span className="text-base font-mono text-slate-950 bg-slate-50 border border-slate-100 px-4 py-2 w-fit rounded-sm">{device.ip}</span>
            </div>

            <div className="grid grid-cols-1 gap-10">
              <div className="flex flex-col gap-2 border-b border-slate-50 pb-6">
                <span className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-bold">Hardware Address (MAC)</span>
                <span className="text-[17px] font-light text-slate-900 tracking-tight">{device.mac}</span>
              </div>
              <div className="flex flex-col gap-2 border-b border-slate-50 pb-6">
                <span className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-bold">Operational Firmware</span>
                <span className="text-[17px] font-light text-slate-900 tracking-tight">{device.firmware}</span>
              </div>
              <div className="flex flex-col gap-2 border-b border-slate-50 pb-6">
                <span className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-bold">System Serial No.</span>
                <span className="text-[17px] font-light text-slate-900 tracking-tight">{device.serial}</span>
              </div>
            </div>
          </div>

          <div className="pt-12 space-y-8">
            <div className="flex flex-col gap-4">
              <span className="text-[10px] uppercase tracking-[0.4em] text-slate-400 font-black">Authentication</span>
              <div className="grid grid-cols-1 gap-0 overflow-hidden border border-slate-900 rounded-sm">
                <div className="flex justify-between items-center p-6 bg-slate-950 text-white">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">User Identity</span>
                    <span className="text-sm font-medium tracking-widest">{device.username}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">Access Token</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-mono tracking-tighter">{showPass ? device.password : '••••••••'}</span>
                      <button onClick={() => setShowPass(!showPass)} className="text-slate-500 hover:text-white transition-colors">
                        <Icon name={showPass ? 'EyeOff' : 'Eye'} size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div 
        className="fixed inset-0 bg-slate-950/15 backdrop-blur-[3px] z-40 transition-all duration-1000"
        onClick={onClose}
      />
    </>
  );
};

// Aplicación Principal
const App = () => {
  const { user, token, loading, logout } = useAuth();
  const [view, setView] = useState('directory');
  const [currentResidence, setCurrentResidence] = useState(null);
  const [activeTab, setActiveTab] = useState('systems');
  const [selectedSystem, setSelectedSystem] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(null);

  const [residences, setResidences] = useState([]);
  const [residenceDetails, setResidenceDetails] = useState(null);
  const [devices, setDevices] = useState([]);
  const [systems, setSystems] = useState([]);

  useEffect(() => {
    if (token && view === 'directory') {
      loadResidences();
    }
  }, [token, view]);

  useEffect(() => {
    if (token && currentResidence) {
      loadResidenceDetails(currentResidence.id);
    }
  }, [token, currentResidence]);

  const loadResidences = async () => {
    const result = await api.getResidences(token);
    if (result.success) {
      setResidences(result.residences);
    }
  };

  const loadResidenceDetails = async (residenceId) => {
    const result = await api.getResidence(token, residenceId);
    if (result.success) {
      setResidenceDetails(result.residence);
      setDevices(result.devices);
      setSystems(result.systems);
    }
  };

  const handleSelectResidence = (residence) => {
    setCurrentResidence(residence);
    setView('dashboard');
    setActiveTab('systems');
    setSelectedSystem(null);
    setSelectedDevice(null);
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    setView('directory');
    setCurrentResidence(null);
    setSelectedSystem(null);
    setSelectedDevice(null);
    window.scrollTo(0, 0);
  };

  const handleLogout = () => {
    logout();
    setView('directory');
    setCurrentResidence(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center">
        <div className="text-[11px] uppercase tracking-[0.6em] text-slate-400 font-black animate-pulse">
          Inicializando sistema...
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  const renderContent = () => {
    if (view === 'directory') {
      return <ResidenceDirectory residences={residences} onSelectResidence={handleSelectResidence} />;
    }

    if (view === 'dashboard' && currentResidence) {
      if (activeTab === 'systems') {
        if (selectedSystem) {
          const system = systems.find(s => s.id === selectedSystem);
          const systemDevices = devices.filter(d => d.system_id === selectedSystem);
          return (
            <SystemDevices 
              system={system}
              devices={systemDevices}
              onBack={() => setSelectedSystem(null)}
              onSelectDevice={setSelectedDevice}
            />
          );
        }
        return (
          <SystemsGrid 
            systems={systems}
            devices={devices}
            onSelectSystem={setSelectedSystem}
          />
        );
      }

      return (
        <div className="py-40 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-[1px] bg-slate-950 mb-10" />
          <p className="text-[11px] uppercase tracking-[0.8em] text-slate-300 font-black">En Desarrollo</p>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] text-slate-950 font-sans selection:bg-slate-950 selection:text-white flex flex-col">
      <GlobalHeader 
        currentView={view}
        currentResidence={currentResidence}
        onNavigate={setView}
        onLogout={handleLogout}
      />

      <main className="flex-1 pt-52 pb-20 px-12 md:px-20 max-w-[1600px] mx-auto w-full">
        {view === 'dashboard' && currentResidence && (
          <ResidenceHeader 
            residence={currentResidence}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onBack={handleBack}
          />
        )}
        <div className="min-h-[500px]">
          {renderContent()}
        </div>
        <GlobalFooter />
      </main>

      {selectedDevice && (
        <DeviceDetails 
          device={selectedDevice}
          onClose={() => setSelectedDevice(null)}
        />
      )}
    </div>
  );
};

// Renderizar la aplicación
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
