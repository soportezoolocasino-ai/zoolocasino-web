import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useZooloState } from '@/hooks/useZooloState';
import { ANIMALS, getAnimal, A_NAMES, TT_NAMES, formatTimeDisplay, VENEZUELA_TIMES, PERU_TIMES, type Animal } from '@/data/animals';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Clock, 
  Calendar, 
  Trophy, 
  TrendingUp, 
  Star,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  LayoutGrid,
  List,
  MapPin,
  Lock,
  User,
  LogOut,
  Save,
  Trash2,
  Plus,
  Dice3,
  Hash,
  ChevronDown,
  HelpCircle,
  Mail,
  Smartphone,
  Info
} from 'lucide-react';
import './App.css';

// URL de tu API en Render
const API_URL = "https://zoolocasino-api.onrender.com";

// ─────────────────────────────────────────────
// COMPONENTE CALENDARIO INLINE
// ─────────────────────────────────────────────
interface InlineCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onClose: () => void;
}

function InlineCalendar({ selectedDate, onSelectDate, onClose }: InlineCalendarProps) {
  const [month, setMonth] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const DAYS_HEADER = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

  const generateDays = () => {
    const year = month.getFullYear();
    const m = month.getMonth();
    const firstDay = new Date(year, m, 1).getDay();
    const total = new Date(year, m + 1, 0).getDate();
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= total; i++) days.push(i);
    return days;
  };

  const isSelected = (day: number | null) =>
    day !== null &&
    day === selectedDate.getDate() &&
    month.getMonth() === selectedDate.getMonth() &&
    month.getFullYear() === selectedDate.getFullYear();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="bg-emerald-900 border border-emerald-700 rounded-2xl shadow-2xl p-4 w-full max-w-xs" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="p-2 hover:bg-emerald-800 rounded-lg active:scale-95 transition-transform">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-bold text-sm">{MONTHS[month.getMonth()]} {month.getFullYear()}</span>
          <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="p-2 hover:bg-emerald-800 rounded-lg active:scale-95 transition-transform">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center mb-1">
          {DAYS_HEADER.map((d) => (<div key={d} className="text-emerald-400 text-xs py-1 font-medium">{d}</div>))}
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {generateDays().map((day, i) => (
            <button key={i} disabled={!day} onClick={() => { if (day) { onSelectDate(new Date(month.getFullYear(), month.getMonth(), day)); onClose(); } }}
              className={`aspect-square rounded-lg text-sm font-medium transition-all active:scale-95 ${!day ? 'invisible' : ''} ${isSelected(day) ? 'bg-yellow-500 text-black font-bold shadow-lg' : 'hover:bg-emerald-800 text-white'}`}>
              {day || ''}
            </button>
          ))}
        </div>
        <button onClick={onClose} className="mt-3 w-full py-2 text-sm text-emerald-400 hover:text-white hover:bg-emerald-800 rounded-lg transition-colors">Cerrar</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ADMIN PANEL
// ─────────────────────────────────────────────
function AdminPanelContent({ activeAdminTab, getDayState, updateVenezuela, updatePeru, updateTriple, updateTerminal, updateMas1, clearVenezuela, clearPeru, clearTriple, clearTerminal, clearMas1, showToast, adminSelectedDate, setAdminSelectedDate }: any) {
  const [localResults, setLocalResults] = useState<Record<string, string>>({});
  const [showAdminCalendar, setShowAdminCalendar] = useState(false);

  const formatAdminDate = (date: Date) => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return `${days[date.getDay()]}, ${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
  };

  const adminDayState = getDayState(adminSelectedDate);

  useEffect(() => {
    const results: Record<string, string> = {};
    if (activeAdminTab === 'venezuela') {
      adminDayState.venezuela.forEach((s: any) => { results[s.id] = s.result; });
    } else if (activeAdminTab === 'peru') {
      adminDayState.peru.forEach((s: any) => { results[s.id] = s.result; });
    } else if (activeAdminTab === 'triples') {
      adminDayState.triples.forEach((s: any) => {
        results[`${s.id}_r1`] = s.r1; results[`${s.id}_r2`] = s.r2; results[`${s.id}_r3`] = s.r3;
      });
    } else if (activeAdminTab === 'terminales') {
      adminDayState.terminales.forEach((s: any) => {
        results[`${s.id}_r1`] = s.r1; results[`${s.id}_r2`] = s.r2;
      });
    } else if (activeAdminTab === 'mas1') {
      results['mas1_numero'] = adminDayState.mas1.numero;
      results['mas1_animal'] = adminDayState.mas1.animal_num;
    }
    setLocalResults(results);
  }, [activeAdminTab, adminDayState]);

  const handleSave = async () => {
    const dateStr = adminSelectedDate.toISOString().split('T');
    try {
      await fetch(`${API_URL}/api/results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: dateStr, game_type: activeAdminTab, data: localResults })
      });
    } catch (err) { console.error("Error nube:", err); }

    if (activeAdminTab === 'venezuela') {
      adminDayState.venezuela.forEach((s: any) => { if (localResults[s.id] !== undefined) updateVenezuela(adminSelectedDate, s.id, localResults[s.id]); });
    } else if (activeAdminTab === 'peru') {
      adminDayState.peru.forEach((s: any) => { if (localResults[s.id] !== undefined) updatePeru(adminSelectedDate, s.id, localResults[s.id]); });
    } else if (activeAdminTab === 'triples') {
      adminDayState.triples.forEach((s: any) => { updateTriple(adminSelectedDate, s.id, localResults[`${s.id}_r1`] || '', localResults[`${s.id}_r2`] || '', localResults[`${s.id}_r3`] || ''); });
    } else if (activeAdminTab === 'terminales') {
      adminDayState.terminales.forEach((s: any) => { updateTerminal(adminSelectedDate, s.id, localResults[`${s.id}_r1`] || '', localResults[`${s.id}_r2`] || ''); });
    } else if (activeAdminTab === 'mas1') {
      updateMas1(adminSelectedDate, localResults['mas1_numero'] || '', localResults['mas1_animal'] || '');
    }
    showToast('Resultados guardados correctamente');
  };

  return (
    <>
      {showAdminCalendar && (
        <InlineCalendar selectedDate={adminSelectedDate} onSelectDate={setAdminSelectedDate} onClose={() => setShowAdminCalendar(false)} />
      )}
      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
        <div className="bg-emerald-800/50 p-3 rounded-lg mb-4">
          <label className="text-sm text-emerald-300 mb-2 block">Fecha de los resultados:</label>
          <button onClick={() => setShowAdminCalendar(true)} className="flex items-center gap-2 bg-emerald-700 px-3 py-2 rounded-lg hover:bg-emerald-600 w-full active:scale-95 transition-transform">
            <Calendar className="w-4 h-4 text-yellow-400 flex-shrink-0" />
            <span className="text-sm text-left">{formatAdminDate(adminSelectedDate)}</span>
          </button>
        </div>
        {(activeAdminTab === 'venezuela' || activeAdminTab === 'peru') && (
          <>
            <h3 className="font-bold text-yellow-400 mb-2">
              {activeAdminTab === 'venezuela' ? '🇻🇪 ZooloCASINO Venezuela' : '🇵🇪 ZooloCASINO Perú'}
            </h3>
            {(activeAdminTab === 'venezuela' ? adminDayState.venezuela : adminDayState.peru).map((s: any) => (
              <div key={s.id} className="flex items-center justify-between p-3 bg-emerald-800 rounded-lg">
                <div><div className="font-semibold">{A_NAMES[s.time]}</div><div className="text-sm text-emerald-400">{formatTimeDisplay(s.time)}</div></div>
                <div className="flex items-center gap-2">
                  <Input type="text" value={localResults[s.id] || ''} onChange={(e) => setLocalResults({ ...localResults, [s.id]: e.target.value })} placeholder="0-40" className="w-24 text-center bg-emerald-700 border-emerald-600 text-white" />
                  <Button size="sm" variant="destructive" onClick={() => { setLocalResults({ ...localResults, [s.id]: '' }); activeAdminTab === 'venezuela' ? clearVenezuela(adminSelectedDate, s.id) : clearPeru(adminSelectedDate, s.id); }}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </>
        )}
        {activeAdminTab === 'triples' && (
          <>
            <h3 className="font-bold text-yellow-400 mb-2">🎲 Triple ZooloCASINO</h3>
            {adminDayState.triples.map((s: any) => (
              <div key={s.id} className="flex items-center justify-between p-3 bg-emerald-800 rounded-lg">
                <div><div className="font-semibold">{TT_NAMES[s.time]}</div></div>
                <div className="flex items-center gap-2">
                  <Input type="text" value={localResults[`${s.id}_r1`] || ''} onChange={(e) => setLocalResults({ ...localResults, [`${s.id}_r1`]: e.target.value })} placeholder="1ra" className="w-16 text-center bg-emerald-700 text-white" />
                  <Input type="text" value={localResults[`${s.id}_r2`] || ''} onChange={(e) => setLocalResults({ ...localResults, [`${s.id}_r2`]: e.target.value })} placeholder="2da" className="w-16 text-center bg-emerald-700 text-white" />
                  <Input type="text" value={localResults[`${s.id}_r3`] || ''} onChange={(e) => setLocalResults({ ...localResults, [`${s.id}_r3`]: e.target.value })} placeholder="3ra" className="w-16 text-center bg-emerald-700 text-white" />
                  <Button size="sm" variant="destructive" onClick={() => clearTriple(adminSelectedDate, s.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            ))}
          </>
        )}
        {activeAdminTab === 'terminales' && (
          <>
            <h3 className="font-bold text-yellow-400 mb-2">🔢 Terminal ZooloCASINO</h3>
            {adminDayState.terminales.map((s: any) => (
              <div key={s.id} className="flex items-center justify-between p-3 bg-emerald-800 rounded-lg">
                <div><div className="font-semibold">{TT_NAMES[s.time]}</div></div>
                <div className="flex items-center gap-2">
                  <Input type="text" value={localResults[`${s.id}_r1`] || ''} onChange={(e) => setLocalResults({ ...localResults, [`${s.id}_r1`]: e.target.value })} placeholder="T1" className="w-16 text-center bg-emerald-700 text-white" />
                  <Input type="text" value={localResults[`${s.id}_r2`] || ''} onChange={(e) => setLocalResults({ ...localResults, [`${s.id}_r2`]: e.target.value })} placeholder="T2" className="w-16 text-center bg-emerald-700 text-white" />
                  <Button size="sm" variant="destructive" onClick={() => clearTerminal(adminSelectedDate, s.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            ))}
          </>
        )}
        {activeAdminTab === 'mas1' && (
          <div className="p-4 bg-emerald-800 rounded-lg">
            <h3 className="font-bold text-yellow-400 mb-4">⭐ MÁS 1</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm text-emerald-300 mb-1 block">Número (0-9)</label>
                <Input type="number" min="0" max="9" value={localResults['mas1_numero'] || ''} onChange={(e) => setLocalResults({ ...localResults, mas1_numero: e.target.value })} placeholder="0-9" className="text-center text-xl font-bold bg-emerald-700 border-emerald-600 text-white" />
              </div>
              <div>
                <label className="text-sm text-emerald-300 mb-1 block">Animalito</label>
                <select value={localResults['mas1_animal'] || ''} onChange={(e) => setLocalResults({ ...localResults, mas1_animal: e.target.value })} className="w-full p-2 rounded bg-emerald-700 border border-emerald-600 text-white">
                  <option value="">Seleccionar</option>
                  {ANIMALS.map(a => (<option key={a.num} value={a.num}>{a.num} - {a.name}</option>))}
                </select>
              </div>
            </div>
            <Button size="sm" variant="destructive" onClick={() => clearMas1(adminSelectedDate)} className="mb-4">
              <Trash2 className="w-4 h-4 mr-2" /> Borrar
            </Button>
          </div>
        )}
        <Button onClick={handleSave} className="w-full mt-4 bg-yellow-500 hover:bg-yellow-600 text-black font-bold">
          <Save className="w-4 h-4 mr-2" />Guardar Cambios
        </Button>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// APP PRINCIPAL
// ─────────────────────────────────────────────
function App() {
  const [selectedGame, setSelectedGame] = useState<'peru' | 'venezuela' | 'triples' | 'terminales' | 'mas1'>('venezuela');
  const [activeSection, setActiveSection] = useState<'inicio' | 'resultados' | 'animales' | 'horarios' | 'preguntas' | 'contacto'>('inicio');
  const [menuOpen, setMenuOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [activeAdminTab, setActiveAdminTab] = useState<'venezuela' | 'peru' | 'triples' | 'terminales' | 'mas1'>('venezuela');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [animalFilter, setAnimalFilter] = useState<'todos' | 'rojos' | 'negros' | 'verdes'>('todos');
  const [animalView, setAnimalView] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [sorteosDropdownOpen, setSorteosDropdownOpen] = useState(false);
  const [resultadosDropdownOpen, setResultadosDropdownOpen] = useState(false);
  const [adminSelectedDate, setAdminSelectedDate] = useState(new Date());

  const { getDayState, venezuelaTime, peruTime, isAuthenticated, isPast, isNext, login, logout, checkAuth, updateVenezuela, updatePeru, updateTriple, updateTerminal, updateMas1, clearVenezuela, clearPeru, clearTriple, clearTerminal, clearMas1 } = useZooloState();

  const dayState = getDayState(selectedDate);
  const { venezuela: vRes, peru: pRes, triples: tRes, terminales: termRes, mas1: mRes } = dayState;

  useEffect(() => {
    const syncData = async () => {
      const dateStr = selectedDate.toISOString().split('T');
      try {
        const response = await fetch(`${API_URL}/api/results/${dateStr}`);
        const cloudData = await response.json();
        cloudData.forEach((entry: any) => {
          if (entry.game_type === 'venezuela') Object.keys(entry.data).forEach(id => updateVenezuela(selectedDate, id, entry.data[id]));
          if (entry.game_type === 'peru') Object.keys(entry.data).forEach(id => updatePeru(selectedDate, id, entry.data[id]));
        });
      } catch (err) { console.error("Sync error:", err); }
    };
    syncData();
  }, [selectedDate, updateVenezuela, updatePeru]);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  useEffect(() => {
    const handleClick = () => { setSorteosDropdownOpen(false); setResultadosDropdownOpen(false); };
    if (sorteosDropdownOpen || resultadosDropdownOpen) document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [sorteosDropdownOpen, resultadosDropdownOpen]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => { setToast({ message, type }); setTimeout(() => setToast(null), 3000); };
  const formatDate = (date: Date) => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return `${days[date.getDay()]}, ${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault(); setLoginError('');
    if (login(loginForm.username, loginForm.password)) {
      setLoginOpen(false); setAdminOpen(true); setLoginForm({ username: '', password: '' }); showToast('Bienvenido');
    } else { setLoginError('Error'); }
  };

  const getSorteos = () => selectedGame === 'peru' ? pRes : vRes;

  const getAnimalDelMomento = useCallback(() => {
    const s = getSorteos();
    for (let i = s.length - 1; i >= 0; i--) if (s[i].result) return { sorteo: s[i], animal: getAnimal(s[i].result) };
    return { sorteo: s, animal: null };
  }, [selectedGame, vRes, pRes]);

  const filteredAnimals = ANIMALS.filter(a => {
    if (animalFilter !== 'todos' && a.color !== animalFilter.slice(0, -1)) return false;
    if (searchQuery) return a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.num.includes(searchQuery);
    return true;
  });

  const getAnimalImagePath = (a: Animal, c: 'venezuela' | 'peru') => {
    const n = a.name.toLowerCase().replace(/[áéíóúñü]/g, x => ({'á':'a','é':'e','í':'i','ó':'o','ú':'u','ñ':'n','ü':'u'}[x]||x));
    return c === 'peru' ? `/animals/peru/${a.num}-${n}.jpg` : `/animals/${a.num}-${n}.jpg`;
  };

  const renderAnimalitoCard = (s: any) => {
    const done = s.result && s.result.trim() !== '';
    const next = isNext(s.time, selectedGame === 'peru' ? 'peru' : 'venezuela');
    const animal = done ? getAnimal(s.result) : null;
    const country = selectedGame === 'peru' ? 'peru' : 'venezuela';
    return (
      <div key={s.id} className={`sorteo-card ${done ? 'finalizado' : next ? 'en-vivo' : 'pendiente'}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="sorteo-time"><Clock className="w-4 h-4" />{formatTimeDisplay(s.time)}</div>
          <span>{country === 'peru' ? '🇵🇪' : '🇻🇪'}</span>
        </div>
        {done && animal ? (
          <>
            <img src={getAnimalImagePath(animal, country)} className={`sorteo-animal-img-large border-4 ${animal.color === 'rojo' ? 'border-red-500' : animal.color === 'verde' ? 'border-green-500' : 'border-gray-800'}`} onError={(e) => { (e.target as HTMLImageElement).src = '/animals/0-delfin.jpg'; }} />
            <div className="sorteo-animal-name">{animal.name}</div><div className="sorteo-animal-num">N° {s.result}</div>
          </>
        ) : (
          <div className="sorteo-placeholder">{next ? <div className="live-indicator" /> : <Clock className="w-8 h-8 opacity-50" />}</div>
        )}
        <Badge className={`sorteo-badge ${done ? 'finalizado' : next ? 'en-vivo' : 'pendiente'}`}>{done ? 'Finalizado' : next ? 'En Vivo' : 'Pendiente'}</Badge>
      </div>
    );
  };

  const { sorteo: adM, animal: aMD } = getAnimalDelMomento();

  return (
    <div className="min-h-screen bg-emerald-900 text-white">
      {datePickerOpen && <InlineCalendar selectedDate={selectedDate} onSelectDate={setSelectedDate} onClose={() => setDatePickerOpen(false)} />}
      {toast && <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg z-50 ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>{toast.message}</div>}

      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent className="bg-emerald-900 border-emerald-700 text-white">
          <DialogHeader><DialogTitle>Admin</DialogTitle></DialogHeader>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input value={loginForm.username} onChange={e => setLoginForm({...loginForm, username: e.target.value})} placeholder="User" className="bg-emerald-800" />
            <Input type="password" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} placeholder="Pass" className="bg-emerald-800" />
            <Button type="submit" className="w-full bg-yellow-500 text-black">Login</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={adminOpen} onOpenChange={setAdminOpen}>
        <DialogContent className="bg-emerald-900 border-emerald-700 text-white max-w-4xl">
          <DialogHeader><DialogTitle className="flex justify-between"><span>Admin</span><Button onClick={() => { logout(); setAdminOpen(false); }}><LogOut /></Button></DialogTitle></DialogHeader>
          <div className="flex gap-2 flex-wrap mb-4">
            {['venezuela', 'peru', 'triples', 'terminales', 'mas1'].map(t => (
              <Button key={t} size="sm" onClick={() => setActiveAdminTab(t as any)} variant={activeAdminTab === t ? 'default' : 'outline'}>{t}</Button>
            ))}
          </div>
          <AdminPanelContent activeAdminTab={activeAdminTab} getDayState={getDayState} updateVenezuela={updateVenezuela} updatePeru={updatePeru} updateTriple={updateTriple} updateTerminal={updateTerminal} updateMas1={updateMas1} clearVenezuela={clearVenezuela} clearPeru={clearPeru} clearTriple={clearTriple} clearTerminal={clearTerminal} clearMas1={clearMas1} showToast={showToast} adminSelectedDate={adminSelectedDate} setAdminSelectedDate={setAdminSelectedDate} />
        </DialogContent>
      </Dialog>

      <nav className="sticky top-0 z-40 bg-emerald-900/95 border-b border-emerald-800 h-16 flex items-center justify-between px-4">
        <div className="flex items-center gap-2"><img src="/logo.jpg" className="w-10 h-10 rounded-full" /><div><div className="font-bold">Zoolo</div><div className="text-yellow-400 text-xs">CASINO</div></div></div>
        <div className="hidden md:flex gap-1">
          <button onClick={() => setActiveSection('inicio')} className="px-4 py-2 hover:bg-emerald-800 rounded-lg">Inicio</button>
          <button onClick={() => setActiveSection('resultados')} className="px-4 py-2 hover:bg-emerald-800 rounded-lg">Resultados</button>
          <button onClick={() => setActiveSection('animales')} className="px-4 py-2 hover:bg-emerald-800 rounded-lg">Animales</button>
          <button onClick={() => setActiveSection('horarios')} className="px-4 py-2 hover:bg-emerald-800 rounded-lg">Horarios</button>
          <button onClick={() => setActiveSection('preguntas')} className="px-4 py-2 hover:bg-emerald-800 rounded-lg">Preguntas</button>
          <button onClick={() => setActiveSection('contacto')} className="px-4 py-2 hover:bg-emerald-800 rounded-lg">Contacto</button>
        </div>
        <button onClick={() => isAuthenticated ? setAdminOpen(true) : setLoginOpen(true)} className="bg-yellow-500/20 text-yellow-400 px-3 py-2 rounded-lg"><Lock className="w-4 h-4" /></button>
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden"><Menu /></button>
      </nav>

      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-emerald-900 pt-20 p-4 flex flex-col gap-2">
          <button onClick={() => { setActiveSection('inicio'); setMenuOpen(false); }}>Inicio</button>
          <button onClick={() => { setActiveSection('resultados'); setMenuOpen(false); }}>Resultados</button>
          <button onClick={() => { setActiveSection('animales'); setMenuOpen(false); }}>Animales</button>
          <button onClick={() => { setActiveSection('horarios'); setMenuOpen(false); }}>Horarios</button>
          <button onClick={() => { setActiveSection('preguntas'); setMenuOpen(false); }}>Preguntas</button>
          <button onClick={() => { setActiveSection('contacto'); setMenuOpen(false); }}>Contacto</button>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeSection === 'inicio' && (
          <div className="space-y-8 text-center">
            <h1 className="text-4xl md:text-6xl font-black">La mejor lotería de <span className="text-yellow-400">animales</span></h1>
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4 bg-emerald-800/50">42 Animales</Card>
              <Card className="p-4 bg-emerald-800/50">12 Sorteos</Card>
              <Card className="p-4 bg-emerald-800/50">Confiable</Card>
            </div>
            <Card className="p-6 bg-emerald-800/50 max-w-md mx-auto">
              <h3 className="text-yellow-400 mb-4">Momento</h3>
              {aMD ? (<><img src={getAnimalImagePath(aMD, selectedGame === 'peru' ? 'peru' : 'venezuela')} className="w-32 h-32 rounded-xl mx-auto mb-2" /><div className="text-xl font-bold">{aMD.name}</div></>) : "Esperando"}
            </Card>
            <Button onClick={() => setShowRules(true)} className="bg-yellow-500 text-black font-bold px-8 py-4">¿Cómo jugar?</Button>
          </div>
        )}

        {activeSection === 'resultados' && (
          <div className="space-y-6">
            <div className="flex justify-center gap-2 flex-wrap">
              {['venezuela', 'peru', 'triples', 'terminales', 'mas1'].map(g => (
                <button key={g} onClick={() => setSelectedGame(g as any)} className={`px-4 py-2 rounded-lg ${selectedGame === g ? 'bg-yellow-500 text-black' : 'bg-emerald-800 text-white'}`}>{g}</button>
              ))}
            </div>
            <div className="flex items-center justify-center gap-4">
              <button onClick={() => setSelectedDate(new Date(selectedDate.getTime() - 86400000))} className="p-2 bg-emerald-800 rounded-lg"><ChevronLeft /></button>
              <button onClick={() => setDatePickerOpen(true)} className="bg-emerald-800 px-4 py-2 rounded-lg">{formatDate(selectedDate)}</button>
              <button onClick={() => setSelectedDate(new Date(selectedDate.getTime() + 86400000))} className="p-2 bg-emerald-800 rounded-lg"><ChevronRight /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(selectedGame === 'venezuela' || selectedGame === 'peru') && getSorteos().map(s => renderAnimalitoCard(s))}
              {selectedGame === 'triples' && tRes.map((s:any) => <div key={s.id} className="sorteo-card bg-emerald-800/50 p-4 text-center">{s.r1}-{s.r2}-{s.r3}</div>)}
              {selectedGame === 'terminales' && termRes.map((s:any) => <div key={s.id} className="sorteo-card bg-emerald-800/50 p-4 text-center">{s.r1}-{s.r2}</div>)}
              {selectedGame === 'mas1' && <div className="p-6 bg-emerald-800/50 text-center">{mRes.numero} + {mRes.animal_num}</div>}
            </div>
          </div>
        )}

        {activeSection === 'animales' && (
          <div className="space-y-6">
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" /><Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Buscar..." className="pl-10 bg-emerald-800 border-emerald-700 text-white" /></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {filteredAnimals.map(a => (
                <div key={a.num} className="bg-emerald-800/50 border border-emerald-700 rounded-xl p-3 flex flex-col items-center gap-2">
                  <img src={a.image} className="w-20 h-20 rounded-lg object-cover" />
                  <Badge className={a.color === 'rojo' ? 'bg-red-500' : a.color === 'verde' ? 'bg-green-500' : 'bg-gray-700'}>{a.num}</Badge>
                  <div className="font-medium text-sm">{a.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'horarios' && (
          <div className="space-y-6 text-center">
            <h2 className="text-2xl font-bold">Horarios</h2>
            <div className="grid grid-cols-2 gap-3">
              {(selectedGame === 'peru' ? PERU_TIMES : VENEZUELA_TIMES).map(t => (
                <div key={t} className="p-3 bg-emerald-800/50 rounded-lg">{formatTimeDisplay(t)}</div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'preguntas' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-center">FAQ</h2>
            <div className="bg-emerald-800/50 p-4 rounded-xl">¿Qué es ZooloCASINO? Resultados en tiempo real.</div>
            <div className="bg-emerald-800/50 p-4 rounded-xl">¿Cuánto paga? 35 veces.</div>
          </div>
        )}

        {activeSection === 'contacto' && (
          <div className="max-w-md mx-auto text-center space-y-4">
            <Card className="p-8 bg-emerald-800/50 border-emerald-700">
              <Mail className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
              <h3 className="font-bold">Email</h3>
              <a href="mailto:soportezoolo@gmail.com" className="text-yellow-400">soportezoolo@gmail.com</a>
            </Card>
          </div>
        )}
      </main>

      <footer className="bg-emerald-950 border-t border-emerald-800 py-8 text-center text-xs text-emerald-500">© 2026 Zoolo CASINO.</footer>
      
      <Dialog open={showRules} onOpenChange={setShowRules}>
        <DialogContent className="bg-emerald-900 border-emerald-700 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>¿Cómo jugar?</DialogTitle></DialogHeader>
          <div className="space-y-4 p-4">
            <p>Acierta un animal y gana 35 veces lo apostado.</p>
            <p>Triples pagan 700 veces.</p>
            <p>Más 1 paga 250 veces.</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default App;
