import { useState, useEffect, useCallback, useRef } from 'react';
import type { SorteoAnimalito, SorteoTriple, SorteoTerminal, Mas1Result } from '@/types';
import { VENEZUELA_TIMES, PERU_TIMES, TT_TIMES, getTimezone } from '@/data/animals';

// ── Backend Flask (resultados automáticos) ─────────────────────────────────
const FLASK_API = "https://zoolo-casino1-1.onrender.com";

const formatDateKey = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const mkAnimalitos = (country: 'venezuela' | 'peru'): SorteoAnimalito[] => {
  const times = country === 'venezuela' ? VENEZUELA_TIMES : PERU_TIMES;
  return times.map((t, i) => ({ id: `${country}_a${i}`, time: t, result: '' }));
};

const mkTriples = (): SorteoTriple[] =>
  TT_TIMES.map((t, i) => ({ id: `t${i}`, time: t, r1: '', r2: '', r3: '' }));

const mkTerminales = (): SorteoTerminal[] =>
  TT_TIMES.map((t, i) => ({ id: `e${i}`, time: t, r1: '', r2: '' }));

const mkMas1 = (): Mas1Result => ({ numero: '', animal_num: '' });

interface DayState {
  venezuela: SorteoAnimalito[];
  peru: SorteoAnimalito[];
  triples: SorteoTriple[];
  terminales: SorteoTerminal[];
  mas1: Mas1Result;
}

interface AppState {
  [dateKey: string]: DayState;
}

const createEmptyDayState = (): DayState => ({
  venezuela: mkAnimalitos('venezuela'),
  peru: mkAnimalitos('peru'),
  triples: mkTriples(),
  terminales: mkTerminales(),
  mas1: mkMas1()
});

const ADMIN_USER = 'cuborubi';
const ADMIN_PASS = '06251413Jp';

const getLocalTime = (country: 'venezuela' | 'peru') => {
  const now = new Date();
  const offset = getTimezone(country);
  return new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + (offset * 3600000));
};

export const useZooloState = () => {
  const [state, setState] = useState<AppState>({});
  const [venezuelaTime, setVenezuelaTime] = useState<Date>(getLocalTime('venezuela'));
  const [peruTime, setPeruTime] = useState<Date>(getLocalTime('peru'));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const selectedDateRef = useRef<Date>(new Date());
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reloj
  useEffect(() => {
    const interval = setInterval(() => {
      setVenezuelaTime(getLocalTime('venezuela'));
      setPeruTime(getLocalTime('peru'));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // ── Sync desde Flask ────────────────────────────────────────────────────
  const fetchFromFlask = useCallback(async (date?: Date) => {
    const target = date || selectedDateRef.current;
    const dateStr = formatDateKey(target);
    try {
      const res = await fetch(`${FLASK_API}/public/resultados-fecha?fecha=${dateStr}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.status !== 'ok') return;

      setState(prev => {
        const dateKey = dateStr;
        const day = prev[dateKey] || createEmptyDayState();

        // Mapear PERÚ: hora "HH:MM" → slot en PERU_TIMES
        const newPeru = day.peru.map((s, i) => {
          const hora24 = PERU_TIMES[i];
          const result = data.peru?.[hora24];
          return result !== undefined && result !== null && String(result) !== ''
            ? { ...s, result: String(result) }
            : s;
        });

        // Mapear VENEZUELA (PLUS en Flask)
        const newVenezuela = day.venezuela.map((s, i) => {
          const hora24 = VENEZUELA_TIMES[i];
          const result = data.venezuela?.[hora24];
          return result !== undefined && result !== null && String(result) !== ''
            ? { ...s, result: String(result) }
            : s;
        });

        return {
          ...prev,
          [dateKey]: { ...day, peru: newPeru, venezuela: newVenezuela }
        };
      });
    } catch (err) {
      console.warn('[ZooloState] Flask sync error:', err);
    }
  }, []);

  // ── Polling cada 30 segundos ────────────────────────────────────────────
  useEffect(() => {
    // Carga inicial
    fetchFromFlask(new Date());

    // Polling
    pollingRef.current = setInterval(() => {
      fetchFromFlask(selectedDateRef.current);
    }, 30000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [fetchFromFlask]);

  // ── Exponer syncDate para cuando cambia la fecha en la UI ───────────────
  const syncDate = useCallback((date: Date) => {
    selectedDateRef.current = date;
    fetchFromFlask(date);
  }, [fetchFromFlask]);

  const getDayState = useCallback((date: Date): DayState => {
    const dateKey = formatDateKey(date);
    return state[dateKey] || createEmptyDayState();
  }, [state]);

  // Auth
  const login = useCallback((username: string, password: string): boolean => {
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      setIsAuthenticated(true);
      localStorage.setItem('zoo_admin_auth', 'true');
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    localStorage.removeItem('zoo_admin_auth');
  }, []);

  const checkAuth = useCallback(() => {
    if (localStorage.getItem('zoo_admin_auth') === 'true') setIsAuthenticated(true);
  }, []);

  const isPast = useCallback((time: string, country: 'venezuela' | 'peru') => {
    const currentTime = country === 'venezuela' ? venezuelaTime : peruTime;
    const [h, m] = time.split(':').map(Number);
    return currentTime.getHours() > h || (currentTime.getHours() === h && currentTime.getMinutes() >= m);
  }, [venezuelaTime, peruTime]);

  const isNext = useCallback((time: string, country: 'venezuela' | 'peru') => {
    const currentTime = country === 'venezuela' ? venezuelaTime : peruTime;
    const [h, m] = time.split(':').map(Number);
    const diff = (h * 60 + m) - (currentTime.getHours() * 60 + currentTime.getMinutes());
    return diff > 0 && diff <= 30;
  }, [venezuelaTime, peruTime]);

  // Acciones locales (mantener compatibilidad con App.tsx existente)
  const updateVenezuela = useCallback((date: Date, id: string, result: string) => {
    const dateKey = formatDateKey(date);
    setState(prev => {
      const d = prev[dateKey] || createEmptyDayState();
      return { ...prev, [dateKey]: { ...d, venezuela: d.venezuela.map(s => s.id === id ? { ...s, result } : s) } };
    });
  }, []);

  const clearVenezuela = useCallback((date: Date, id: string) => {
    updateVenezuela(date, id, '');
  }, [updateVenezuela]);

  const updatePeru = useCallback((date: Date, id: string, result: string) => {
    const dateKey = formatDateKey(date);
    setState(prev => {
      const d = prev[dateKey] || createEmptyDayState();
      return { ...prev, [dateKey]: { ...d, peru: d.peru.map(s => s.id === id ? { ...s, result } : s) } };
    });
  }, []);

  const clearPeru = useCallback((date: Date, id: string) => {
    updatePeru(date, id, '');
  }, [updatePeru]);

  const updateTriple = useCallback((date: Date, id: string, r1: string, r2: string, r3: string) => {
    const dateKey = formatDateKey(date);
    setState(prev => {
      const d = prev[dateKey] || createEmptyDayState();
      return { ...prev, [dateKey]: { ...d, triples: d.triples.map(s => s.id === id ? { ...s, r1, r2, r3 } : s) } };
    });
  }, []);

  const clearTriple = useCallback((date: Date, id: string) => {
    updateTriple(date, id, '', '', '');
  }, [updateTriple]);

  const updateTerminal = useCallback((date: Date, id: string, r1: string, r2: string) => {
    const dateKey = formatDateKey(date);
    setState(prev => {
      const d = prev[dateKey] || createEmptyDayState();
      return { ...prev, [dateKey]: { ...d, terminales: d.terminales.map(s => s.id === id ? { ...s, r1, r2 } : s) } };
    });
  }, []);

  const clearTerminal = useCallback((date: Date, id: string) => {
    updateTerminal(date, id, '', '');
  }, [updateTerminal]);

  const updateMas1 = useCallback((date: Date, numero: string, animal_num: string) => {
    const dateKey = formatDateKey(date);
    setState(prev => {
      const d = prev[dateKey] || createEmptyDayState();
      return { ...prev, [dateKey]: { ...d, mas1: { numero, animal_num } } };
    });
  }, []);

  const clearMas1 = useCallback((date: Date) => {
    updateMas1(date, '', '');
  }, [updateMas1]);

  return {
    state, getDayState, venezuelaTime, peruTime, isAuthenticated,
    isPast, isNext, login, logout, checkAuth, syncDate,
    updateVenezuela, updatePeru, updateTriple, updateTerminal, updateMas1,
    clearVenezuela, clearPeru, clearTriple, clearTerminal, clearMas1
  };
};
