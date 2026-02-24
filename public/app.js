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
  },

  // Soporte
  getTicketsByResidence: async (token, residenceId) => {
    const res = await fetch(`${API_BASE}/support/residence/${residenceId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  getTicketDetails: async (token, ticketId) => {
    const res = await fetch(`${API_BASE}/support/${ticketId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  createTicket: async (token, data) => {
    const res = await fetch(`${API_BASE}/support`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  addTicketResponse: async (token, ticketId, message) => {
    const res = await fetch(`${API_BASE}/support/${ticketId}/responses`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ message })
    });
    return res.json();
  },

  updateTicketStatus: async (token, ticketId, status) => {
    const res = await fetch(`${API_BASE}/support/${ticketId}/status`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ status })
    });
    return res.json();
  },

  // Usuarios
  getUsers: async (token) => {
    const res = await fetch(`${API_BASE}/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  getAvailableResidences: async (token) => {
    const res = await fetch(`${API_BASE}/users/available-residences`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  createUser: async (token, data) => {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  addUserResidence: async (token, userId, residenceId) => {
    const res = await fetch(`${API_BASE}/users/${userId}/residences`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ residence_id: residenceId })
    });
    return res.json();
  },

  removeUserResidence: async (token, userId, residenceId) => {
    const res = await fetch(`${API_BASE}/users/${userId}/residences/${residenceId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  deleteUser: async (token, userId) => {
    const res = await fetch(`${API_BASE}/users/${userId}`, {
      method: 'DELETE',
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
const GlobalHeader = ({ currentView, currentResidence, onNavigate, onLogout, userRole }) => {
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
          {userRole === 'admin' && (
            <button 
              onClick={() => onNavigate('users')}
              className={`text-slate-400 hover:text-slate-950 transition-all hover:scale-125 ${currentView === 'users' ? 'text-slate-950 scale-125' : ''}`}
              title="Gestión de Usuarios"
            >
              <Icon name="Users" size={20} />
            </button>
          )}
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
          {['systems', 'documents', 'history', 'support'].map(tab => (
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

// ==================== LISTA COMPLETA DE DISPOSITIVOS ====================
const DevicesList = ({ devices, systems, onSelectDevice, userRole, residenceId, token, onDevicesChange }) => {
  const [editingDevice, setEditingDevice] = React.useState(null);
  const [newDevice, setNewDevice] = React.useState({
    name: '',
    ip: '',
    mac: '',
    brand: '',
    model: '',
    serial: '',
    firmware: '',
    username: 'admin',
    password: '',
    status: 'Online'
  });
  const [searchTerm, setSearchTerm] = React.useState('');

  // Detectar IPs duplicadas
  const getIPConflicts = () => {
    const ipCount = {};
    devices.forEach(device => {
      if (device.ip) {
        ipCount[device.ip] = (ipCount[device.ip] || 0) + 1;
      }
    });
    return Object.keys(ipCount).filter(ip => ipCount[ip] > 1);
  };

  const conflictIPs = getIPConflicts();

  const handleEditDevice = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/devices/${editingDevice.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newDevice)
      });
      const data = await response.json();
      if (data.success) {
        setEditingDevice(null);
        setNewDevice({
          name: '',
          ip: '',
          mac: '',
          brand: '',
          model: '',
          serial: '',
          firmware: '',
          username: 'admin',
          password: '',
          status: 'Online'
        });
        if (onDevicesChange) onDevicesChange();
        alert('Dispositivo actualizado exitosamente');
      } else {
        alert('Error: ' + (data.error || 'No se pudo actualizar el dispositivo'));
      }
    } catch (error) {
      console.error('Error updating device:', error);
      alert('Error al actualizar dispositivo');
    }
  };

  const handleDeleteDevice = async (deviceId) => {
    if (!confirm('¿Estás seguro de eliminar este dispositivo?')) return;
    
    try {
      const response = await fetch(`/api/devices/${deviceId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        if (onDevicesChange) onDevicesChange();
        alert('Dispositivo eliminado');
      }
    } catch (error) {
      console.error('Error deleting device:', error);
    }
  };

  const openEditModal = (device) => {
    setEditingDevice(device);
    setNewDevice({
      name: device.name,
      ip: device.ip,
      mac: device.mac,
      brand: device.brand,
      model: device.model,
      serial: device.serial,
      firmware: device.firmware,
      username: device.username,
      password: device.password,
      status: device.status
    });
  };

  const getSystemName = (systemId) => {
    const system = systems.find(s => s.id === systemId);
    return system ? system.name : 'Unknown';
  };

  // Filtrar dispositivos por búsqueda
  const filteredDevices = devices.filter(device => {
    const searchLower = searchTerm.toLowerCase();
    return (
      device.name.toLowerCase().includes(searchLower) ||
      device.ip.toLowerCase().includes(searchLower) ||
      device.brand.toLowerCase().includes(searchLower) ||
      device.model.toLowerCase().includes(searchLower) ||
      getSystemName(device.system_id).toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header con búsqueda */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-4xl font-extralight text-slate-950 tracking-tighter mb-2">Todos los Dispositivos</h3>
            <p className="text-sm text-slate-500">{filteredDevices.length} dispositivos encontrados</p>
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, IP, marca, modelo o sistema..."
            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900"
            >
              ✖
            </button>
          )}
        </div>

        {/* Alerta de conflictos IP */}
        {conflictIPs.length > 0 && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <span className="text-lg">⚠️</span>
              <div>
                <p className="font-semibold text-sm">Conflictos de IP Detectados</p>
                <p className="text-xs text-red-700 mt-1">
                  Las siguientes IPs están duplicadas: {conflictIPs.join(', ')}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de edición */}
      {editingDevice && (
        <div className="mb-8 bg-white rounded-lg border border-slate-200 p-6 animate-in">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Editar Dispositivo</h3>
          <form onSubmit={handleEditDevice} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={newDevice.name}
                  onChange={(e) => setNewDevice({...newDevice, name: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">IP Address</label>
                <input
                  type="text"
                  required
                  value={newDevice.ip}
                  onChange={(e) => setNewDevice({...newDevice, ip: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">MAC Address</label>
                <input
                  type="text"
                  required
                  value={newDevice.mac}
                  onChange={(e) => setNewDevice({...newDevice, mac: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Marca</label>
                <input
                  type="text"
                  required
                  value={newDevice.brand}
                  onChange={(e) => setNewDevice({...newDevice, brand: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Modelo</label>
                <input
                  type="text"
                  required
                  value={newDevice.model}
                  onChange={(e) => setNewDevice({...newDevice, model: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Serial</label>
                <input
                  type="text"
                  required
                  value={newDevice.serial}
                  onChange={(e) => setNewDevice({...newDevice, serial: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Firmware</label>
                <input
                  type="text"
                  required
                  value={newDevice.firmware}
                  onChange={(e) => setNewDevice({...newDevice, firmware: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                <input
                  type="text"
                  value={newDevice.username}
                  onChange={(e) => setNewDevice({...newDevice, username: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  value={newDevice.password}
                  onChange={(e) => setNewDevice({...newDevice, password: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                <select
                  value={newDevice.status}
                  onChange={(e) => setNewDevice({...newDevice, status: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm"
                >
                  <option value="Online">Online</option>
                  <option value="Offline">Offline</option>
                  <option value="Maintenance">Mantenimiento</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setEditingDevice(null);
                  setNewDevice({
                    name: '',
                    ip: '',
                    mac: '',
                    brand: '',
                    model: '',
                    serial: '',
                    firmware: '',
                    username: 'admin',
                    password: '',
                    status: 'Online'
                  });
                }}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm"
              >
                Actualizar Dispositivo
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla de dispositivos */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Nombre</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">IP</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Sistema</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Marca/Modelo</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Estado</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-700 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredDevices.map((device) => {
              const hasIPConflict = conflictIPs.includes(device.ip);
              return (
                <tr key={device.id} className={`hover:bg-slate-50 ${hasIPConflict ? 'bg-red-50' : ''}`}>
                  <td className="px-4 py-4">
                    <div className="text-sm font-medium text-slate-900">{device.name}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className={`text-sm font-mono ${hasIPConflict ? 'text-red-700 font-bold' : 'text-slate-600'}`}>
                      {device.ip}
                      {hasIPConflict && <span className="ml-2 text-xs">⚠️ DUPLICADA</span>}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="px-2 py-1 text-xs bg-slate-100 text-slate-700 rounded">
                      {getSystemName(device.system_id)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-slate-600">{device.brand} {device.model}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        device.status === 'Online' ? 'bg-emerald-500' : 
                        device.status === 'Maintenance' ? 'bg-yellow-500' : 'bg-slate-300'
                      }`} />
                      <span className="text-xs text-slate-600">{device.status}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => onSelectDevice(device)}
                        className="text-slate-600 hover:text-slate-900 text-xs font-medium px-3 py-1 border border-slate-200 rounded hover:bg-slate-50"
                        title="Ver detalles"
                      >
                        Detalles
                      </button>
                      {userRole === 'admin' && (
                        <>
                          <button
                            onClick={() => openEditModal(device)}
                            className="text-slate-600 hover:text-slate-900 text-xs font-medium px-3 py-1 border border-slate-200 rounded hover:bg-slate-50"
                            title="Editar"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteDevice(device.id)}
                            className="text-red-600 hover:text-red-800 text-xs font-medium px-3 py-1 border border-red-200 rounded hover:bg-red-50"
                            title="Eliminar"
                          >
                            Eliminar
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredDevices.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <div className="text-slate-400">No se encontraron dispositivos</div>
          </div>
        )}
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
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-8 gap-y-16 animate-in fade-in duration-1000">
      {systems.map(sys => {
        const count = getDeviceCount(sys.id);
        return (
          <button 
            key={sys.id}
            onClick={() => onSelectSystem(sys.id)}
            className="group text-left space-y-6"
          >
            <div className="aspect-square bg-white flex items-center justify-center relative transition-all duration-700 ease-out">
              <div className="absolute inset-0 border border-slate-100" />
              <div className="absolute inset-0 border-[1.5px] border-transparent group-hover:border-slate-950 transition-all duration-500 m-[-1px]" />
              <div className="text-slate-200 group-hover:text-slate-950 transition-all duration-500 transform group-hover:scale-90">
                <Icon name={sys.icon} size={64} />
              </div>
              <div className="absolute bottom-4 opacity-0 group-hover:opacity-100 group-hover:-translate-y-1 transition-all duration-500">
                <span className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-950">{count} Units</span>
              </div>
            </div>
            <div className="space-y-2 px-1">
              <h3 className="text-[10px] font-black text-slate-950 uppercase tracking-[0.4em] group-hover:tracking-[0.5em] transition-all">{sys.name}</h3>
              <div className="h-[2px] w-6 bg-slate-900/10 group-hover:w-full group-hover:bg-slate-950 transition-all duration-700" />
            </div>
          </button>
        );
      })}
    </div>
  );
};

// Lista de Dispositivos por Sistema
const SystemDevices = ({ system, devices, onBack, onSelectDevice, userRole, residenceId, token, onDevicesChange }) => {
  const [showAddDevice, setShowAddDevice] = React.useState(false);
  const [editingDevice, setEditingDevice] = React.useState(null);
  const [newDevice, setNewDevice] = React.useState({
    name: '',
    ip: '',
    mac: '',
    brand: '',
    model: '',
    serial: '',
    firmware: '',
    username: 'admin',
    password: '',
    status: 'Online'
  });

  const handleAddDevice = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/devices', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newDevice,
          system_id: system.id,
          residence_id: residenceId
        })
      });
      const data = await response.json();
      if (data.success) {
        setNewDevice({
          name: '',
          ip: '',
          mac: '',
          brand: '',
          model: '',
          serial: '',
          firmware: '',
          username: 'admin',
          password: '',
          status: 'Online'
        });
        setShowAddDevice(false);
        if (onDevicesChange) onDevicesChange();
        alert('Dispositivo agregado exitosamente');
      } else {
        alert('Error: ' + (data.error || 'No se pudo agregar el dispositivo'));
      }
    } catch (error) {
      console.error('Error adding device:', error);
      alert('Error al agregar dispositivo');
    }
  };

  const handleEditDevice = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/devices/${editingDevice.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newDevice)
      });
      const data = await response.json();
      if (data.success) {
        setEditingDevice(null);
        setNewDevice({
          name: '',
          ip: '',
          mac: '',
          brand: '',
          model: '',
          serial: '',
          firmware: '',
          username: 'admin',
          password: '',
          status: 'Online'
        });
        if (onDevicesChange) onDevicesChange();
        alert('Dispositivo actualizado exitosamente');
      } else {
        alert('Error: ' + (data.error || 'No se pudo actualizar el dispositivo'));
      }
    } catch (error) {
      console.error('Error updating device:', error);
      alert('Error al actualizar dispositivo');
    }
  };

  const handleDeleteDevice = async (deviceId) => {
    if (!confirm('¿Estás seguro de eliminar este dispositivo?')) return;
    
    try {
      const response = await fetch(`/api/devices/${deviceId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        if (onDevicesChange) onDevicesChange();
        alert('Dispositivo eliminado');
      }
    } catch (error) {
      console.error('Error deleting device:', error);
    }
  };

  const openEditModal = (device) => {
    setEditingDevice(device);
    setNewDevice({
      name: device.name,
      ip: device.ip,
      mac: device.mac,
      brand: device.brand,
      model: device.model,
      serial: device.serial,
      firmware: device.firmware,
      username: device.username,
      password: device.password,
      status: device.status
    });
  };

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
        <div className="flex flex-col items-end gap-3">
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-[0.4em] text-slate-950 font-black">Active Nodes</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest">{devices.length} Components</span>
          </div>
          {userRole === 'admin' && (
            <button
              onClick={() => setShowAddDevice(true)}
              className="px-4 py-2 bg-slate-900 text-white rounded text-xs uppercase tracking-wider hover:bg-slate-800 transition-colors"
            >
              + Add Device
            </button>
          )}
        </div>
      </div>

      {/* Add/Edit Device Modal */}
      {(showAddDevice || editingDevice) && (
        <div className="mb-8 bg-white rounded-lg border border-slate-200 p-6 animate-in">
          <h3 className="text-lg font-bold text-slate-800 mb-4">
            {editingDevice ? 'Editar Dispositivo' : 'Agregar Nuevo Dispositivo'}
          </h3>
          <form onSubmit={editingDevice ? handleEditDevice : handleAddDevice} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={newDevice.name}
                  onChange={(e) => setNewDevice({...newDevice, name: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm"
                  placeholder="Main Switch"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">IP Address</label>
                <input
                  type="text"
                  required
                  value={newDevice.ip}
                  onChange={(e) => setNewDevice({...newDevice, ip: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm"
                  placeholder="192.168.1.10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">MAC Address</label>
                <input
                  type="text"
                  required
                  value={newDevice.mac}
                  onChange={(e) => setNewDevice({...newDevice, mac: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm"
                  placeholder="00:11:22:33:44:55"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Marca</label>
                <input
                  type="text"
                  required
                  value={newDevice.brand}
                  onChange={(e) => setNewDevice({...newDevice, brand: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm"
                  placeholder="Cisco"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Modelo</label>
                <input
                  type="text"
                  required
                  value={newDevice.model}
                  onChange={(e) => setNewDevice({...newDevice, model: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm"
                  placeholder="SG350-28"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Serial</label>
                <input
                  type="text"
                  required
                  value={newDevice.serial}
                  onChange={(e) => setNewDevice({...newDevice, serial: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm"
                  placeholder="SN123456789"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Firmware</label>
                <input
                  type="text"
                  required
                  value={newDevice.firmware}
                  onChange={(e) => setNewDevice({...newDevice, firmware: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm"
                  placeholder="v2.5.8"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                <input
                  type="text"
                  value={newDevice.username}
                  onChange={(e) => setNewDevice({...newDevice, username: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm"
                  placeholder="admin"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  value={newDevice.password}
                  onChange={(e) => setNewDevice({...newDevice, password: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm"
                  placeholder="••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                <select
                  value={newDevice.status}
                  onChange={(e) => setNewDevice({...newDevice, status: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm"
                >
                  <option value="Online">Online</option>
                  <option value="Offline">Offline</option>
                  <option value="Maintenance">Mantenimiento</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowAddDevice(false);
                  setEditingDevice(null);
                  setNewDevice({
                    name: '',
                    ip: '',
                    mac: '',
                    brand: '',
                    model: '',
                    serial: '',
                    firmware: '',
                    username: 'admin',
                    password: '',
                    status: 'Online'
                  });
                }}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm"
              >
                {editingDevice ? 'Actualizar' : 'Agregar'} Dispositivo
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-24 gap-y-20">
        {devices.map(device => (
          <div key={device.id} className="group text-left space-y-8 relative">
            <div className="h-[3px] w-16 bg-slate-100 group-hover:w-full group-hover:bg-slate-950 transition-all duration-700 ease-in-out" />
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-black">{device.ip}</p>
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full transition-colors duration-500 ${
                    device.status === 'Online' ? 'bg-emerald-500' : 
                    device.status === 'Maintenance' ? 'bg-yellow-500' : 'bg-slate-200'
                  }`} />
                  {userRole === 'admin' && (
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(device);
                        }}
                        className="text-slate-600 hover:text-slate-900 text-xs"
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDevice(device.id);
                        }}
                        className="text-red-600 hover:text-red-800 text-xs"
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <button 
                onClick={() => onSelectDevice(device)}
                className="w-full text-left"
              >
                <h4 className="text-3xl font-light text-slate-900 group-hover:text-slate-950 transition-colors tracking-tighter leading-tight">{device.name}</h4>
                <p className="text-[11px] text-slate-500 uppercase tracking-[0.25em] font-black">{device.brand} • {device.model}</p>
              </button>
            </div>
          </div>
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

// ==================== DOCUMENTS TAB COMPONENT ====================
const DocumentsTab = ({ residenceId, token, userRole }) => {
  const [files, setFiles] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [showUpload, setShowUpload] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [newFile, setNewFile] = React.useState({
    file_category: 'topology',
    description: ''
  });
  const [selectedFile, setSelectedFile] = React.useState(null);

  React.useEffect(() => {
    fetchFiles();
  }, [residenceId, token]);

  const fetchFiles = async () => {
    try {
      const response = await fetch(`/api/files/residence/${residenceId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setFiles(data.files || []);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('El archivo excede el límite de 5MB');
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Por favor selecciona un archivo');
      return;
    }

    setUploading(true);

    try {
      // Convertir archivo a base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result.split(',')[1];

        const response = await fetch('/api/files/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            residence_id: residenceId,
            file_name: selectedFile.name,
            file_data: base64,
            file_category: newFile.file_category,
            description: newFile.description,
            mime_type: selectedFile.type
          })
        });

        const data = await response.json();
        if (data.success) {
          setNewFile({ file_category: 'topology', description: '' });
          setSelectedFile(null);
          setShowUpload(false);
          fetchFiles();
          alert('Archivo subido exitosamente');
        } else {
          alert('Error: ' + (data.error || 'No se pudo subir el archivo'));
        }
        setUploading(false);
      };

      reader.onerror = () => {
        alert('Error al leer el archivo');
        setUploading(false);
      };

      reader.readAsDataURL(selectedFile);

    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error al subir archivo');
      setUploading(false);
    }
  };

  const handleDelete = async (fileId, fileName) => {
    if (!confirm(`¿Estás seguro de eliminar "${fileName}"?`)) return;

    try {
      const response = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        fetchFiles();
        alert('Archivo eliminado');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const getCategoryLabel = (category) => {
    const labels = {
      topology: 'Topología',
      contract: 'Contrato',
      delivery: 'Acta de Entrega',
      manual: 'Manual',
      invoice: 'Factura',
      other: 'Otro'
    };
    return labels[category] || category;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      topology: '🗺️',
      contract: '📄',
      delivery: '📦',
      manual: '📚',
      invoice: '🧾',
      other: '📎'
    };
    return icons[category] || '📎';
  };

  const getFileIcon = (fileType) => {
    const icons = {
      pdf: '📕',
      image: '🖼️',
      document: '📝',
      other: '📄'
    };
    return icons[fileType] || '📄';
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate-400">Cargando documentos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Documentos</h3>
          <p className="text-sm text-slate-500 mt-1">Topologías, contratos, actas de entrega y más</p>
        </div>
        {userRole === 'admin' && (
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center space-x-2"
          >
            <span>{showUpload ? '✖' : '➕'}</span>
            <span>{showUpload ? 'Cancelar' : 'Subir Archivo'}</span>
          </button>
        )}
      </div>

      {/* Upload Form */}
      {showUpload && (
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-4 animate-in">
          <h4 className="text-lg font-bold text-slate-800 mb-4">Subir Nuevo Archivo</h4>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Archivo (Max 5MB)</label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.xls,.xlsx"
                onChange={handleFileSelect}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm"
                required
              />
              {selectedFile && (
                <p className="text-xs text-slate-500 mt-2">
                  📎 {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
                <select
                  value={newFile.file_category}
                  onChange={(e) => setNewFile({...newFile, file_category: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm"
                >
                  <option value="topology">Topología</option>
                  <option value="contract">Contrato</option>
                  <option value="delivery">Acta de Entrega</option>
                  <option value="manual">Manual</option>
                  <option value="invoice">Factura</option>
                  <option value="other">Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción (opcional)</label>
                <input
                  type="text"
                  value={newFile.description}
                  onChange={(e) => setNewFile({...newFile, description: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm"
                  placeholder="Ej: Topología de red actualizada 2026"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowUpload(false);
                  setSelectedFile(null);
                  setNewFile({ file_category: 'topology', description: '' });
                }}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm disabled:opacity-50"
              >
                {uploading ? 'Subiendo...' : 'Subir Archivo'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Files Grid */}
      {files.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📂</div>
          <div className="text-slate-400">No hay documentos subidos</div>
          {userRole === 'admin' && (
            <button
              onClick={() => setShowUpload(true)}
              className="mt-4 text-sm text-slate-600 hover:text-slate-900"
            >
              Subir primer documento →
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map((file) => (
            <div key={file.id} className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{getFileIcon(file.file_type)}</span>
                  <span className="text-lg">{getCategoryIcon(file.file_category)}</span>
                </div>
                {userRole === 'admin' && (
                  <button
                    onClick={() => handleDelete(file.id, file.file_name)}
                    className="text-red-600 hover:text-red-800 text-xs"
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                )}
              </div>
              
              <h4 className="text-sm font-semibold text-slate-800 mb-1 truncate" title={file.file_name}>
                {file.file_name}
              </h4>
              
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-2 py-1 text-xs bg-slate-100 text-slate-700 rounded">
                  {getCategoryLabel(file.file_category)}
                </span>
                <span className="text-xs text-slate-500">
                  {formatFileSize(file.file_size)}
                </span>
              </div>

              {file.description && (
                <p className="text-xs text-slate-600 mb-3 line-clamp-2">{file.description}</p>
              )}

              <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                <span>Por: {file.uploaded_by_name || 'Admin'}</span>
                <span>{new Date(file.created_at).toLocaleDateString('es-ES')}</span>
              </div>

              <a
                href={file.file_url}
                download={file.file_name}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full px-3 py-2 bg-slate-900 text-white text-center text-sm rounded hover:bg-slate-800 transition-colors"
              >
                Ver / Descargar
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
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
  const [devicesViewMode, setDevicesViewMode] = useState('grid'); // 'grid' o 'list'

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

    if (view === 'users') {
      return <UserManagement token={token} userRole={user?.role} />;
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
              userRole={user?.role}
              residenceId={currentResidence.id}
              token={token}
              onDevicesChange={loadResidenceDetails}
            />
          );
        }
        
        // Botón para cambiar vista
        return (
          <div>
            <div className="flex justify-end mb-8">
              <div className="flex gap-2 bg-white border border-slate-200 rounded-lg p-1">
                <button
                  onClick={() => setDevicesViewMode('grid')}
                  className={`px-4 py-2 text-xs font-medium rounded transition-colors ${
                    devicesViewMode === 'grid'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🔲 Por Sistema
                </button>
                <button
                  onClick={() => setDevicesViewMode('list')}
                  className={`px-4 py-2 text-xs font-medium rounded transition-colors ${
                    devicesViewMode === 'list'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  📋 Lista Completa
                </button>
              </div>
            </div>
            
            {devicesViewMode === 'grid' ? (
              <SystemsGrid 
                systems={systems}
                devices={devices}
                onSelectSystem={setSelectedSystem}
              />
            ) : (
              <DevicesList
                devices={devices}
                systems={systems}
                onSelectDevice={setSelectedDevice}
                userRole={user?.role}
                residenceId={currentResidence.id}
                token={token}
                onDevicesChange={loadResidenceDetails}
              />
            )}
          </div>
        );
      }

      if (activeTab === 'history') {
        return <HistoryTab residenceId={currentResidence.id} token={token} />;
      }

      if (activeTab === 'documents') {
        return <DocumentsTab residenceId={currentResidence.id} token={token} userRole={user?.role} />;
      }

      if (activeTab === 'support') {
        return <SupportTab residenceId={currentResidence.id} token={token} userRole={user?.role} />;
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
        userRole={user?.role}
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

// ==================== HISTORY TAB COMPONENT ====================
const HistoryTab = ({ residenceId, token }) => {
  const [events, setEvents] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`/api/events/residence/${residenceId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
          setEvents(data.events || []);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    if (residenceId && token) {
      fetchEvents();
    }
  }, [residenceId, token]);

  const getEventIcon = (eventType) => {
    const icons = {
      device_added: '➕',
      device_removed: '➖',
      firmware_update: '🔄',
      device_configured: '⚙️',
      device_status_change: '🔌',
      maintenance_started: '🔧',
      maintenance_completed: '✅',
      user_login: '👤',
      scene_created: '🎬',
      system_check: '🔍',
      subscription_expired: '⚠️',
      default: '📝'
    };
    return icons[eventType] || icons.default;
  };

  const getEventColor = (eventType) => {
    const colors = {
      device_added: 'text-green-600',
      device_removed: 'text-red-600',
      firmware_update: 'text-blue-600',
      maintenance_completed: 'text-green-600',
      maintenance_started: 'text-yellow-600',
      user_login: 'text-purple-600',
      subscription_expired: 'text-red-600',
      default: 'text-gray-600'
    };
    return colors[eventType] || colors.default;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate-400">Cargando historial...</div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📭</div>
        <div className="text-slate-400">No hay eventos registrados</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-800">Timeline de Eventos</h3>
        <div className="text-sm text-slate-500">{events.length} eventos</div>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200"></div>

        {/* Events */}
        <div className="space-y-4">
          {events.map((event, index) => (
            <div key={event.id} className="relative flex items-start space-x-4 animate-in">
              {/* Timeline dot */}
              <div className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-xl ${getEventColor(event.event_type)}`}>
                {getEventIcon(event.event_type)}
              </div>

              {/* Event card */}
              <div className="flex-1 bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                        {event.event_type.replace(/_/g, ' ')}
                      </span>
                      {event.device_name && (
                        <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                          {event.device_name}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-700 mb-2">{event.description}</p>
                    <div className="flex items-center space-x-3 text-xs text-slate-500">
                      <span>{formatDate(event.created_at)}</span>
                      {event.user_name && (
                        <>
                          <span>•</span>
                          <span>Por: {event.user_name}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-slate-400">
                    {new Date(event.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ==================== SUPPORT TAB COMPONENT ====================
const SupportTab = ({ residenceId, token, userRole }) => {
  const [tickets, setTickets] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [showNewTicket, setShowNewTicket] = React.useState(false);
  const [newTicket, setNewTicket] = React.useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'General'
  });

  React.useEffect(() => {
    fetchTickets();
  }, [residenceId, token]);

  const fetchTickets = async () => {
    try {
      const response = await fetch(`/api/support/residence/${residenceId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setTickets(data.tickets || []);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newTicket,
          residence_id: residenceId
        })
      });
      const data = await response.json();
      if (data.success) {
        setNewTicket({ title: '', description: '', priority: 'medium', category: 'General' });
        setShowNewTicket(false);
        fetchTickets();
        alert('Ticket creado exitosamente!');
      } else {
        alert('Error: ' + (data.error || 'No se pudo crear el ticket'));
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert('Error al crear ticket: ' + error.message);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-blue-100 text-blue-700',
      medium: 'bg-yellow-100 text-yellow-700',
      high: 'bg-orange-100 text-orange-700',
      urgent: 'bg-red-100 text-red-700'
    };
    return colors[priority] || colors.medium;
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-blue-100 text-blue-700',
      in_progress: 'bg-purple-100 text-purple-700',
      resolved: 'bg-green-100 text-green-700',
      closed: 'bg-slate-100 text-slate-700'
    };
    return colors[status] || colors.open;
  };

  const getStatusIcon = (status) => {
    const icons = {
      open: '🔵',
      in_progress: '🟣',
      resolved: '✅',
      closed: '⚫'
    };
    return icons[status] || '🔵';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate-400">Cargando tickets...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-800">Tickets de Soporte</h3>
        <button
          onClick={() => setShowNewTicket(!showNewTicket)}
          className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center space-x-2"
        >
          <span>{showNewTicket ? '✖' : '➕'}</span>
          <span>{showNewTicket ? 'Cancelar' : 'Nuevo Ticket'}</span>
        </button>
      </div>

      {/* New Ticket Form */}
      {showNewTicket && (
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-4 animate-in">
          <h4 className="text-lg font-bold text-slate-800 mb-4">Crear Nuevo Ticket</h4>
          <form onSubmit={handleCreateTicket} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
              <input
                type="text"
                required
                value={newTicket.title}
                onChange={(e) => setNewTicket({...newTicket, title: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                placeholder="Ej: Problema con router principal"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
              <textarea
                required
                rows="4"
                value={newTicket.description}
                onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                placeholder="Describe el problema en detalle..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Prioridad</label>
                <select
                  value={newTicket.priority}
                  onChange={(e) => setNewTicket({...newTicket, priority: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                >
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
                <select
                  value={newTicket.category}
                  onChange={(e) => setNewTicket({...newTicket, category: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                >
                  <option value="General">General</option>
                  <option value="Network">Red</option>
                  <option value="Security">Seguridad</option>
                  <option value="Automation">Automatización</option>
                  <option value="Users">Usuarios</option>
                  <option value="Billing">Facturación</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowNewTicket(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                Crear Ticket
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tickets List */}
      {tickets.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <div className="text-slate-400">No hay tickets registrados</div>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">{getStatusIcon(ticket.status)}</span>
                    <h4 className="text-lg font-semibold text-slate-800">{ticket.title}</h4>
                  </div>
                  <p className="text-slate-600 mb-3">{ticket.description}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(ticket.status)}`}>
                      {ticket.status.replace(/_/g, ' ').toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getPriorityColor(ticket.priority)}`}>
                      Prioridad: {ticket.priority.toUpperCase()}
                    </span>
                    <span className="px-2 py-1 text-xs bg-slate-100 text-slate-700 rounded">
                      {ticket.category}
                    </span>
                    <span className="text-xs text-slate-500">
                      • Ticket #{ticket.id}
                    </span>
                    <span className="text-xs text-slate-500">
                      • {new Date(ticket.created_at).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ==================== USER MANAGEMENT COMPONENT (ADMIN ONLY) ====================
const UserManagement = ({ token, userRole }) => {
  const [users, setUsers] = React.useState([]);
  const [residences, setResidences] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [showInviteForm, setShowInviteForm] = React.useState(false);
  const [newUser, setNewUser] = React.useState({
    email: '',
    name: '',
    password: '',
    role: 'client',
    residences: []
  });
  const [editingUser, setEditingUser] = React.useState(null);
  const [editUser, setEditUser] = React.useState({
    id: null,
    email: '',
    name: '',
    residences: []
  });

  React.useEffect(() => {
    if (userRole !== 'admin') {
      return; // Solo admin puede ver esto
    }
    fetchUsers();
    fetchResidences();
  }, [token, userRole]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchResidences = async () => {
    try {
      const response = await fetch('/api/residences', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setResidences(data.residences || []);
      }
    } catch (error) {
      console.error('Error fetching residences:', error);
    }
  };

  const handleInviteUser = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUser)
      });
      const data = await response.json();
      if (data.success) {
        setNewUser({
          email: '',
          name: '',
          password: '',
          role: 'client',
          residences: []
        });
        setShowInviteForm(false);
        fetchUsers();
        alert('Usuario creado exitosamente');
      } else {
        alert('Error: ' + (data.error || 'No se pudo crear el usuario'));
      }
    } catch (error) {
      console.error('Error inviting user:', error);
      alert('Error al crear usuario');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
    
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        fetchUsers();
        alert('Usuario eliminado');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const toggleResidence = (residenceId) => {
    setNewUser(prev => ({
      ...prev,
      residences: prev.residences.includes(residenceId)
        ? prev.residences.filter(id => id !== residenceId)
        : [...prev.residences, residenceId]
    }));
  };

  const handleEditUser = (user) => {
    setEditingUser(user.id);
    setEditUser({
      id: user.id,
      email: user.email,
      name: user.name,
      residences: user.residences || []
    });
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/users/${editUser.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: editUser.name,
          email: editUser.email,
          residences: editUser.residences
        })
      });
      const data = await response.json();
      if (data.success) {
        setEditingUser(null);
        setEditUser({ id: null, email: '', name: '', residences: [] });
        fetchUsers();
        alert('Usuario actualizado exitosamente');
      } else {
        alert('Error: ' + (data.error || 'No se pudo actualizar el usuario'));
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error al actualizar usuario');
    }
  };

  const toggleEditResidence = (residenceId) => {
    setEditUser(prev => ({
      ...prev,
      residences: prev.residences.includes(residenceId)
        ? prev.residences.filter(id => id !== residenceId)
        : [...prev.residences, residenceId]
    }));
  };

  if (userRole !== 'admin') {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔒</div>
        <div className="text-slate-600 text-lg font-medium">Acceso Solo para Administradores</div>
        <div className="text-slate-400 mt-2">Esta sección está restringida al equipo Smart Spaces</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate-400">Cargando usuarios...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestión de Usuarios</h2>
          <p className="text-slate-500 mt-1">Administra usuarios y permisos de acceso</p>
        </div>
        <button
          onClick={() => setShowInviteForm(!showInviteForm)}
          className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center space-x-2"
        >
          <span>{showInviteForm ? '✖' : '➕'}</span>
          <span>{showInviteForm ? 'Cancelar' : 'Invitar Usuario'}</span>
        </button>
      </div>

      {/* Invite Form */}
      {showInviteForm && (
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6 animate-in">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Crear Nuevo Usuario</h3>
          <form onSubmit={handleInviteUser} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  placeholder="Ej: Juan Pérez"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  placeholder="usuario@example.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
                <input
                  type="password"
                  required
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Rol</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                >
                  <option value="client">Cliente</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Residencias Asignadas</label>
              <div className="grid grid-cols-3 gap-3">
                {residences.map(residence => (
                  <label key={residence.id} className="flex items-center space-x-2 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newUser.residences.includes(residence.id)}
                      onChange={() => toggleResidence(residence.id)}
                      className="rounded text-slate-900 focus:ring-slate-900"
                    />
                    <span className="text-sm text-slate-700">{residence.id} - {residence.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowInviteForm(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                Crear Usuario
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6 animate-in">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Editar Usuario</h3>
          <form onSubmit={handleUpdateUser} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={editUser.name}
                  onChange={(e) => setEditUser({...editUser, name: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  placeholder="Ej: Juan Pérez"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={editUser.email}
                  onChange={(e) => setEditUser({...editUser, email: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  placeholder="usuario@example.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Residencias Asignadas</label>
              <div className="grid grid-cols-3 gap-3">
                {residences.map(residence => (
                  <label key={residence.id} className="flex items-center space-x-2 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editUser.residences.includes(residence.id)}
                      onChange={() => toggleEditResidence(residence.id)}
                      className="rounded text-slate-900 focus:ring-slate-900"
                    />
                    <span className="text-sm text-slate-700">{residence.id} - {residence.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setEditingUser(null);
                  setEditUser({ id: null, email: '', name: '', residences: [] });
                }}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                Actualizar Usuario
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Usuario</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Rol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Residencias</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Creado</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-700 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-slate-900">{user.name}</div>
                    <div className="text-sm text-slate-500">{user.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {user.role === 'admin' ? 'ADMIN' : 'CLIENTE'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-slate-600">
                    {user.residence_count || 0} residencias
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-slate-500">
                    {new Date(user.created_at).toLocaleDateString('es-ES')}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="text-slate-600 hover:text-slate-900 text-sm font-medium"
                    >
                      Editar
                    </button>
                    {user.role !== 'admin' && (
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="text-2xl font-bold text-slate-800">{users.length}</div>
          <div className="text-sm text-slate-500">Total Usuarios</div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="text-2xl font-bold text-slate-800">{users.filter(u => u.role === 'admin').length}</div>
          <div className="text-sm text-slate-500">Administradores</div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="text-2xl font-bold text-slate-800">{users.filter(u => u.role === 'client').length}</div>
          <div className="text-sm text-slate-500">Clientes</div>
        </div>
      </div>
    </div>
  );
};

// ====================UPDATE APP COMPONENT WITH NEW VIEWS====================
// Reemplazar el componente App existente con soporte para History, Support y Users
