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

// ─────────────────────────────────────────────
// COMPONENTE CALENDARIO INLINE (sin Dialog)
// Funciona perfecto en móvil y desktop
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
    // overlay para cerrar al hacer click fuera
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="bg-emerald-900 border border-emerald-700 rounded-2xl shadow-2xl p-4 w-full max-w-xs"
        onClick={(e) => e.stopPropagation()} // evita que cierre al tocar el calendario
      >
        {/* Header mes */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
            className="p-2 hover:bg-emerald-800 rounded-lg active:scale-95 transition-transform"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-bold text-sm">
            {MONTHS[month.getMonth()]} {month.getFullYear()}
          </span>
          <button
            onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
            className="p-2 hover:bg-emerald-800 rounded-lg active:scale-95 transition-transform"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Días de la semana */}
        <div className="grid grid-cols-7 gap-1 text-center mb-1">
          {DAYS_HEADER.map((d) => (
            <div key={d} className="text-emerald-400 text-xs py-1 font-medium">{d}</div>
          ))}
        </div>

        {/* Días del mes */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {generateDays().map((day, i) => (
            <button
              key={i}
              disabled={!day}
              onClick={() => {
                if (day) {
                  onSelectDate(new Date(month.getFullYear(), month.getMonth(), day));
                  onClose();
                }
              }}
              className={`
                aspect-square rounded-lg text-sm font-medium transition-all active:scale-95
                ${!day ? 'invisible' : ''}
                ${isSelected(day)
                  ? 'bg-yellow-500 text-black font-bold shadow-lg'
                  : day ? 'hover:bg-emerald-800 text-white' : ''}
              `}
            >
              {day || ''}
            </button>
          ))}
        </div>

        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="mt-3 w-full py-2 text-sm text-emerald-400 hover:text-white hover:bg-emerald-800 rounded-lg transition-colors"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ADMIN PANEL — calendario también como inline
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
        results[`${s.id}_r1`] = s.r1;
        results[`${s.id}_r2`] = s.r2;
        results[`${s.id}_r3`] = s.r3;
      });
    } else if (activeAdminTab === 'terminales') {
      adminDayState.terminales.forEach((s: any) => {
        results[`${s.id}_r1`] = s.r1;
        results[`${s.id}_r2`] = s.r2;
      });
    } else if (activeAdminTab === 'mas1') {
      results['mas1_numero'] = adminDayState.mas1.numero;
      results['mas1_animal'] = adminDayState.mas1.animal_num;
    }
    setLocalResults(results);
  }, [activeAdminTab, adminDayState]);

  const handleSave = () => {
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
      {/* ✅ FIX: Calendario admin como overlay (fuera del scroll container) */}
      {showAdminCalendar && (
        <InlineCalendar
          selectedDate={adminSelectedDate}
          onSelectDate={setAdminSelectedDate}
          onClose={() => setShowAdminCalendar(false)}
        />
      )}

      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
        {/* Date Picker */}
        <div className="bg-emerald-800/50 p-3 rounded-lg mb-4">
          <label className="text-sm text-emerald-300 mb-2 block">Fecha de los resultados:</label>
          <button
            onClick={() => setShowAdminCalendar(true)}
            className="flex items-center gap-2 bg-emerald-700 px-3 py-2 rounded-lg hover:bg-emerald-600 w-full active:scale-95 transition-transform"
          >
            <Calendar className="w-4 h-4 text-yellow-400 flex-shrink-0" />
            <span className="text-sm text-left">{formatAdminDate(adminSelectedDate)}</span>
          </button>
        </div>

        {(activeAdminTab === 'venezuela' || activeAdminTab === 'peru') && (
          <>
            <h3 className="font-bold text-yellow-400 mb-2">
              {activeAdminTab === 'venezuela' ? '🇻🇪 ZooloCASINO Venezuela - 12 Sorteos' : '🇵🇪 ZooloCASINO Perú - 11 Sorteos'}
            </h3>
            {(activeAdminTab === 'venezuela' ? adminDayState.venezuela : adminDayState.peru).map((s: any) => (
              <div key={s.id} className="flex items-center justify-between p-3 bg-emerald-800 rounded-lg">
                <div>
                  <div className="font-semibold">{A_NAMES[s.time]}</div>
                  <div className="text-sm text-emerald-400">{formatTimeDisplay(s.time)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={localResults[s.id] || ''}
                    onChange={(e) => setLocalResults({ ...localResults, [s.id]: e.target.value })}
                    placeholder="0-40"
                    className="w-24 text-center bg-emerald-700 border-emerald-600 text-white"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      setLocalResults({ ...localResults, [s.id]: '' });
                      activeAdminTab === 'venezuela' ? clearVenezuela(adminSelectedDate, s.id) : clearPeru(adminSelectedDate, s.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </>
        )}

        {activeAdminTab === 'triples' && (
          <>
            <h3 className="font-bold text-yellow-400 mb-2">🎲 Triple ZooloCASINO - 3 Sorteos</h3>
            {adminDayState.triples.map((s: any) => (
              <div key={s.id} className="flex items-center justify-between p-3 bg-emerald-800 rounded-lg">
                <div><div className="font-semibold">{TT_NAMES[s.time]}</div></div>
                <div className="flex items-center gap-2">
                  <Input type="text" value={localResults[`${s.id}_r1`] || ''} onChange={(e) => setLocalResults({ ...localResults, [`${s.id}_r1`]: e.target.value })} placeholder="1ra" className="w-16 text-center bg-emerald-700 border-emerald-600 text-white" />
                  <Input type="text" value={localResults[`${s.id}_r2`] || ''} onChange={(e) => setLocalResults({ ...localResults, [`${s.id}_r2`]: e.target.value })} placeholder="2da" className="w-16 text-center bg-emerald-700 border-emerald-600 text-white" />
                  <Input type="text" value={localResults[`${s.id}_r3`] || ''} onChange={(e) => setLocalResults({ ...localResults, [`${s.id}_r3`]: e.target.value })} placeholder="3ra" className="w-16 text-center bg-emerald-700 border-emerald-600 text-white" />
                  <Button size="sm" variant="destructive" onClick={() => clearTriple(adminSelectedDate, s.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            ))}
          </>
        )}

        {activeAdminTab === 'terminales' && (
          <>
            <h3 className="font-bold text-yellow-400 mb-2">🔢 Terminal ZooloCASINO - 3 Sorteos</h3>
            {adminDayState.terminales.map((s: any) => (
              <div key={s.id} className="flex items-center justify-between p-3 bg-emerald-800 rounded-lg">
                <div><div className="font-semibold">{TT_NAMES[s.time]}</div></div>
                <div className="flex items-center gap-2">
                  <Input type="text" value={localResults[`${s.id}_r1`] || ''} onChange={(e) => setLocalResults({ ...localResults, [`${s.id}_r1`]: e.target.value })} placeholder="T1" className="w-16 text-center bg-emerald-700 border-emerald-600 text-white" />
                  <Input type="text" value={localResults[`${s.id}_r2`] || ''} onChange={(e) => setLocalResults({ ...localResults, [`${s.id}_r2`]: e.target.value })} placeholder="T2" className="w-16 text-center bg-emerald-700 border-emerald-600 text-white" />
                  <Button size="sm" variant="destructive" onClick={() => clearTerminal(adminSelectedDate, s.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            ))}
          </>
        )}

        {activeAdminTab === 'mas1' && (
          <div className="p-4 bg-emerald-800 rounded-lg">
            <h3 className="font-bold text-yellow-400 mb-4">⭐ MÁS 1 - VIERNES 6:00 PM</h3>
            <p className="text-emerald-300 text-sm mb-4">Ingresa un número del 0 al 9 más un animal</p>
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
  // ✅ FIX: datePickerOpen ahora abre el InlineCalendar en vez del Dialog
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [sorteosDropdownOpen, setSorteosDropdownOpen] = useState(false);
  const [resultadosDropdownOpen, setResultadosDropdownOpen] = useState(false);
  const [adminSelectedDate, setAdminSelectedDate] = useState(new Date());

  const {
    getDayState,
    venezuelaTime,
    peruTime,
    isAuthenticated,
    isPast,
    isNext,
    login,
    logout,
    checkAuth,
    updateVenezuela,
    updatePeru,
    updateTriple,
    updateTerminal,
    updateMas1,
    clearVenezuela,
    clearPeru,
    clearTriple,
    clearTerminal,
    clearMas1
  } = useZooloState();

  const dayState = getDayState(selectedDate);
  const { venezuela: venezuelaResults, peru: peruResults, triples: triplesResults, terminales: terminalesResults, mas1: mas1Result } = dayState;

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Cierra dropdowns al tocar fuera en móvil
  useEffect(() => {
    const handleClick = () => {
      setSorteosDropdownOpen(false);
      setResultadosDropdownOpen(false);
    };
    if (sorteosDropdownOpen || resultadosDropdownOpen) {
      document.addEventListener('click', handleClick);
    }
    return () => document.removeEventListener('click', handleClick);
  }, [sorteosDropdownOpen, resultadosDropdownOpen]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const formatDate = (date: Date) => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return `${days[date.getDay()]}, ${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (login(loginForm.username, loginForm.password)) {
      setLoginOpen(false);
      setAdminOpen(true);
      setLoginForm({ username: '', password: '' });
      showToast('Bienvenido, administrador');
    } else {
      setLoginError('Usuario o contraseña incorrectos');
    }
  };

  const getCurrentTime = () => {
    if (selectedGame === 'venezuela') return venezuelaTime;
    if (selectedGame === 'peru') return peruTime;
    return venezuelaTime;
  };

  const getSorteos = () => {
    if (selectedGame === 'venezuela') return venezuelaResults;
    if (selectedGame === 'peru') return peruResults;
    return venezuelaResults;
  };

  const getAnimalDelMomento = useCallback(() => {
    const sorteos = getSorteos();
    for (let i = sorteos.length - 1; i >= 0; i--) {
      if (sorteos[i].result) return { sorteo: sorteos[i], animal: getAnimal(sorteos[i].result) };
    }
    for (const s of sorteos) {
      if (!isPast(s.time, selectedGame === 'peru' ? 'peru' : 'venezuela')) return { sorteo: s, animal: null };
    }
    return { sorteo: sorteos[0], animal: null };
  }, [selectedGame, venezuelaResults, peruResults, isPast]);

  // ✅ FIX: filteredAnimals con min-height en el contenedor para evitar colapso en móvil
  const filteredAnimals = ANIMALS.filter(animal => {
    if (animalFilter !== 'todos' && animal.color !== animalFilter.slice(0, -1)) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return animal.name.toLowerCase().includes(query) || animal.num.includes(query);
    }
    return true;
  });

  const getNextDrawCountdown = () => {
    const sorteos = getSorteos();
    const currentTime = getCurrentTime();
    for (const s of sorteos) {
      const [h, m] = s.time.split(':').map(Number);
      const drawTime = new Date(currentTime);
      drawTime.setHours(h, m, 0, 0);
      if (drawTime > currentTime) {
        const diff = drawTime.getTime() - currentTime.getTime();
        return {
          hours: Math.floor(diff / 3600000),
          minutes: Math.floor((diff % 3600000) / 60000),
          seconds: Math.floor((diff % 60000) / 1000),
          time: s.time
        };
      }
    }
    return null;
  };

  const getBorderColorClass = (color: string) => {
    switch (color) {
      case 'rojo': return 'border-red-500';
      case 'verde': return 'border-green-500';
      case 'negro': return 'border-gray-800';
      default: return 'border-emerald-500';
    }
  };

  const getAnimalImagePath = (animal: Animal, country: 'venezuela' | 'peru') => {
    const nameToFile = (name: string) =>
      name.toLowerCase()
        .replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i')
        .replace(/ó/g, 'o').replace(/ú/g, 'u').replace(/ñ/g, 'n').replace(/ü/g, 'u');
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
          <img src={getAnimalImagePath(animal, country)} alt={animal.name} className={`sorteo-animal-img-large border-4 ${borderClass}`} onError={(e) => { (e.target as HTMLImageElement).src = '/animals/0-delfin.jpg'; }} />
          <div className="sorteo-animal-name">{animal.name}</div>
          <div className="sorteo-animal-num">N° {sorteo.result}</div>
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
          <div className="sorteo-animal-name">En Vivo</div>
          <div className="sorteo-animal-num">Sorteando...</div>
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
        <div className="sorteo-animal-name">Pendiente</div>
        <div className="sorteo-animal-num text-xs">El resultado aún no está disponible. Regresa más tarde.</div>
        <Badge className="sorteo-badge pendiente">Pendiente</Badge>
      </div>
    );
  };

  const renderTripleCard = (sorteo: { id: string; time: string; r1: string; r2: string; r3: string }) => {
    const done = sorteo.r1 && sorteo.r2 && sorteo.r3;
    return (
      <div key={sorteo.id} className={`sorteo-card ${done ? 'finalizado' : 'pendiente'}`}>
        <div className="sorteo-time"><Dice3 className="w-4 h-4" />{formatTimeDisplay(sorteo.time)}</div>
        <div className="flex justify-center gap-2 my-3">
          {[sorteo.r1, sorteo.r2, sorteo.r3].map((val, i) => (
            <div key={i} className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center text-lg font-bold ${val ? 'border-emerald-500 bg-emerald-900 text-white' : 'border-dashed border-emerald-600 text-emerald-600'}`}>
              {val || '?'}
            </div>
          ))}
        </div>
        <div className="sorteo-animal-name">Triple</div>
        <Badge className={`sorteo-badge ${done ? 'finalizado' : 'pendiente'}`}>{done ? 'Finalizado' : 'Pendiente'}</Badge>
      </div>
    );
  };

  const renderTerminalCard = (sorteo: { id: string; time: string; r1: string; r2: string }) => {
    const done = sorteo.r1 && sorteo.r2;
    return (
      <div key={sorteo.id} className={`sorteo-card ${done ? 'finalizado' : 'pendiente'}`}>
        <div className="sorteo-time"><Hash className="w-4 h-4" />{formatTimeDisplay(sorteo.time)}</div>
        <div className="flex justify-center gap-2 my-3">
          {[sorteo.r1, sorteo.r2].map((val, i) => (
            <div key={i} className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center text-lg font-bold ${val ? 'border-blue-500 bg-blue-900 text-white' : 'border-dashed border-blue-600 text-blue-600'}`}>
              {val || '?'}
            </div>
          ))}
        </div>
        <div className="sorteo-animal-name">Terminal</div>
        <Badge className={`sorteo-badge ${done ? 'finalizado' : 'pendiente'}`}>{done ? 'Finalizado' : 'Pendiente'}</Badge>
      </div>
    );
  };

  const renderMas1 = () => {
    const done = mas1Result.numero && mas1Result.animal_num;
    const animal = done ? getAnimal(mas1Result.animal_num) : null;
    return (
      <Card className="bg-emerald-800/50 border-emerald-700 p-6 text-center max-w-md mx-auto">
        <h3 className="text-yellow-400 text-xl mb-4 flex items-center justify-center gap-2"><Plus className="w-5 h-5" />Más 1 ZooloCASINO</h3>
        <p className="text-emerald-300 text-sm mb-4">Sorteo especial - Solo Viernes 6:00 PM</p>
        {done && animal ? (
          <>
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-xl bg-yellow-500 flex items-center justify-center text-3xl font-bold text-black">{mas1Result.numero}</div>
              <span className="text-2xl text-yellow-400">+</span>
              <img src={animal.image} alt={animal.name} className="w-16 h-16 rounded-xl object-cover" />
            </div>
            <Badge className={`text-lg px-4 py-1 ${animal.color === 'rojo' ? 'bg-red-500' : animal.color === 'verde' ? 'bg-green-500' : 'bg-gray-700'}`}>
              {mas1Result.animal_num} - {animal.name}
            </Badge>
          </>
        ) : (
          <div className="py-8">
            <div className="text-5xl mb-4">📅</div>
            <div className="text-emerald-300">Esperando resultado del viernes</div>
          </div>
        )}
      </Card>
    );
  };

  const { sorteo: animalDelMomento, animal: animalMomentoData } = getAnimalDelMomento();
  const countdown = getNextDrawCountdown();

  const faqs = [
    { q: '¿Qué es ZooloCASINO?', a: 'ZooloCASINO es una plataforma de resultados de lotería de animales donde puedes consultar los resultados de sorteos de animalitos en tiempo real.' },
    { q: '¿Cuántos animales tiene ZooloCASINO?', a: 'ZooloCASINO cuenta con 42 animales, cada uno con un número y color asignado (rojo, negro o verde).' },
    { q: '¿Cuánto paga acertar un animalito?', a: 'Si aciertas el animalito ganador, pagamos 35 veces lo apostado. El número 40 (Lechuza) paga el doble: 70 veces lo apostado.' },
    { q: '¿Qué es el Triple?', a: 'El Triple es un juego donde debes acertar 3 números. Si aciertas los 3, ganas 700 veces lo apostado.' },
    { q: '¿Qué es el aproximado en el Triple?', a: 'Si juegas el 500 y sale el 499 o 501, se paga 20 veces lo apostado.' },
    { q: '¿Qué es el Terminal?', a: 'El Terminal es un juego de 2 números donde ganas 65 veces lo apostado si aciertas ambos.' },
    { q: '¿Qué es el Más 1?', a: 'El Más 1 consiste en seleccionar un número del 0 al 9 más un animalito. Si aciertas ambos, ganas 250 veces lo apostado.' },
    { q: '¿Qué pasa si solo acierto el animal en el Más 1?', a: 'Si solo aciertas el animal en el Más 1, ganarás 35 veces (igual que ZooloCASINO). El 40 no tiene valor doble aquí.' },
    { q: '¿A qué hora son los sorteos?', a: 'Los sorteos de animalitos son cada hora desde las 8:00 AM hasta las 7:00 PM en Venezuela y hasta las 6:00 PM en Perú.' },
    { q: '¿Cómo puedo contactar a soporte?', a: 'Puedes contactarnos a través del correo electrónico: soportezoolo@gmail.com' }
  ];

  return (
    <div className="min-h-screen bg-emerald-900 text-white">

      {/* ✅ InlineCalendar para el selector de fecha de resultados */}
      {datePickerOpen && (
        <InlineCalendar
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          onClose={() => setDatePickerOpen(false)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
          {toast.message}
        </div>
      )}

      {/* Login Dialog */}
      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent className="bg-emerald-900 border-emerald-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 justify-center text-xl">
              <Lock className="w-6 h-6 text-yellow-400" />
              Acceso Administrador
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleLogin} className="space-y-4 mt-4">
            <div>
              <label className="text-sm text-emerald-300 mb-1 block">Usuario</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                <Input type="text" value={loginForm.username} onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })} placeholder="Usuario" className="pl-10 bg-emerald-800 border-emerald-600 text-white placeholder:text-emerald-500" />
              </div>
            </div>
            <div>
              <label className="text-sm text-emerald-300 mb-1 block">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                <Input type="password" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} placeholder="Contraseña" className="pl-10 bg-emerald-800 border-emerald-600 text-white placeholder:text-emerald-500" />
              </div>
            </div>
            {loginError && <div className="text-red-400 text-sm text-center">{loginError}</div>}
            <Button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold">
              <Lock className="w-4 h-4 mr-2" />Iniciar Sesión
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Admin Panel */}
      <Dialog open={adminOpen} onOpenChange={setAdminOpen}>
        <DialogContent className="bg-emerald-900 border-emerald-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2"><Lock className="w-5 h-5 text-yellow-400" />Panel de Administración</span>
              <Button variant="outline" size="sm" onClick={() => { logout(); setAdminOpen(false); showToast('Sesión cerrada'); }} className="border-emerald-600 text-emerald-300 hover:bg-emerald-800">
                <LogOut className="w-4 h-4 mr-2" />Cerrar Sesión
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="flex gap-2 mb-4 flex-wrap">
            {[
              { key: 'venezuela', label: '🇻🇪 Venezuela' },
              { key: 'peru', label: '🇵🇪 Perú' },
              { key: 'triples', label: '🎲 Triple' },
              { key: 'terminales', label: '🔢 Terminal' },
              { key: 'mas1', label: '⭐ Más 1' }
            ].map((tab) => (
              <Button key={tab.key} size="sm" variant={activeAdminTab === tab.key ? 'default' : 'outline'} onClick={() => setActiveAdminTab(tab.key as any)} className={activeAdminTab === tab.key ? 'bg-yellow-500 text-black hover:bg-yellow-600' : 'border-emerald-600 text-emerald-300 hover:bg-emerald-800'}>
                {tab.label}
              </Button>
            ))}
          </div>

          <AdminPanelContent
            activeAdminTab={activeAdminTab}
            getDayState={getDayState}
            updateVenezuela={updateVenezuela}
            updatePeru={updatePeru}
            updateTriple={updateTriple}
            updateTerminal={updateTerminal}
            updateMas1={updateMas1}
            clearVenezuela={clearVenezuela}
            clearPeru={clearPeru}
            clearTriple={clearTriple}
            clearTerminal={clearTerminal}
            clearMas1={clearMas1}
            showToast={showToast}
            adminSelectedDate={adminSelectedDate}
            setAdminSelectedDate={setAdminSelectedDate}
          />
        </DialogContent>
      </Dialog>

      {/* Rules Dialog */}
      <Dialog open={showRules} onOpenChange={setShowRules}>
        <DialogContent className="bg-emerald-900 border-emerald-700 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Info className="w-6 h-6 text-yellow-400" />
              ¿Cómo jugar ZooloCASINO?
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="bg-emerald-800/50 p-4 rounded-lg">
              <h3 className="font-bold text-yellow-400 mb-2">🦁 Animalitos (42 animales)</h3>
              <p className="text-sm text-emerald-300">Selecciona un animalito de los 42 disponibles. Si aciertas el ganador, <span className="text-yellow-400 font-bold">pagamos 35 veces</span> lo apostado.</p>
              <p className="text-sm text-emerald-300 mt-2">🦉 <span className="text-yellow-400 font-bold">El 40 (Lechuza) paga el doble:</span> 70 veces lo apostado.</p>
            </div>
            <div className="bg-emerald-800/50 p-4 rounded-lg">
              <h3 className="font-bold text-yellow-400 mb-2">🎲 Triple</h3>
              <p className="text-sm text-emerald-300">Acierta 3 números y gana <span className="text-yellow-400 font-bold">700 veces</span> lo apostado.</p>
              <p className="text-sm text-emerald-300 mt-2">📍 <span className="text-yellow-400 font-bold">Aproximado:</span> Si juegas el 500 y sale el 499 o 501, se paga <span className="text-yellow-400 font-bold">20 veces</span> lo apostado.</p>
            </div>
            <div className="bg-emerald-800/50 p-4 rounded-lg">
              <h3 className="font-bold text-yellow-400 mb-2">🔢 Terminal</h3>
              <p className="text-sm text-emerald-300">Acierta 2 números y gana <span className="text-yellow-400 font-bold">65 veces</span> lo apostado.</p>
            </div>
            <div className="bg-emerald-800/50 p-4 rounded-lg">
              <h3 className="font-bold text-yellow-400 mb-2">⭐ Más 1</h3>
              <p className="text-sm text-emerald-300">Selecciona un número del 0 al 9 más un animalito. Si aciertas ambos, gana <span className="text-yellow-400 font-bold">250 veces</span> lo apostado.</p>
              <p className="text-sm text-emerald-300 mt-2">💰 Apuesta mínima: <span className="text-yellow-400 font-bold">$5</span></p>
              <p className="text-sm text-emerald-300 mt-2">🦁 Si solo aciertas el animal: ganas <span className="text-yellow-400 font-bold">35 veces</span> (igual que ZooloCASINO). Nota: el 40 no tiene valor doble aquí.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-emerald-900/95 backdrop-blur-sm border-b border-emerald-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <img src="/logo.jpg" alt="ZooloCASINO" className="w-10 h-10 rounded-full" />
              <div>
                <div className="font-bold text-lg leading-tight">Zoolo</div>
                <div className="text-yellow-400 text-xs font-bold">CASINO</div>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-1">
              <button onClick={() => setActiveSection('inicio')} className={`px-4 py-2 rounded-lg transition-colors ${activeSection === 'inicio' ? 'bg-yellow-500 text-black' : 'hover:bg-emerald-800'}`}>Inicio</button>

              <div className="relative">
                <button onClick={(e) => { e.stopPropagation(); setSorteosDropdownOpen(!sorteosDropdownOpen); setResultadosDropdownOpen(false); }} className="px-4 py-2 rounded-lg hover:bg-emerald-800 flex items-center gap-1">
                  Sorteos <ChevronDown className="w-4 h-4" />
                </button>
                {sorteosDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-emerald-800 rounded-lg shadow-xl border border-emerald-700 min-w-[220px] z-50">
                    <button onClick={() => { setSelectedGame('venezuela'); setActiveSection('resultados'); setSorteosDropdownOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-emerald-700 flex items-center gap-2 border-b border-emerald-700"><span>🇻🇪</span> ZooloCASINO Venezuela</button>
                    <button onClick={() => { setSelectedGame('peru'); setActiveSection('resultados'); setSorteosDropdownOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-emerald-700 flex items-center gap-2 border-b border-emerald-700"><span>🇵🇪</span> ZooloCASINO Perú</button>
                    <button onClick={() => { setSelectedGame('triples'); setActiveSection('resultados'); setSorteosDropdownOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-emerald-700 flex items-center gap-2 border-b border-emerald-700"><Dice3 className="w-4 h-4" /> Triple</button>
                    <button onClick={() => { setSelectedGame('terminales'); setActiveSection('resultados'); setSorteosDropdownOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-emerald-700 flex items-center gap-2 border-b border-emerald-700"><Hash className="w-4 h-4" /> Terminal</button>
                    <button onClick={() => { setSelectedGame('mas1'); setActiveSection('resultados'); setSorteosDropdownOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-emerald-700 flex items-center gap-2"><Plus className="w-4 h-4" /> Más 1</button>
                  </div>
                )}
              </div>

              <div className="relative">
                <button onClick={(e) => { e.stopPropagation(); setResultadosDropdownOpen(!resultadosDropdownOpen); setSorteosDropdownOpen(false); }} className="px-4 py-2 rounded-lg hover:bg-emerald-800 flex items-center gap-1">
                  Resultados <ChevronDown className="w-4 h-4" />
                </button>
                {resultadosDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-emerald-800 rounded-lg shadow-xl border border-emerald-700 min-w-[220px] z-50">
                    <button onClick={() => { setSelectedGame('venezuela'); setActiveSection('resultados'); setResultadosDropdownOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-emerald-700 flex items-center gap-2 border-b border-emerald-700"><span>🇻🇪</span> Venezuela</button>
                    <button onClick={() => { setSelectedGame('peru'); setActiveSection('resultados'); setResultadosDropdownOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-emerald-700 flex items-center gap-2 border-b border-emerald-700"><span>🇵🇪</span> Perú</button>
                    <button onClick={() => { setSelectedGame('triples'); setActiveSection('resultados'); setResultadosDropdownOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-emerald-700 flex items-center gap-2 border-b border-emerald-700"><Dice3 className="w-4 h-4" /> Triples</button>
                    <button onClick={() => { setSelectedGame('terminales'); setActiveSection('resultados'); setResultadosDropdownOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-emerald-700 flex items-center gap-2 border-b border-emerald-700"><Hash className="w-4 h-4" /> Terminales</button>
                    <button onClick={() => { setSelectedGame('mas1'); setActiveSection('resultados'); setResultadosDropdownOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-emerald-700 flex items-center gap-2"><Plus className="w-4 h-4" /> Más 1</button>
                  </div>
                )}
              </div>

              <button onClick={() => setActiveSection('animales')} className={`px-4 py-2 rounded-lg transition-colors ${activeSection === 'animales' ? 'bg-yellow-500 text-black' : 'hover:bg-emerald-800'}`}>Animales</button>
              <button onClick={() => setActiveSection('horarios')} className={`px-4 py-2 rounded-lg transition-colors ${activeSection === 'horarios' ? 'bg-yellow-500 text-black' : 'hover:bg-emerald-800'}`}>Horarios</button>
              <button onClick={() => setActiveSection('preguntas')} className={`px-4 py-2 rounded-lg transition-colors ${activeSection === 'preguntas' ? 'bg-yellow-500 text-black' : 'hover:bg-emerald-800'}`}>Preguntas</button>
              <button onClick={() => setActiveSection('contacto')} className={`px-4 py-2 rounded-lg transition-colors ${activeSection === 'contacto' ? 'bg-yellow-500 text-black' : 'hover:bg-emerald-800'}`}>Contáctanos</button>
            </div>

            <button onClick={() => isAuthenticated ? setAdminOpen(true) : setLoginOpen(true)} className="hidden md:flex items-center gap-2 px-3 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30">
              <Lock className="w-4 h-4" /> Admin
            </button>

            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2">
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-emerald-900 pt-20 md:hidden overflow-y-auto">
          <div className="flex flex-col p-4 space-y-2">
            <button onClick={() => { setActiveSection('inicio'); setMenuOpen(false); }} className="text-left text-lg py-3 border-b border-emerald-800">Inicio</button>
            <div className="py-3 border-b border-emerald-800">
              <div className="text-lg mb-2 text-emerald-400">Sorteos:</div>
              <button onClick={() => { setSelectedGame('venezuela'); setActiveSection('resultados'); setMenuOpen(false); }} className="w-full text-left py-2 pl-4 text-emerald-300">🇻🇪 Venezuela</button>
              <button onClick={() => { setSelectedGame('peru'); setActiveSection('resultados'); setMenuOpen(false); }} className="w-full text-left py-2 pl-4 text-emerald-300">🇵🇪 Perú</button>
              <button onClick={() => { setSelectedGame('triples'); setActiveSection('resultados'); setMenuOpen(false); }} className="w-full text-left py-2 pl-4 text-emerald-300">🎲 Triple</button>
              <button onClick={() => { setSelectedGame('terminales'); setActiveSection('resultados'); setMenuOpen(false); }} className="w-full text-left py-2 pl-4 text-emerald-300">🔢 Terminal</button>
              <button onClick={() => { setSelectedGame('mas1'); setActiveSection('resultados'); setMenuOpen(false); }} className="w-full text-left py-2 pl-4 text-emerald-300">⭐ Más 1</button>
            </div>
            <button onClick={() => { setActiveSection('animales'); setMenuOpen(false); }} className="text-left text-lg py-3 border-b border-emerald-800">Animales</button>
            <button onClick={() => { setActiveSection('horarios'); setMenuOpen(false); }} className="text-left text-lg py-3 border-b border-emerald-800">Horarios</button>
            <button onClick={() => { setActiveSection('preguntas'); setMenuOpen(false); }} className="text-left text-lg py-3 border-b border-emerald-800">Preguntas Frecuentes</button>
            <button onClick={() => { setActiveSection('contacto'); setMenuOpen(false); }} className="text-left text-lg py-3 border-b border-emerald-800">Contáctanos</button>
            <button onClick={() => { isAuthenticated ? setAdminOpen(true) : setLoginOpen(true); setMenuOpen(false); }} className="text-left text-lg py-3 text-yellow-400">Administrador</button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">

        {/* INICIO */}
        {activeSection === 'inicio' && (
          <div className="space-y-8">
            <div className="relative min-h-[500px] flex items-center">
              <div className="grid md:grid-cols-2 gap-8 items-center w-full">
                <div className="text-center md:text-left z-10">
                  <Badge className="bg-emerald-800/80 text-emerald-300 border-emerald-600 px-4 py-1 mb-4">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2" />
                    Resultados en vivo
                  </Badge>
                  <h1 className="text-4xl md:text-6xl font-black mb-4">
                    <span className="text-white">La mejor lotería de</span><br />
                    <span className="text-yellow-400">animales</span>
                  </h1>
                  <p className="text-red-400 text-lg md:text-xl font-semibold">
                    Consulta los resultados de los sorteos de animales en tiempo real. ¡Juega con confianza con Zoolo CASINO!
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3 justify-center md:justify-start">
                    <button onClick={() => setActiveSection('resultados')} className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-6 py-3 rounded-lg flex items-center gap-2">
                      <Trophy className="w-5 h-5" /> Ver Resultados
                    </button>
                    <button onClick={() => setShowRules(true)} className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-6 py-3 rounded-lg flex items-center gap-2">
                      <Info className="w-5 h-5" /> ¿Cómo jugar?
                    </button>
                  </div>
                </div>

                <div className="relative flex justify-center">
                  <div className="relative">
                    <Smartphone className="w-64 h-96 text-emerald-700" strokeWidth={1} />
                    <div className="absolute inset-4 bg-gradient-to-b from-emerald-600/30 to-emerald-800/50 rounded-3xl overflow-hidden">
                      <motion.div animate={{ y: [-10, 10, -10], rotate: [-5, 5, -5] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className="absolute top-4 left-4">
                        <img src="/animals/5-leon.jpg" alt="León" className="w-14 h-14 rounded-full border-2 border-yellow-400 shadow-lg" />
                      </motion.div>
                      <motion.div animate={{ y: [10, -10, 10], rotate: [5, -5, 5] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} className="absolute top-12 right-4">
                        <img src="/animals/10-tigre.jpg" alt="Tigre" className="w-12 h-12 rounded-full border-2 border-emerald-400 shadow-lg" />
                      </motion.div>
                      <motion.div animate={{ y: [-5, 15, -5], x: [-5, 5, -5] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute top-28 left-8">
                        <img src="/animals/35-jirafa.jpg" alt="Jirafa" className="w-16 h-16 rounded-full border-2 border-yellow-400 shadow-lg" />
                      </motion.div>
                      <motion.div animate={{ y: [15, -5, 15], x: [5, -5, 5] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }} className="absolute top-32 right-6">
                        <img src="/animals/29-elefante.jpg" alt="Elefante" className="w-14 h-14 rounded-full border-2 border-emerald-400 shadow-lg" />
                      </motion.div>
                      <motion.div animate={{ y: [-8, 12, -8], rotate: [-3, 3, -3] }} transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="absolute bottom-24 left-6">
                        <img src="/animals/21-gallo.jpg" alt="Gallo" className="w-12 h-12 rounded-full border-2 border-red-400 shadow-lg" />
                      </motion.div>
                      <motion.div animate={{ y: [12, -8, 12], rotate: [3, -3, 3] }} transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 2.5 }} className="absolute bottom-20 right-8">
                        <img src="/animals/27-perro.jpg" alt="Perro" className="w-14 h-14 rounded-full border-2 border-yellow-400 shadow-lg" />
                      </motion.div>
                      <motion.div animate={{ y: [-12, 8, -12] }} transition={{ duration: 3.3, repeat: Infinity, ease: "easeInOut", delay: 0.8 }} className="absolute bottom-8 left-1/2 -translate-x-1/2">
                        <img src="/animals/40-lechuza.jpg" alt="Lechuza" className="w-16 h-16 rounded-full border-2 border-yellow-400 shadow-lg" />
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-emerald-800/50 border-emerald-700 p-4 text-center">
                <Trophy className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
                <div className="text-2xl font-bold">42</div>
                <div className="text-xs text-emerald-400">Animales</div>
              </Card>
              <Card className="bg-emerald-800/50 border-emerald-700 p-4 text-center">
                <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-400" />
                <div className="text-2xl font-bold">12</div>
                <div className="text-xs text-emerald-400">Sorteos/Día</div>
              </Card>
              <Card className="bg-emerald-800/50 border-emerald-700 p-4 text-center">
                <Star className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
                <div className="text-2xl font-bold">100%</div>
                <div className="text-xs text-emerald-400">Confiable</div>
              </Card>
            </div>

            <Card className="bg-emerald-800/50 border-emerald-700 p-6 text-center">
              <h3 className="text-yellow-400 mb-4 flex items-center justify-center gap-2"><Star className="w-4 h-4" />Animal del Momento</h3>
              {animalMomentoData ? (
                <>
                  <img src={getAnimalImagePath(animalMomentoData, selectedGame === 'peru' ? 'peru' : 'venezuela')} alt={animalMomentoData.name} className="w-32 h-32 rounded-xl mx-auto mb-4 object-cover" />
                  <Badge className={`text-lg px-4 py-1 mb-2 ${animalMomentoData.color === 'rojo' ? 'bg-red-500' : animalMomentoData.color === 'verde' ? 'bg-green-500' : 'bg-gray-700'}`}>
                    {animalDelMomento.result}
                  </Badge>
                  <div className="text-xl font-bold">{animalMomentoData.name}</div>
                  <div className="text-sm text-emerald-400">Sorteo: {animalDelMomento.time}</div>
                </>
              ) : (
                <>
                  <div className="w-32 h-32 rounded-xl mx-auto mb-4 bg-emerald-700/50 flex items-center justify-center">
                    <Clock className="w-16 h-16 text-emerald-500" />
                  </div>
                  <div className="text-xl font-bold">Esperando sorteo</div>
                  <div className="text-sm text-emerald-400">Sorteo: {animalDelMomento.time}</div>
                </>
              )}
            </Card>

            <div className="text-center">
              <button onClick={() => setShowRules(true)} className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-8 py-4 rounded-xl flex items-center gap-3 mx-auto">
                <Info className="w-6 h-6" />
                ¿Cómo jugar ZooloCASINO?
              </button>
              <p className="text-emerald-400 text-sm mt-3">Descubre cómo ganar con nuestros diferentes juegos</p>
            </div>
          </div>
        )}

        {/* RESULTADOS */}
        {activeSection === 'resultados' && (
          <div className="space-y-6">
            <div className="flex flex-wrap justify-center gap-2">
              <button onClick={() => setSelectedGame('venezuela')} className={`flex items-center gap-2 px-4 py-2 rounded-lg ${selectedGame === 'venezuela' ? 'bg-yellow-500 text-black' : 'bg-emerald-800 text-white'}`}><span>🇻🇪</span> Venezuela</button>
              <button onClick={() => setSelectedGame('peru')} className={`flex items-center gap-2 px-4 py-2 rounded-lg ${selectedGame === 'peru' ? 'bg-yellow-500 text-black' : 'bg-emerald-800 text-white'}`}><span>🇵🇪</span> Perú</button>
              <button onClick={() => setSelectedGame('triples')} className={`flex items-center gap-2 px-4 py-2 rounded-lg ${selectedGame === 'triples' ? 'bg-yellow-500 text-black' : 'bg-emerald-800 text-white'}`}><Dice3 className="w-4 h-4" /> Triple</button>
              <button onClick={() => setSelectedGame('terminales')} className={`flex items-center gap-2 px-4 py-2 rounded-lg ${selectedGame === 'terminales' ? 'bg-yellow-500 text-black' : 'bg-emerald-800 text-white'}`}><Hash className="w-4 h-4" /> Terminal</button>
              <button onClick={() => setSelectedGame('mas1')} className={`flex items-center gap-2 px-4 py-2 rounded-lg ${selectedGame === 'mas1' ? 'bg-yellow-500 text-black' : 'bg-emerald-800 text-white'}`}><Plus className="w-4 h-4" /> Más 1</button>
            </div>

            {(selectedGame === 'venezuela' || selectedGame === 'peru') && (
              <Card className="bg-emerald-800/50 border-emerald-700 p-6 text-center">
                <h3 className="text-yellow-400 mb-4 flex items-center justify-center gap-2"><Star className="w-4 h-4" />Animal del Momento</h3>
                {animalMomentoData ? (
                  <>
                    <img src={getAnimalImagePath(animalMomentoData, selectedGame === 'peru' ? 'peru' : 'venezuela')} alt={animalMomentoData.name} className="w-32 h-32 rounded-xl mx-auto mb-4 object-cover" />
                    <Badge className={`text-lg px-4 py-1 mb-2 ${animalMomentoData.color === 'rojo' ? 'bg-red-500' : animalMomentoData.color === 'verde' ? 'bg-green-500' : 'bg-gray-700'}`}>
                      {animalDelMomento.result}
                    </Badge>
                    <div className="text-xl font-bold">{animalMomentoData.name}</div>
                    <div className="text-sm text-emerald-400">Sorteo: {animalDelMomento.time}</div>
                  </>
                ) : (
                  <>
                    <div className="w-32 h-32 rounded-xl mx-auto mb-4 bg-emerald-700/50 flex items-center justify-center">
                      <Clock className="w-16 h-16 text-emerald-500" />
                    </div>
                    <div className="text-xl font-bold">Esperando sorteo</div>
                    <div className="text-sm text-emerald-400">Sorteo: {animalDelMomento.time}</div>
                  </>
                )}
              </Card>
            )}

            <div>
              <h3 className="text-yellow-400 text-xl text-center mb-2">
                {selectedGame === 'venezuela' && '🇻🇪 Resultados ZooloCASINO Venezuela'}
                {selectedGame === 'peru' && '🇵🇪 Resultados ZooloCASINO Perú'}
                {selectedGame === 'triples' && '🎲 Resultados Triple ZooloCASINO'}
                {selectedGame === 'terminales' && '🔢 Resultados Terminal ZooloCASINO'}
                {selectedGame === 'mas1' && '⭐ Resultado Más 1'}
              </h3>

              {/* ✅ FIX: Navegación de fecha con InlineCalendar */}
              <div className="flex items-center justify-center gap-4 mb-6">
                <button
                  onClick={() => setSelectedDate(new Date(selectedDate.getTime() - 24 * 60 * 60 * 1000))}
                  className="p-2 bg-emerald-800 rounded-lg hover:bg-emerald-700 active:scale-95 transition-transform"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setDatePickerOpen(true)}
                  className="flex items-center gap-2 bg-emerald-800 px-4 py-2 rounded-lg hover:bg-emerald-700 active:scale-95 transition-transform"
                >
                  <Calendar className="w-5 h-5 text-yellow-400" />
                  <span className="text-sm">{formatDate(selectedDate)}</span>
                </button>
                <button
                  onClick={() => setSelectedDate(new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000))}
                  className="p-2 bg-emerald-800 rounded-lg hover:bg-emerald-700 active:scale-95 transition-transform"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* ✅ FIX: min-h para evitar pantalla en blanco al buscar en móvil */}
              <div className="min-h-[600px]">
                {selectedGame === 'venezuela' && <div className="grid grid-cols-2 gap-3">{venezuelaResults.map((s) => renderAnimalitoCard(s))}</div>}
                {selectedGame === 'peru' && <div className="grid grid-cols-2 gap-3">{peruResults.map((s) => renderAnimalitoCard(s))}</div>}
                {selectedGame === 'triples' && <div className="grid grid-cols-1 md:grid-cols-3 gap-3">{triplesResults.map((s) => renderTripleCard(s))}</div>}
                {selectedGame === 'terminales' && <div className="grid grid-cols-1 md:grid-cols-3 gap-3">{terminalesResults.map((s) => renderTerminalCard(s))}</div>}
                {selectedGame === 'mas1' && renderMas1()}
              </div>
            </div>
          </div>
        )}

        {/* ANIMALES */}
        {activeSection === 'animales' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Los <span className="text-yellow-400">42</span> Animales</h2>
              <p className="text-emerald-400 text-sm">Conoce todos los animales de la lotería. Cada uno tiene un número y un color asignado.</p>
            </div>

            {/* ✅ FIX: Input de búsqueda con inputMode para mejor comportamiento en móvil */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500 pointer-events-none" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar animal o número..."
                inputMode="search"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                className="pl-10 bg-emerald-800 border-emerald-700 text-white placeholder:text-emerald-500"
              />
            </div>

            <div className="flex gap-2 justify-center flex-wrap">
              <button onClick={() => setAnimalFilter('todos')} className={`px-4 py-2 rounded-full text-sm ${animalFilter === 'todos' ? 'bg-yellow-500 text-black' : 'bg-emerald-800 text-white'}`}>Todos</button>
              <button onClick={() => setAnimalFilter('rojos')} className={`px-4 py-2 rounded-full text-sm ${animalFilter === 'rojos' ? 'bg-red-500 text-white' : 'bg-emerald-800 text-white'}`}>Rojos</button>
              <button onClick={() => setAnimalFilter('negros')} className={`px-4 py-2 rounded-full text-sm ${animalFilter === 'negros' ? 'bg-gray-700 text-white' : 'bg-emerald-800 text-white'}`}>Negros</button>
              <button onClick={() => setAnimalFilter('verdes')} className={`px-4 py-2 rounded-full text-sm ${animalFilter === 'verdes' ? 'bg-green-500 text-white' : 'bg-emerald-800 text-white'}`}>Verdes</button>
            </div>
            <div className="flex justify-center gap-2">
              <button onClick={() => setAnimalView('grid')} className={`p-2 rounded ${animalView === 'grid' ? 'bg-yellow-500 text-black' : 'bg-emerald-800 text-white'}`}><LayoutGrid className="w-5 h-5" /></button>
              <button onClick={() => setAnimalView('list')} className={`p-2 rounded ${animalView === 'list' ? 'bg-yellow-500 text-black' : 'bg-emerald-800 text-white'}`}><List className="w-5 h-5" /></button>
            </div>
            <div className="text-center text-sm text-emerald-400">Mostrando {filteredAnimals.length} de 42 animales</div>

            {/* ✅ FIX: min-h-[300px] evita que el contenedor colapse al buscar en móvil */}
            <div className={`min-h-[600px] ${animalView === 'grid' ? 'grid grid-cols-2 gap-3' : 'space-y-2'}`}>
              {filteredAnimals.length === 0 ? (
                <div className="col-span-2 text-center py-16 text-emerald-500">
                  <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p>No se encontraron animales con "{searchQuery}"</p>
                </div>
              ) : (
                filteredAnimals.map((animal) => (
                  <div key={animal.num} className={`bg-emerald-800/50 border border-emerald-700 rounded-xl p-3 flex items-center gap-3 ${animalView === 'grid' ? 'flex-col' : 'flex-row'}`}>
                    <img src={animal.image} alt={animal.name} className={`rounded-lg object-cover ${animalView === 'grid' ? 'w-20 h-20' : 'w-12 h-12'}`} />
                    <div className={`text-center ${animalView === 'grid' ? '' : 'text-left flex-1'}`}>
                      <Badge className={`${animal.color === 'rojo' ? 'bg-red-500' : animal.color === 'verde' ? 'bg-green-500' : 'bg-gray-700'}`}>{animal.num}</Badge>
                      <div className="font-medium text-sm mt-1">{animal.name}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* HORARIOS */}
        {activeSection === 'horarios' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2"><span className="text-yellow-400">Horarios</span> de sorteos</h2>
              <p className="text-emerald-400 text-sm">Los sorteos se realizan todos los días. ¡No te pierdas ninguno!</p>
            </div>
            <div className="flex justify-center gap-4">
              <button onClick={() => setSelectedGame('venezuela')} className={`flex items-center gap-2 px-4 py-2 rounded-lg ${selectedGame === 'venezuela' ? 'bg-yellow-500 text-black' : 'bg-emerald-800 text-white'}`}><span>🇻🇪</span> Venezuela</button>
              <button onClick={() => setSelectedGame('peru')} className={`flex items-center gap-2 px-4 py-2 rounded-lg ${selectedGame === 'peru' ? 'bg-yellow-500 text-black' : 'bg-emerald-800 text-white'}`}><span>🇵🇪</span> Perú</button>
            </div>
            <Card className="bg-emerald-800/50 border-emerald-700 p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-2xl">{selectedGame === 'peru' ? '🇵🇪' : '🇻🇪'}</span>
                <span className="text-emerald-300">Hora en {selectedGame === 'peru' ? 'Perú' : 'Venezuela'}</span>
              </div>
              <div className="text-4xl font-mono font-bold text-yellow-400 mb-2">{getCurrentTime().toLocaleTimeString('es-ES', { hour12: true })}</div>
              {countdown && (selectedGame === 'venezuela' || selectedGame === 'peru') && (
                <>
                  <div className="text-emerald-300 text-sm mb-2">⏱ Próximo sorteo: {formatTimeDisplay(countdown.time)}</div>
                  <div className="flex justify-center gap-2">
                    <div className="bg-emerald-900 rounded-lg p-2 min-w-[60px]"><div className="text-2xl font-bold">{String(countdown.hours).padStart(2, '0')}</div><div className="text-xs text-emerald-400">horas</div></div>
                    <div className="bg-emerald-900 rounded-lg p-2 min-w-[60px]"><div className="text-2xl font-bold">{String(countdown.minutes).padStart(2, '0')}</div><div className="text-xs text-emerald-400">min</div></div>
                    <div className="bg-emerald-900 rounded-lg p-2 min-w-[60px]"><div className="text-2xl font-bold">{String(countdown.seconds).padStart(2, '0')}</div><div className="text-xs text-emerald-400">seg</div></div>
                  </div>
                </>
              )}
            </Card>
            <div className="grid grid-cols-2 gap-3">
              {(selectedGame === 'venezuela' ? VENEZUELA_TIMES : PERU_TIMES).map((time) => {
                const isDone = isPast(time, selectedGame === 'peru' ? 'peru' : 'venezuela');
                return (
                  <div key={time} className={`p-3 rounded-lg ${isDone ? 'bg-emerald-800/30' : 'bg-emerald-800/50'}`}>
                    <div className="flex items-center gap-2 text-sm"><Clock className="w-4 h-4 text-emerald-400" />{formatTimeDisplay(time)}</div>
                    {isDone && <div className="text-xs text-emerald-500 mt-1">Finalizado</div>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PREGUNTAS */}
        {activeSection === 'preguntas' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2"><span className="text-yellow-400">Preguntas</span> Frecuentes</h2>
              <p className="text-emerald-400 text-sm">Encuentra respuestas a las preguntas más comunes sobre ZooloCASINO</p>
            </div>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-emerald-800/50 border border-emerald-700 rounded-xl p-4">
                  <h3 className="font-bold text-yellow-400 mb-2 flex items-center gap-2"><HelpCircle className="w-5 h-5" />{faq.q}</h3>
                  <p className="text-emerald-300 text-sm">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CONTACTO */}
        {activeSection === 'contacto' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2"><span className="text-yellow-400">Contáctanos</span></h2>
              <p className="text-emerald-400 text-sm">Estamos aquí para ayudarte. Ponte en contacto con nosotros.</p>
            </div>
            <Card className="bg-emerald-800/50 border-emerald-700 p-8 text-center max-w-md mx-auto">
              <Mail className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
              <h3 className="text-xl font-bold mb-2">Correo Electrónico</h3>
              <p className="text-emerald-300 mb-4">Envíanos un correo y te responderemos lo antes posible.</p>
              <a href="mailto:soportezoolo@gmail.com" className="text-yellow-400 text-lg font-bold hover:underline">soportezoolo@gmail.com</a>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <Card className="bg-emerald-800/50 border-emerald-700 p-6 text-center">
                <MapPin className="w-10 h-10 mx-auto mb-3 text-yellow-400" />
                <h3 className="font-bold mb-1">Ubicación</h3>
                <p className="text-emerald-300 text-sm">Caracas, Venezuela</p>
              </Card>
              <Card className="bg-emerald-800/50 border-emerald-700 p-6 text-center">
                <Clock className="w-10 h-10 mx-auto mb-3 text-yellow-400" />
                <h3 className="font-bold mb-1">Horario de Atención</h3>
                <p className="text-emerald-300 text-sm">Lunes a Domingo, 24 horas</p>
              </Card>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-emerald-950 border-t border-emerald-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center mb-6">
            <img src="/logo.jpg" alt="ZooloCASINO" className="w-12 h-12 rounded-full mx-auto mb-2" />
            <div className="font-bold text-lg">Zoolo <span className="text-yellow-400">CASINO</span></div>
            <p className="text-emerald-400 text-sm mt-2">La mejor plataforma de resultados de lotería animal en Venezuela.</p>
          </div>
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="font-bold mb-3">Enlaces Rápidos</h4>
              <ul className="space-y-2 text-sm text-emerald-400">
                <li><button onClick={() => setActiveSection('inicio')} className="hover:text-white">Inicio</button></li>
                <li><button onClick={() => setActiveSection('resultados')} className="hover:text-white">Resultados</button></li>
                <li><button onClick={() => setActiveSection('animales')} className="hover:text-white">Animales</button></li>
                <li><button onClick={() => setActiveSection('horarios')} className="hover:text-white">Horarios</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3">Contacto</h4>
              <ul className="space-y-2 text-sm text-emerald-400">
                <li>soportezoolo@gmail.com</li>
                <li>+58 999 999 999</li>
                <li>Caracas, Venezuela</li>
              </ul>
            </div>
          </div>
          <div className="text-center text-xs text-emerald-500 border-t border-emerald-800 pt-4">© 2026 Zoolo CASINO. Todos los derechos reservados</div>
        </div>
      </footer>
    </div>
  );
}

export default App;
