import { useState, useEffect, useCallback } from 'react';
import type { SorteoAnimalito, SorteoTriple, SorteoTerminal, Mas1Result } from '@/types';
import { VENEZUELA_TIMES, PERU_TIMES, TT_TIMES, getTimezone } from '@/data/animals';

// Formatear fecha como YYYY-MM-DD
const formatDateKey = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

// Crear sorteos iniciales
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

// Crear estado vacío para un día
const createEmptyDayState = (): DayState => ({
  venezuela: mkAnimalitos('venezuela'),
  peru: mkAnimalitos('peru'),
  triples: mkTriples(),
  terminales: mkTerminales(),
  mas1: mkMas1()
});

// Autenticación
const ADMIN_USER = 'cuborubi';
const ADMIN_PASS = '06251413Jp';

// Obtener hora local según país
const getLocalTime = (country: 'venezuela' | 'peru') => {
  const now = new Date();
  const offset = getTimezone(country);
  return new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + (offset * 3600000));
};

export const useZooloState = () => {
  // INICIAMOS EL ESTADO VACÍO. Ya no leemos del disco duro (localStorage).
  const [state, setState] = useState<AppState>({});
  const [venezuelaTime, setVenezuelaTime] = useState<Date>(getLocalTime('venezuela'));
  const [peruTime, setPeruTime] = useState<Date>(getLocalTime('peru'));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Actualizar reloj cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      setVenezuelaTime(getLocalTime('venezuela'));
      setPeruTime(getLocalTime('peru'));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Obtener estado para una fecha específica
  const getDayState = useCallback((date: Date): DayState => {
    const dateKey = formatDateKey(date);
    return state[dateKey] || createEmptyDayState();
  }, [state]);

  // Autenticación (Esta sí la dejamos en localStorage para no perder la sesión)
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
    const auth = localStorage.getItem('zoo_admin_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Helpers de tiempo
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

  // Acciones para Venezuela
  const updateVenezuela = useCallback((date: Date, id: string, result: string) => {
    const dateKey = formatDateKey(date);
    setState((prev: AppState) => {
      const dayState = prev[dateKey] || createEmptyDayState();
      return {
        ...prev,
        [dateKey]: {
          ...dayState,
          venezuela: dayState.venezuela.map((s: SorteoAnimalito) => s.id === id ? { ...s, result } : s)
        }
      };
    });
  }, []);

  const clearVenezuela = useCallback((date: Date, id: string) => {
    const dateKey = formatDateKey(date);
    setState((prev: AppState) => {
      const dayState = prev[dateKey] || createEmptyDayState();
      return {
        ...prev,
        [dateKey]: {
          ...dayState,
          venezuela: dayState.venezuela.map((s: SorteoAnimalito) => s.id === id ? { ...s, result: '' } : s)
        }
      };
    });
  }, []);

  // Acciones para Perú
  const updatePeru = useCallback((date: Date, id: string, result: string) => {
    const dateKey = formatDateKey(date);
    setState((prev: AppState) => {
      const dayState = prev[dateKey] || createEmptyDayState();
      return {
        ...prev,
        [dateKey]: {
          ...dayState,
          peru: dayState.peru.map((s: SorteoAnimalito) => s.id === id ? { ...s, result } : s)
        }
      };
    });
  }, []);

  const clearPeru = useCallback((date: Date, id: string) => {
    const dateKey = formatDateKey(date);
    setState((prev: AppState) => {
      const dayState = prev[dateKey] || createEmptyDayState();
      return {
        ...prev,
        [dateKey]: {
          ...dayState,
          peru: dayState.peru.map((s: SorteoAnimalito) => s.id === id ? { ...s, result: '' } : s)
        }
      };
    });
  }, []);

  // Acciones para Triples
  const updateTriple = useCallback((date: Date, id: string, r1: string, r2: string, r3: string) => {
    const dateKey = formatDateKey(date);
    setState((prev: AppState) => {
      const dayState = prev[dateKey] || createEmptyDayState();
      return {
        ...prev,
        [dateKey]: {
          ...dayState,
          triples: dayState.triples.map((s: SorteoTriple) => s.id === id ? { ...s, r1, r2, r3 } : s)
        }
      };
    });
  }, []);

  const clearTriple = useCallback((date: Date, id: string) => {
    const dateKey = formatDateKey(date);
    setState((prev: AppState) => {
      const dayState = prev[dateKey] || createEmptyDayState();
      return {
        ...prev,
        [dateKey]: {
          ...dayState,
          triples: dayState.triples.map((s: SorteoTriple) => s.id === id ? { ...s, r1: '', r2: '', r3: '' } : s)
        }
      };
    });
  }, []);

  // Acciones para Terminales
  const updateTerminal = useCallback((date: Date, id: string, r1: string, r2: string) => {
    const dateKey = formatDateKey(date);
    setState((prev: AppState) => {
      const dayState = prev[dateKey] || createEmptyDayState();
      return {
        ...prev,
        [dateKey]: {
          ...dayState,
          terminales: dayState.terminales.map((s: SorteoTerminal) => s.id === id ? { ...s, r1, r2 } : s)
        }
      };
    });
  }, []);

  const clearTerminal = useCallback((date: Date, id: string) => {
    const dateKey = formatDateKey(date);
    setState((prev: AppState) => {
      const dayState = prev[dateKey] || createEmptyDayState();
      return {
        ...prev,
        [dateKey]: {
          ...dayState,
          terminales: dayState.terminales.map((s: SorteoTerminal) => s.id === id ? { ...s, r1: '', r2: '' } : s)
        }
      };
    });
  }, []);

  // Acciones para Más 1
  const updateMas1 = useCallback((date: Date, numero: string, animal_num: string) => {
    const dateKey = formatDateKey(date);
    setState((prev: AppState) => {
      const dayState = prev[dateKey] || createEmptyDayState();
      return {
        ...prev,
        [dateKey]: {
          ...dayState,
          mas1: { numero, animal_num }
        }
      };
    });
  }, []);

  const clearMas1 = useCallback((date: Date) => {
    const dateKey = formatDateKey(date);
    setState((prev: AppState) => {
      const dayState = prev[dateKey] || createEmptyDayState();
      return {
        ...prev,
        [dateKey]: {
          ...dayState,
          mas1: mkMas1()
        }
      };
    });
  }, []);

  return {
    state, getDayState, venezuelaTime, peruTime, isAuthenticated,
    isPast, isNext, login, logout, checkAuth,
    updateVenezuela, updatePeru, updateTriple, updateTerminal, updateMas1,
    clearVenezuela, clearPeru, clearTriple, clearTerminal, clearMas1
  };
};
