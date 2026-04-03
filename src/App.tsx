import { useState, useEffect, useCallback, useRef } from 'react';
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
  ChevronLeft,
  ChevronRight,
  Search,
  Menu,
  Lock,
  LogOut,
  Save,
  Trash2,
  Mail,
  Trophy,
  TrendingUp,
  Star,
  Info
} from 'lucide-react';
import './App.css';

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

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = originalOverflow; };
  }, []);

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
    <div
      className="fixed z-50 flex items-center justify-center bg-black/60 p-4"
      style={{ top: 0, left: 0, right: 0, bottom: 0, height: '100dvh' }}
      onTouchStart={(e) => e.stopPropagation()}
      onClick={onClose}
    >
      <div
        className="bg-emerald-900 border border-emerald-700 rounded-2xl shadow-2xl p-4 w-full max-w-xs"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1));
            }}
            className="p-2 hover:bg-emerald-800 rounded-lg active:scale-95 transition-transform"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-bold text-sm">{MONTHS[month.getMonth()]} {month.getFullYear()}</span>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1));
            }}
            className="p-2 hover:bg-emerald-800 rounded-lg active:scale-95 transition-transform"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center mb-1">
          {DAYS_HEADER.map((d) => (
            <div key={d} className="text-emerald-400 text-xs py-1 font-medium">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {generateDays().map((day, i) => (
            <button
              key={i}
              disabled={!day}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                if (day) {
                  onSelectDate(new Date(month.getFullYear(), month.getMonth(), day));
                  onClose();
                }
              }}
              className={`aspect-square rounded-lg text-sm font-medium transition-all active:scale-95 
                ${!day ? 'invisible' : ''} 
                ${isSelected(day) ? 'bg-yellow-500 text-black font-bold shadow-lg' : 'hover:bg-emerald-800 text-white'}`}
            >
              {day || ''}
            </button>
          ))}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="mt-3 w-full py-2 text-sm text-emerald-400 hover:text-white hover:bg-emerald-800 rounded-lg transition-colors"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// HERO SECTION - Animales flotando sobre móvil
// ─────────────────────────────────────────────
function HeroSection({ onShowRules, onGoToResultados }: { onShowRules: () => void; onGoToResultados: () => void }) {
  // Lista de animales para la animación (usamos los primeros 8)
  const heroAnimals = [
    { num: '05', name: 'leon',      style: { top: '8%',  left: '18%',  animDelay: '0s',    size: 72 } },
    { num: '10', name: 'tigre',     style: { top: '4%',  right: '18%', animDelay: '0.4s',  size: 64 } },
    { num: '35', name: 'aguila',    style: { top: '32%', left: '12%',  animDelay: '0.8s',  size: 78 } },
    { num: '29', name: 'elefante',  style: { top: '28%', right: '14%', animDelay: '1.2s',  size: 70 } },
    { num: '21', name: 'gallo',     style: { top: '56%', left: '10%',  animDelay: '0.6s',  size: 66 } },
    { num: '27', name: 'mono',      style: { top: '60%', right: '12%', animDelay: '1s',    size: 74 } },
    { num: '40', name: 'lechuza',   style: { top: '76%', left: '22%',  animDelay: '1.4s',  size: 60 } },
    { num: '40', name: 'delfin',    style: { top: '72%', right: '20%', animDelay: '0.2s',  size: 80 } },
  ];

  return (
    <div className="hero-section relative overflow-hidden" style={{ minHeight: '520px' }}>
      {/* Fondo con gradiente */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-800/30 to-transparent pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 px-2 py-8 max-w-5xl mx-auto">
        
        {/* Texto izquierda */}
        <div className="flex-1 text-center md:text-left space-y-5 md:pr-8">
          <div className="inline-flex items-center gap-2 bg-emerald-800/60 border border-emerald-600 rounded-full px-4 py-1.5 text-sm">
            <span className="live-indicator inline-block w-2 h-2 rounded-full bg-green-400"></span>
            Resultados en vivo
          </div>

          <h1 className="text-4xl md:text-5xl font-black leading-tight">
            La mejor lotería de{' '}
            <span className="text-yellow-400">animales</span>
          </h1>

          <p className="text-emerald-200 text-base md:text-lg">
            Consulta los resultados de los sorteos de animales en tiempo real.{' '}
            <span className="text-yellow-400 font-semibold">¡Juega con confianza con Zoolo CASINO!</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
            <button
              onClick={onGoToResultados}
              className="hero-btn-yellow flex items-center justify-center gap-2"
            >
              <Trophy className="w-5 h-5" />
              Ver resultados
            </button>
            <button
              onClick={onShowRules}
              className="hero-btn-outline flex items-center justify-center gap-2"
            >
              <Info className="w-5 h-5" />
              ¿Cómo jugar?
            </button>
          </div>
        </div>

        {/* Móvil con animales flotando */}
        <div className="flex-shrink-0 relative" style={{ width: '260px', height: '420px' }}>
          {/* Cuerpo del móvil */}
          <div className="mobile-frame absolute inset-x-8 inset-y-0 rounded-3xl border-4 border-emerald-600/60 bg-emerald-900/40 backdrop-blur-sm shadow-2xl z-10">
            {/* Pantalla interior */}
            <div className="absolute inset-2 rounded-2xl bg-emerald-800/30 border border-emerald-700/40" />
            {/* Notch */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-2 bg-emerald-700/60 rounded-full" />
            {/* Botón home */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-8 h-2 bg-emerald-700/60 rounded-full" />
          </div>

          {/* Animales flotando alrededor del móvil */}
          {heroAnimals.map((a, i) => (
            <div
              key={i}
              className="hero-animal absolute z-20"
              style={{
                ...a.style,
                animationDelay: a.style.animDelay,
                width: a.style.size,
                height: a.style.size,
              }}
            >
              <img
                src={`/animals/${a.num}-${a.name}.jpg`}
                alt={a.name}
                className="w-full h-full rounded-full object-cover border-3 shadow-lg"
                style={{ border: '3px solid rgba(251,191,36,0.6)', boxShadow: '0 4px 15px rgba(0,0,0,0.4)' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/animals/0-delfin.jpg';
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// STATS CARDS
// ─────────────────────────────────────────────
function StatsCards() {
  return (
    <div className="grid grid-cols-3 gap-3 md:gap-4">
      <Card className="stats-card p-4 md:p-5 bg-emerald-800/50 border-emerald-700 text-white text-center">
        <Trophy className="w-7 h-7 text-yellow-400 mx-auto mb-2" />
        <div className="text-2xl md:text-3xl font-black text-white">42</div>
        <div className="text-xs md:text-sm text-emerald-300 mt-1">Animales</div>
      </Card>
      <Card className="stats-card p-4 md:p-5 bg-emerald-800/50 border-emerald-700 text-white text-center">
        <TrendingUp className="w-7 h-7 text-emerald-400 mx-auto mb-2" />
        <div className="text-2xl md:text-3xl font-black text-white">12</div>
        <div className="text-xs md:text-sm text-emerald-300 mt-1">Sorteos/Día</div>
      </Card>
      <Card className="stats-card p-4 md:p-5 bg-emerald-800/50 border-emerald-700 text-white text-center">
        <Star className="w-7 h-7 text-yellow-400 mx-auto mb-2" />
        <div className="text-2xl md:text-3xl font-black text-white">100%</div>
        <div className="text-xs md:text-sm text-emerald-300 mt-1">Confiable</div>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────
// ANIMAL DEL MOMENTO
// ─────────────────────────────────────────────
function AnimalDelMomento({ animal, imageUrl, nextSorteoTime }: { animal: any; imageUrl: string; nextSorteoTime?: string }) {
  return (
    <Card className="animal-momento-card p-6 bg-emerald-800/50 border-emerald-700 max-w-sm mx-auto text-center">
      <div className="flex items-center justify-center gap-2 mb-4">
        <Star className="w-4 h-4 text-yellow-400" />
        <h3 className="text-yellow-400 font-bold text-base">Animal del Momento</h3>
      </div>

      {animal ? (
        <div className="space-y-2">
          <img
            src={imageUrl}
            className="w-32 h-32 rounded-2xl mx-auto object-cover border-4 border-yellow-400/40 shadow-lg"
            alt={animal.name}
          />
          <div className="text-xl font-bold">{animal.name}</div>
          <div className="text-emerald-300 text-sm">N° {animal.num}</div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="waiting-clock w-24 h-24 rounded-2xl bg-emerald-700/60 flex items-center justify-center mx-auto border border-emerald-600">
            <Clock className="w-12 h-12 text-emerald-400 clock-spin" />
          </div>
          <div className="font-bold text-lg text-white">Esperando sorteo</div>
          {nextSorteoTime && (
            <div className="text-emerald-400 text-sm">Sorteo: {nextSorteoTime}</div>
          )}
        </div>
      )}
    </Card>
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
  }, [activeAdminTab, adminSelectedDate]);

  const handleSave = async () => {
    const dateStr = adminSelectedDate.toISOString().split('T')[0];
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
                  <Button size="sm" variant="destructive" onClick={() => {
                    setLocalResults({ ...localResults, [s.id]: '' });
                    activeAdminTab === 'venezuela' ? clearVenezuela(adminSelectedDate, s.id) : clearPeru(adminSelectedDate, s.id);
                  }}>
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
                <Input
                  type="number" min="0" max="9"
                  value={localResults['mas1_numero'] || ''}
                  onChange={(e) => setLocalResults({ ...localResults, mas1_numero: e.target.value })}
                  placeholder="0-9"
                  className="text-center text-xl font-bold bg-emerald-700 border-emerald-600 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-emerald-300 mb-1 block">Animalito</label>
                <select
                  value={localResults['mas1_animal'] || ''}
                  onChange={(e) => setLocalResults({ ...localResults, mas1_animal: e.target.value })}
                  className="w-full p-2 rounded bg-emerald-700 border border-emerald-600 text-white"
                >
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [adminSelectedDate, setAdminSelectedDate] = useState(new Date());

  const syncedDates = useRef<Set<string>>(new Set());

  const {
    getDayState,
    isAuthenticated,
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
  const { venezuela: vRes, peru: pRes, triples: tRes, terminales: termRes, mas1: mRes } = dayState;

  useEffect(() => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    if (syncedDates.current.has(dateStr)) return;
    const syncData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/results/${dateStr}`);
        if (!response.ok) return;
        const cloudData = await response.json();
        syncedDates.current.add(dateStr);
        cloudData.forEach((entry: any) => {
          if (entry.game_type === 'venezuela') {
            Object.keys(entry.data).forEach(id => updateVenezuela(selectedDate, id, entry.data[id]));
          }
          if (entry.game_type === 'peru') {
            Object.keys(entry.data).forEach(id => updatePeru(selectedDate, id, entry.data[id]));
          }
          if (entry.game_type === 'triples') { void entry.data; }
          if (entry.game_type === 'terminales') { void entry.data; }
          if (entry.game_type === 'mas1') {
            if (entry.data.mas1_numero !== undefined) {
              updateMas1(selectedDate, entry.data.mas1_numero || '', entry.data.mas1_animal || '');
            }
          }
        });
      } catch (err) { console.error("Sync error:", err); }
    };
    syncData();
  }, [selectedDate]);

  useEffect(() => { checkAuth(); }, []);

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
    if (login(loginForm.username, loginForm.password)) {
      setLoginOpen(false);
      setAdminOpen(true);
      setLoginForm({ username: '', password: '' });
      showToast('Bienvenido');
    } else {
      showToast('Usuario o contraseña incorrectos', 'error');
    }
  };

  const getSorteos = useCallback(() => {
    return selectedGame === 'peru' ? pRes : vRes;
  }, [selectedGame, pRes, vRes]);

  const getAnimalDelMomento = useCallback(() => {
    const s = getSorteos();
    for (let i = s.length - 1; i >= 0; i--) {
      if (s[i].result) return { animal: getAnimal(s[i].result) };
    }
    return { animal: null };
  }, [getSorteos]);

  // Calcular próximo sorteo
  const getNextSorteoTime = useCallback(() => {
    const now = new Date();
    const times = selectedGame === 'peru' ? PERU_TIMES : VENEZUELA_TIMES;
    const currentMins = now.getHours() * 60 + now.getMinutes();
    for (const t of times) {
      const [h, m] = t.split(':').map(Number);
      if (h * 60 + m > currentMins) return `${t}`;
    }
    return times[0];
  }, [selectedGame]);

  const filteredAnimals = ANIMALS.filter(a => {
    if (searchQuery) return a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.num.includes(searchQuery);
    return true;
  });

  const getAnimalImagePath = (a: Animal, c: 'venezuela' | 'peru') => {
    const n = a.name.toLowerCase().replace(/[áéíóúñü]/g, (x: string) => ({'á':'a','é':'e','í':'i','ó':'o','ú':'u','ñ':'n','ü':'u'}[x] || x));
    return c === 'peru' ? `/animals/peru/${a.num}-${n}.jpg` : `/animals/${a.num}-${n}.jpg`;
  };

  const renderAnimalitoCard = (s: any) => {
    const done = s.result && s.result.trim() !== '';
    const animal = done ? getAnimal(s.result) : null;
    const country = selectedGame === 'peru' ? 'peru' : 'venezuela';
    return (
      <div key={s.id} className={`sorteo-card ${done ? 'finalizado' : 'pendiente'}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="sorteo-time"><Clock className="w-4 h-4" />{formatTimeDisplay(s.time)}</div>
          <span>{country === 'peru' ? '🇵🇪' : '🇻🇪'}</span>
        </div>
        {done && animal ? (
          <>
            <img
              src={getAnimalImagePath(animal, country)}
              className={`sorteo-animal-img-large border-4 ${animal.color === 'rojo' ? 'border-red-500' : animal.color === 'verde' ? 'border-green-500' : 'border-gray-800'}`}
              onError={(e) => { (e.target as HTMLImageElement).src = '/animals/0-delfin.jpg'; }}
              alt={animal.name}
            />
            <div className="sorteo-animal-name">{animal.name}</div>
            <div className="sorteo-animal-num">N° {s.result}</div>
          </>
        ) : (
          <div className="sorteo-placeholder"><Clock className="w-8 h-8 opacity-50" /></div>
        )}
        <Badge className={`sorteo-badge ${done ? 'finalizado' : 'pendiente'}`}>{done ? 'Finalizado' : 'Pendiente'}</Badge>
      </div>
    );
  };

  const { animal: aMD } = getAnimalDelMomento();

  const goToPrevDay = useCallback(() => {
    setSelectedDate(prev => new Date(prev.getTime() - 86400000));
  }, []);

  const goToNextDay = useCallback(() => {
    setSelectedDate(prev => new Date(prev.getTime() + 86400000));
  }, []);

  return (
    <div className="min-h-screen bg-emerald-900 text-white">
      {datePickerOpen && (
        <InlineCalendar
          selectedDate={selectedDate}
          onSelectDate={(date) => { setSelectedDate(date); setDatePickerOpen(false); }}
          onClose={() => setDatePickerOpen(false)}
        />
      )}

      {toast && (
        <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg z-50 ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {toast.message}
        </div>
      )}

      {/* LOGIN DIALOG */}
      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent className="bg-emerald-900 border-emerald-700 text-white">
          <DialogHeader><DialogTitle>Admin</DialogTitle></DialogHeader>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input value={loginForm.username} onChange={e => setLoginForm({...loginForm, username: e.target.value})} placeholder="Usuario" className="bg-emerald-800" />
            <Input type="password" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} placeholder="Contraseña" className="bg-emerald-800" />
            <Button type="submit" className="w-full bg-yellow-500 text-black">Login</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* ADMIN DIALOG */}
      <Dialog open={adminOpen} onOpenChange={setAdminOpen}>
        <DialogContent className="bg-emerald-900 border-emerald-700 text-white max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>Panel Admin</span>
              <Button variant="ghost" onClick={() => { logout(); setAdminOpen(false); }}>
                <LogOut className="w-4 h-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="flex gap-2 flex-wrap mb-4">
            {(['venezuela', 'peru', 'triples', 'terminales', 'mas1'] as const).map(t => (
              <Button key={t} size="sm" onClick={() => setActiveAdminTab(t)} variant={activeAdminTab === t ? 'default' : 'outline'}>
                {t}
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

      {/* NAVBAR */}
      <nav className="sticky top-0 z-40 bg-emerald-900/95 border-b border-emerald-800 h-16 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <img src="/logo.jpg" className="w-10 h-10 rounded-full" alt="Logo" />
          <div>
            <div className="font-bold">Zoolo</div>
            <div className="text-yellow-400 text-xs">CASINO</div>
          </div>
        </div>
        <div className="hidden md:flex gap-1">
          {(['inicio', 'resultados', 'animales', 'horarios', 'preguntas', 'contacto'] as const).map(s => (
            <button key={s} onClick={() => setActiveSection(s)} className={`px-4 py-2 hover:bg-emerald-800 rounded-lg capitalize ${activeSection === s ? 'bg-emerald-800' : ''}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => isAuthenticated ? setAdminOpen(true) : setLoginOpen(true)} className="bg-yellow-500/20 text-yellow-400 px-3 py-2 rounded-lg">
            <Lock className="w-4 h-4" />
          </button>
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* MENU MOBILE */}
      {menuOpen && (
        <div className="fixed z-40 bg-emerald-900 p-4 flex flex-col gap-2" style={{ top: '64px', left: 0, right: 0, bottom: 0 }}>
          {(['inicio', 'resultados', 'animales', 'horarios', 'preguntas', 'contacto'] as const).map(s => (
            <button key={s} onClick={() => { setActiveSection(s); setMenuOpen(false); }} className="py-3 text-left text-lg hover:bg-emerald-800 px-4 rounded-lg capitalize">
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 py-6">

        {/* ── INICIO ── */}
        {activeSection === 'inicio' && (
          <div className="space-y-8">

            {/* Hero con animales flotando */}
            <HeroSection
              onShowRules={() => setShowRules(true)}
              onGoToResultados={() => setActiveSection('resultados')}
            />

            {/* Stats */}
            <StatsCards />

            {/* Animal del Momento */}
            <AnimalDelMomento
              animal={aMD}
              imageUrl={aMD ? getAnimalImagePath(aMD, selectedGame === 'peru' ? 'peru' : 'venezuela') : ''}
              nextSorteoTime={getNextSorteoTime()}
            />

            {/* Botón ¿Cómo jugar? */}
            <div className="text-center space-y-2">
              <button
                onClick={() => setShowRules(true)}
                className="hero-btn-yellow inline-flex items-center gap-2 mx-auto"
              >
                <Info className="w-5 h-5" />
                ¿Cómo jugar ZooloCASINO?
              </button>
              <p className="text-emerald-400 text-sm">Descubre cómo ganar con nuestros diferentes juegos.</p>
            </div>

          </div>
        )}

        {/* ── RESULTADOS ── */}
        {activeSection === 'resultados' && (
          <div className="space-y-6">
            <div className="flex justify-center gap-2 flex-wrap">
              {(['venezuela', 'peru', 'triples', 'terminales', 'mas1'] as const).map(g => (
                <button
                  key={g}
                  onClick={() => setSelectedGame(g)}
                  className={`px-4 py-2 rounded-lg capitalize ${selectedGame === g ? 'bg-yellow-500 text-black font-bold' : 'bg-emerald-800 text-white hover:bg-emerald-700'}`}
                >
                  {g}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-center gap-4">
              <button onClick={goToPrevDay} className="p-2 bg-emerald-800 rounded-lg hover:bg-emerald-700 active:scale-95 transition-transform touch-manipulation">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={() => setDatePickerOpen(true)} className="bg-emerald-800 px-4 py-2 rounded-lg hover:bg-emerald-700 touch-manipulation">
                {formatDate(selectedDate)}
              </button>
              <button onClick={goToNextDay} className="p-2 bg-emerald-800 rounded-lg hover:bg-emerald-700 active:scale-95 transition-transform touch-manipulation">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {(selectedGame === 'venezuela' || selectedGame === 'peru') && getSorteos().map(s => renderAnimalitoCard(s))}
              {selectedGame === 'triples' && tRes.map((s: any) => (
                <div key={s.id} className="sorteo-card bg-emerald-800/50 p-4 text-center rounded-xl">
                  <div className="text-lg font-bold">{s.r1 || '?'} - {s.r2 || '?'} - {s.r3 || '?'}</div>
                  <div className="text-sm text-emerald-400 mt-1">{TT_NAMES[s.time]}</div>
                </div>
              ))}
              {selectedGame === 'terminales' && termRes.map((s: any) => (
                <div key={s.id} className="sorteo-card bg-emerald-800/50 p-4 text-center rounded-xl">
                  <div className="text-lg font-bold">{s.r1 || '?'} - {s.r2 || '?'}</div>
                  <div className="text-sm text-emerald-400 mt-1">{TT_NAMES[s.time]}</div>
                </div>
              ))}
              {selectedGame === 'mas1' && (
                <div className="col-span-2 p-6 bg-emerald-800/50 text-center rounded-xl">
                  <div className="text-3xl font-black text-yellow-400">{mRes.numero || '?'}</div>
                  <div className="text-sm text-emerald-400 mt-2">Animal: {mRes.animal_num || '?'}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── ANIMALES ── */}
        {activeSection === 'animales' && (
          <div className="space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
              <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Buscar animal o número..." className="pl-10 bg-emerald-800 border-emerald-700 text-white" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {filteredAnimals.map(a => (
                <div key={a.num} className="bg-emerald-800/50 border border-emerald-700 rounded-xl p-3 flex flex-col items-center gap-2">
                  <img src={a.image} className="w-20 h-20 rounded-lg object-cover" alt={a.name} />
                  <Badge className={a.color === 'rojo' ? 'bg-red-500' : a.color === 'verde' ? 'bg-green-500' : 'bg-gray-700'}>{a.num}</Badge>
                  <div className="font-medium text-sm text-center">{a.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── HORARIOS ── */}
        {activeSection === 'horarios' && (
          <div className="space-y-6 text-center">
            <h2 className="text-2xl font-bold">Horarios de Sorteos</h2>
            <div className="flex justify-center gap-4 mb-4">
              {(['venezuela', 'peru'] as const).map(g => (
                <button key={g} onClick={() => setSelectedGame(g)} className={`px-4 py-2 rounded-lg capitalize ${selectedGame === g ? 'bg-yellow-500 text-black font-bold' : 'bg-emerald-800 text-white'}`}>
                  {g === 'venezuela' ? '🇻🇪 Venezuela' : '🇵🇪 Perú'}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-lg mx-auto">
              {(selectedGame === 'peru' ? PERU_TIMES : VENEZUELA_TIMES).map(t => (
                <div key={t} className="p-3 bg-emerald-800/50 rounded-lg flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-400" />
                  <span>{formatTimeDisplay(t)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PREGUNTAS ── */}
        {activeSection === 'preguntas' && (
          <div className="space-y-4 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-6">Preguntas Frecuentes</h2>
            {[
              { q: '¿Qué es ZooloCASINO?', a: 'Plataforma de resultados en tiempo real de la lotería de animales.' },
              { q: '¿Cuánto paga un animalito?', a: '35 veces lo apostado.' },
              { q: '¿Cuánto paga un triple?', a: '700 veces lo apostado.' },
              { q: '¿Cuánto paga el Más 1?', a: '250 veces lo apostado.' },
            ].map(({ q, a }) => (
              <div key={q} className="bg-emerald-800/50 p-4 rounded-xl">
                <div className="font-bold text-yellow-400 mb-1">{q}</div>
                <div className="text-emerald-200">{a}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── CONTACTO ── */}
        {activeSection === 'contacto' && (
          <div className="max-w-md mx-auto text-center space-y-4">
            <h2 className="text-2xl font-bold mb-6">Contacto</h2>
            <Card className="p-8 bg-emerald-800/50 border-emerald-700">
              <Mail className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
              <h3 className="font-bold text-lg mb-2">Email</h3>
              <a href="mailto:soportezoolo@gmail.com" className="text-yellow-400 hover:underline">soportezoolo@gmail.com</a>
            </Card>
          </div>
        )}

      </main>

      <footer className="bg-emerald-950 border-t border-emerald-800 py-8 text-center text-xs text-emerald-500 mt-12">
        © 2026 Zoolo CASINO. Todos los derechos reservados.
      </footer>

      {/* REGLAS DIALOG */}
      <Dialog open={showRules} onOpenChange={setShowRules}>
        <DialogContent className="bg-emerald-900 border-emerald-700 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">ⓘ ¿Cómo jugar ZooloCASINO?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 p-2">
            <div className="bg-emerald-800 rounded-xl p-4">
              <h3 className="text-yellow-400 font-bold text-lg mb-2">🐯 Animalitos (42 animales)</h3>
              <p className="text-emerald-100 text-sm">Selecciona un animalito de los 42 disponibles. Si aciertas el ganador, <strong className="text-yellow-400">pagamos 35 veces</strong> lo apostado.</p>
              <p className="text-emerald-100 text-sm mt-2">🦉 <strong className="text-yellow-400">El 40 (Lechuza) paga el doble:</strong> 70 veces lo apostado.</p>
            </div>
            <div className="bg-emerald-800 rounded-xl p-4">
              <h3 className="text-yellow-400 font-bold text-lg mb-2">🎲 Triple</h3>
              <p className="text-emerald-100 text-sm">Acierta 3 números y gana <strong className="text-yellow-400">700 veces</strong> lo apostado.</p>
              <p className="text-emerald-100 text-sm mt-2">📍 <strong>Aproximado:</strong> Si juegas el 500 y sale el 499 o 501, se paga <strong className="text-yellow-400">20 veces</strong> lo apostado.</p>
            </div>
            <div className="bg-emerald-800 rounded-xl p-4">
              <h3 className="text-yellow-400 font-bold text-lg mb-2">🔢 Terminal</h3>
              <p className="text-emerald-100 text-sm">Acierta 2 números y gana <strong className="text-yellow-400">65 veces</strong> lo apostado.</p>
            </div>
            <div className="bg-emerald-800 rounded-xl p-4">
              <h3 className="text-yellow-400 font-bold text-lg mb-2">⭐ Más 1</h3>
              <p className="text-emerald-100 text-sm">Selecciona un número del 0 al 9 más un animalito. Si aciertas ambos, gana <strong className="text-yellow-400">250 veces</strong> lo apostado.</p>
              <p className="text-emerald-100 text-sm mt-2">💰 Apuesta mínima: <strong className="text-yellow-400">$5</strong></p>
              <p className="text-emerald-100 text-sm mt-2">🐯 Si solo aciertas el animal: ganas <strong className="text-yellow-400">35 veces</strong>. Nota: el 40 no tiene valor doble aquí.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}

export default App;
