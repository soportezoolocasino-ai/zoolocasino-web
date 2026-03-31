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

// URL de tu nueva API en Render (Asegúrate de que el servicio se llame así)
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
          <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="p-2 hover:bg-emerald-800 rounded-lg transition-transform active:scale-95"><ChevronLeft className="w-5 h-5" /></button>
          <span className="font-bold text-sm">{MONTHS[month.getMonth()]} {month.getFullYear()}</span>
          <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="p-2 hover:bg-emerald-800 rounded-lg transition-transform active:scale-95"><ChevronRight className="w-5 h-5" /></button>
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
    
    // --- NUEVO: GUARDAR EN LA API ---
    try {
      await fetch(`${API_URL}/api/results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: dateStr,
          game_type: activeAdminTab,
          data: localResults
        })
      });
    } catch (err) {
      console.error("Error guardando en la nube:", err);
    }

    if (activeAdminTab === 'venezuela') {
      adminDayState.venezuela.forEach((s: any) => {
        if (localResults[s.id] !== undefined) updateVenezuela(adminSelectedDate, s.id, localResults[s.id]);
      });
    } else if (activeAdminTab === 'peru') {
      adminDayState.peru.forEach((s: any) => {
        if (localResults[s.id] !== undefined) updatePeru(adminSelectedDate, s.id, localResults[s.id]);
      });
    } else if (activeAdminTab === 'triples') {
      adminDayState.triples.forEach((s: any) => {
        updateTriple(adminSelectedDate, s.id, localResults[`${s.id}_r1`] || '', localResults[`${s.id}_r2`] || '', localResults[`${s.id}_r3`] || '');
      });
    } else if (activeAdminTab === 'terminales') {
      adminDayState.terminales.forEach((s: any) => {
        updateTerminal(adminSelectedDate, s.id, localResults[`${s.id}_r1`] || '', localResults[`${s.id}_r2`] || '');
      });
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
          <Save className="w-4 h-4 mr-2" />Guardar Todos los Cambios
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

  const {
    getDayState, venezuelaTime, peruTime, isAuthenticated, isPast, isNext, login, logout, checkAuth,
    updateVenezuela, updatePeru, updateTriple, updateTerminal, updateMas1,
    clearVenezuela, clearPeru, clearTriple, clearTerminal, clearMas1
  } = useZooloState();

  const dayState = getDayState(selectedDate);
  const { venezuela: venezuelaResults, peru: peruResults, triples: triplesResults, terminales: terminalesResults, mas1: mas1Result } = dayState;

  // --- NUEVO: CARGAR DATOS DE LA NUBE ---
  useEffect(() => {
    const syncData = async () => {
      const dateStr = selectedDate.toISOString().split('T');
      try {
        const response = await fetch(`${API_URL}/api/results/${dateStr}`);
        const cloudData = await response.json();
        cloudData.forEach((entry: any) => {
          if (entry.game_type === 'venezuela') {
            Object.keys(entry.data).forEach(id => updateVenezuela(selectedDate, id, entry.data[id]));
          } else if (entry.game_type === 'peru') {
            Object.keys(entry.data).forEach(id => updatePeru(selectedDate, id, entry.data[id]));
          }
        });
      } catch (err) { console.error("Error sincronizando:", err); }
    };
    syncData();
  }, [selectedDate, updateVenezuela, updatePeru]);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  useEffect(() => {
    const handleClick = () => { setSorteosDropdownOpen(false); setResultadosDropdownOpen(false); };
    if (sorteosDropdownOpen || resultadosDropdownOpen) document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [sorteosDropdownOpen, resultadosDropdownOpen]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type }); setTimeout(() => setToast(null), 3000);
  };

  const formatDate = (date: Date) => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return `${days[date.getDay()]}, ${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault(); setLoginError('');
    if (login(loginForm.username, loginForm.password)) {
      setLoginOpen(false); setAdminOpen(true); setLoginForm({ username: '', password: '' }); showToast('Bienvenido, administrador');
    } else { setLoginError('Usuario o contraseña incorrectos'); }
  };

  const getCurrentTime = () => selectedGame === 'peru' ? peruTime : venezuelaTime;
  const getSorteos = () => selectedGame === 'peru' ? peruResults : venezuelaResults;

  const getAnimalDelMomento = useCallback(() => {
    const sorteos = getSorteos();
    for (let i = sorteos.length - 1; i >= 0; i--) {
      if (sorteos[i].result) return { sorteo: sorteos[i], animal: getAnimal(sorteos[i].result) };
    }
    for (const s of sorteos) {
      if (!isPast(s.time, selectedGame === 'peru' ? 'peru' : 'venezuela')) return { sorteo: s, animal: null };
    }
    return { sorteo: sorteos, animal: null };
  }, [selectedGame, venezuelaResults, peruResults, isPast]);

  const filteredAnimals = ANIMALS.filter(animal => {
    if (animalFilter !== 'todos' && animal.color !== animalFilter.slice(0, -1)) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return animal.name.toLowerCase().includes(query) || animal.num.includes(query);
    }
    return true;
  });

  const getNextDrawCountdown = () => {
    const sorteos = getSorteos(); const currentTime = getCurrentTime();
    for (const s of sorteos) {
      const [h, m] = s.time.split(':').map(Number); const drawTime = new Date(currentTime);
      drawTime.setHours(h, m, 0, 0);
      if (drawTime > currentTime) {
        const diff = drawTime.getTime() - currentTime.getTime();
        return { hours: Math.floor(diff / 3600000), minutes: Math.floor((diff % 3600000) / 60000), seconds: Math.floor((diff % 60000) / 1000), time: s.time };
      }
    }
    return null;
  };

  const getBorderColorClass = (color: string) => {
    switch (color) { case 'rojo': return 'border-red-500'; case 'verde': return 'border-green-500'; case 'negro': return 'border-gray-800'; default: return 'border-emerald-500'; }
  };

  const getAnimalImagePath = (animal: Animal, country: 'venezuela' | 'peru') => {
    const nameToFile = (name: string) => name.toLowerCase().replace(/[áéíóúñü]/g, c => ({'á':'a','é':'e','í':'i','ó':'o','ú':'u','ñ':'n','ü':'u'}[c]||c));
    if (country === 'peru') return `/animals/peru/${animal.num}-${nameToFile(animal.name)}.jpg`;
    return `/animals/${animal.num}-${nameToFile(animal.name)}.jpg`;
  };

  const renderAnimalitoCard = (sorteo: { id: string; time: string; result: string }) => {
    const done = sorteo.result && sorteo.result.trim() !== '';
    const next = isNext(sorteo.time, selectedGame === 'peru' ? 'peru' : 'venezuela');
    const animal = done ? getAnimal(sorteo.result) : null;
    const borderClass = animal ? getBorderColorClass(animal.color) : 'border-emerald-500';
    const country = selectedGame === 'peru' ? 'peru' : 'venezuela';
    if (done && animal) {
      return (
        <div key={sorteo.id} className="sorteo-card finalizado">
          <div className="flex items-center justify-between mb-2">
            <div className="sorteo-time"><Clock className="w-4 h-4" />{formatTimeDisplay(sorteo.time)}</div>
            <span className="text-2xl">{country === 'peru' ? '🇵🇪' : '🇻🇪'}</span>
          </div>
          <img src={getAnimalImagePath(animal, country)} className={`sorteo-animal-img-large border-4 ${borderClass}`} onError={(e) => { (e.target as HTMLImageElement).src = '/animals/0-delfin.jpg'; }} />
          <div className="sorteo-animal-name">{animal.name}</div><div className="sorteo-animal-num">N° {sorteo.result}</div>
          <Badge className="sorteo-badge finalizado">Finalizado</Badge>
        </div>
      );
    }
    if (next) {
      return (
        <div key={sorteo.id} className="sorteo-card en-vivo">
          <div className="flex items-center justify-between mb-2">
            <div className="sorteo-time"><Clock className="w-4 h-4" />{formatTimeDisplay(sorteo.time)}</div>
            <span className="text-2xl">{country === 'peru' ? '🇵🇪' : '🇻🇪'}</span>
          </div>
          <div className="sorteo-placeholder"><div className="live-indicator"></div></div>
          <div className="sorteo-animal-name">En Vivo</div><div className="sorteo-animal-num">Sorteando...</div>
          <Badge className="sorteo-badge en-vivo">En Vivo</Badge>
        </div>
      );
    }
    return (
      <div key={sorteo.id} className="sorteo-card pendiente">
        <div className="flex items-center justify-between mb-2">
          <div className="sorteo-time"><Clock className="w-4 h-4" />{formatTimeDisplay(sorteo.time)}</div>
          <span className="text-2xl">{country === 'peru' ? '🇵🇪' : '🇻🇪'}</span>
        </div>
        <div className="sorteo-placeholder"><Clock className="w-8 h-8 text-emerald-400/50" /></div>
        <div className="sorteo-animal-name">Pendiente</div><Badge className="sorteo-badge pendiente">Pendiente</Badge>
      </div>
    );
  };

  const renderTripleCard = (sorteo: { id: string; time: string; r1: string; r2: string; r3: string }) => {
    const done = sorteo.r1 && sorteo.r2 && sorteo.r3;
    return (
      <div key={sorteo.id} className={`sorteo-card ${done ? 'finalizado' : 'pendiente'}`}>
        <div className="sorteo-time"><Dice3 className="w-4 h-4" />{formatTimeDisplay(sorteo.time)}</div>
        <div className="flex justify-center gap-2 my-3">
          {[sorteo.r1, sorteo.r2, sorteo.r3].map((val, i) => (<div key={i} className="w-12 h-12 rounded-lg border-2 flex items-center justify-center font-bold">{val || '?'}</div>))}
        </div>
        <div className="sorteo-animal-name">Triple</div><Badge className={`sorteo-badge ${done ? 'finalizado' : 'pendiente'}`}>{done ? 'Finalizado' : 'Pendiente'}</Badge>
      </div>
    );
  };

  const renderTerminalCard = (sorteo: { id: string; time: string; r1: string; r2: string }) => {
    const done = sorteo.r1 && sorteo.r2;
    return (
      <div key={sorteo.id} className={`sorteo-card ${done ? 'finalizado' : 'pendiente'}`}>
        <div className="sorteo-time"><Hash className="w-4 h-4" />{formatTimeDisplay(sorteo.time)}</div>
        <div className="flex justify-center gap-2 my-3">
          {[sorteo.r1, sorteo.r2].map((val, i) => (<div key={i} className="w-12 h-12 rounded-lg border-2 flex items-center justify-center font-bold">{val || '?'}</div>))}
        </div>
        <div className="sorteo-animal-name">Terminal</div><Badge className={`sorteo-badge ${done ? 'finalizado' : 'pendiente'}`}>{done ? 'Finalizado' : 'Pendiente'}</Badge>
      </div>
    );
  };

  const renderMas1 = () => {
    const done = mas1Result.numero && mas1Result.animal_num;
    const animal = done ? getAnimal(mas1Result.animal_num) : null;
    return (
      <Card className="bg-emerald-800/50 border-emerald-700 p-6 text-center max-w-md mx-auto">
        <h3 className="text-yellow-400 text-xl mb-4 flex items-center justify-center gap-2"><Plus className="w-5 h-5" />Más 1 ZooloCASINO</h3>
        {done && animal ? (
          <>
            <div className="flex items-center justify-center gap-4 mb-4"><div className="w-16 h-16 rounded-xl bg-yellow-500 flex items-center justify-center text-3xl font-bold text-black">{mas1Result.numero}</div><span className="text-2xl text-yellow-400">+</span><img src={animal.image} className="w-16 h-16 rounded-xl object-cover" /></div>
            <Badge className="text-lg px-4 py-1">{mas1Result.animal_num} - {animal.name}</Badge>
          </>
        ) : ( <div className="py-8"><div className="text-5xl mb-4">📅</div><div className="text-emerald-300">Esperando resultado</div></div> )}
      </Card>
    );
  };

  const { sorteo: animalDelMomento, animal: animalMomentoData } = getAnimalDelMomento();
  const countdown = getNextDrawCountdown();

  return (
    <div className="min-h-screen bg-emerald-900 text-white">
      {datePickerOpen && ( <InlineCalendar selectedDate={selectedDate} onSelectDate={setSelectedDate} onClose={() => setDatePickerOpen(false)} /> )}
      {toast && ( <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg z-50 ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>{toast.message}</div> )}

      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent className="bg-emerald-900 border-emerald-700 text-white">
          <DialogHeader><DialogTitle className="flex items-center gap-2 justify-center">Acceso Administrador</DialogTitle></DialogHeader>
          <form onSubmit={handleLogin} className="space-y-4 mt-4">
            <Input type="text" value={loginForm.username} onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })} placeholder="Usuario" className="bg-emerald-800 border-emerald-600 text-white" />
            <Input type="password" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} placeholder="Contraseña" className="bg-emerald-800 border-emerald-600 text-white" />
            {loginError && <div className="text-red-400 text-sm">{loginError}</div>}
            <Button type="submit" className="w-full bg-yellow-500 text-black font-bold">Iniciar Sesión</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={adminOpen} onOpenChange={setAdminOpen}>
        <DialogContent className="bg-emerald-900 border-emerald-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Panel de Administración</span>
              <Button onClick={() => { logout(); setAdminOpen(false); showToast('Sesión cerrada'); }} className="border-emerald-600 text-emerald-300">Cerrar Sesión</Button>
            </DialogTitle>
          </DialogHeader>
          <div className="flex gap-2 mb-4 flex-wrap">
            {['venezuela', 'peru', 'triples', 'terminales', 'mas1'].map((tab) => (
              <Button key={tab} size="sm" onClick={() => setActiveAdminTab(tab as any)} variant={activeAdminTab === tab ? 'default' : 'outline'}>{tab}</Button>
            ))}
          </div>
          <AdminPanelContent activeAdminTab={activeAdminTab} getDayState={getDayState} updateVenezuela={updateVenezuela} updatePeru={updatePeru} updateTriple={updateTriple} updateTerminal={updateTerminal} updateMas1={updateMas1} clearVenezuela={clearVenezuela} clearPeru={clearPeru} clearTriple={clearTriple} clearTerminal={clearTerminal} clearMas1={clearMas1} showToast={showToast} adminSelectedDate={adminSelectedDate} setAdminSelectedDate={setAdminSelectedDate} />
        </DialogContent>
      </Dialog>

      <nav className="sticky top-0 z-40 bg-emerald-900/95 backdrop-blur-sm border-b border-emerald-800 h-16 flex items-center justify-between px-4">
        <div className="flex items-center gap-2"><img src="/logo.jpg" className="w-10 h-10 rounded-full" /><div><div className="font-bold text-lg">Zoolo</div><div className="text-yellow-400 text-xs">CASINO</div></div></div>
        <div className="hidden md:flex gap-1">
          <button onClick={() => setActiveSection('inicio')} className="px-4 py-2 hover:bg-emerald-800 rounded-lg">Inicio</button>
          <button onClick={() => setActiveSection('resultados')} className="px-4 py-2 hover:bg-emerald-800 rounded-lg">Resultados</button>
          <button onClick={() => setActiveSection('animales')} className="px-4 py-2 hover:bg-emerald-800 rounded-lg">Animales</button>
        </div>
        <button onClick={() => isAuthenticated ? setAdminOpen(true) : setLoginOpen(true)} className="bg-yellow-500/20 text-yellow-400 px-3 py-2 rounded-lg">Admin</button>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeSection === 'inicio' && (
          <div className="space-y-8">
            <h1 className="text-4xl md:text-6xl font-black text-center">La mejor lotería de <span className="text-yellow-400">animales</span></h1>
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-emerald-800/50 p-4 text-center">42 Animales</Card><Card className="bg-emerald-800/50 p-4 text-center">12 Sorteos/Día</Card><Card className="bg-emerald-800/50 p-4 text-center">100% Confiable</Card>
            </div>
            <Card className="bg-emerald-800/50 border-emerald-700 p-6 text-center max-w-md mx-auto">
              <h3 className="text-yellow-400 mb-4">Animal del Momento</h3>
              {animalMomentoData ? (
                <>
                  <img src={getAnimalImagePath(animalMomentoData, selectedGame === 'peru' ? 'peru' : 'venezuela')} className="w-32 h-32 rounded-xl mx-auto mb-4 object-cover" />
                  <Badge className="text-lg mb-2">{animalDelMomento.result}</Badge>
                  <div className="text-xl font-bold">{animalMomentoData.name}</div>
                </>
              ) : ( <div className="text-xl font-bold">Esperando sorteo</div> )}
            </Card>
          </div>
        )}

        {activeSection === 'resultados' && (
          <div className="space-y-6">
            <div className="flex flex-wrap justify-center gap-2">
              {['venezuela', 'peru', 'triples', 'terminales', 'mas1'].map(g => (
                <button key={g} onClick={() => setSelectedGame(g as any)} className={`px-4 py-2 rounded-lg ${selectedGame === g ? 'bg-yellow-500 text-black' : 'bg-emerald-800 text-white'}`}>{g}</button>
              ))}
            </div>
            <div className="flex items-center justify-center gap-4 mb-6">
              <button onClick={() => setSelectedDate(new Date(selectedDate.getTime() - 86400000))} className="p-2 bg-emerald-800 rounded-lg"><ChevronLeft /></button>
              <button onClick={() => setDatePickerOpen(true)} className="bg-emerald-800 px-4 py-2 rounded-lg">{formatDate(selectedDate)}</button>
              <button onClick={() => setSelectedDate(new Date(selectedDate.getTime() + 86400000))} className="p-2 bg-emerald-800 rounded-lg"><ChevronRight /></button>
            </div>
            <div className="min-h-[600px]">
              {(selectedGame === 'venezuela' || selectedGame === 'peru') && <div className="grid grid-cols-2 gap-3">{getSorteos().map((s:any) => renderAnimalitoCard(s))}</div>}
              {selectedGame === 'triples' && <div className="grid grid-cols-1 md:grid-cols-3 gap-3">{triplesResults.map((s:any) => renderTripleCard(s))}</div>}
              {selectedGame === 'terminales' && <div className="grid grid-cols-1 md:grid-cols-3 gap-3">{terminalesResults.map((s:any) => renderTerminalCard(s))}</div>}
              {selectedGame === 'mas1' && renderMas1()}
            </div>
          </div>
        )}

        {activeSection === 'animales' && (
          <div className="space-y-6">
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" /><Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar..." className="pl-10 bg-emerald-800 border-emerald-700 text-white" /></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {filteredAnimals.map(animal => (
                <div key={animal.num} className="bg-emerald-800/50 border border-emerald-700 rounded-xl p-3 flex flex-col items-center gap-2">
                  <img src={animal.image} className="w-20 h-20 rounded-lg object-cover" />
                  <Badge>{animal.num}</Badge><div className="font-medium text-sm">{animal.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="bg-emerald-950 border-t border-emerald-800 py-8 text-center text-xs text-emerald-500">© 2026 Zoolo CASINO.</footer>
    </div>
  );
}

export default App;
