import type { Animal } from '@/types';

export const ANIMALS: Animal[] = [
  { num: '0', name: 'Delfín', color: 'verde', image: '/animals/0-delfin.jpg' },
  { num: '00', name: 'Ballena', color: 'verde', image: '/animals/00-ballena.jpg' },
  { num: '1', name: 'Carnero', color: 'rojo', image: '/animals/1-carnero.jpg' },
  { num: '2', name: 'Toro', color: 'negro', image: '/animals/2-toro.jpg' },
  { num: '3', name: 'Ciempiés', color: 'rojo', image: '/animals/3-ciempies.jpg' },
  { num: '4', name: 'Alacrán', color: 'negro', image: '/animals/4-alacran.jpg' },
  { num: '5', name: 'León', color: 'rojo', image: '/animals/5-leon.jpg' },
  { num: '6', name: 'Rana', color: 'negro', image: '/animals/6-rana.jpg' },
  { num: '7', name: 'Perico', color: 'rojo', image: '/animals/7-perico.jpg' },
  { num: '8', name: 'Ratón', color: 'negro', image: '/animals/8-raton.jpg' },
  { num: '9', name: 'Águila', color: 'rojo', image: '/animals/9-aguila.jpg' },
  { num: '10', name: 'Tigre', color: 'negro', image: '/animals/10-tigre.jpg' },
  { num: '11', name: 'Gato', color: 'negro', image: '/animals/11-gato.jpg' },
  { num: '12', name: 'Caballo', color: 'rojo', image: '/animals/12-caballo.jpg' },
  { num: '13', name: 'Mono', color: 'negro', image: '/animals/13-mono.jpg' },
  { num: '14', name: 'Paloma', color: 'rojo', image: '/animals/14-paloma.jpg' },
  { num: '15', name: 'Zorro', color: 'negro', image: '/animals/15-zorro.jpg' },
  { num: '16', name: 'Oso', color: 'rojo', image: '/animals/16-oso.jpg' },
  { num: '17', name: 'Pavo', color: 'negro', image: '/animals/17-pavo.jpg' },
  { num: '18', name: 'Burro', color: 'rojo', image: '/animals/18-burro.jpg' },
  { num: '19', name: 'Chivo', color: 'rojo', image: '/animals/19-chivo.jpg' },
  { num: '20', name: 'Cochino', color: 'negro', image: '/animals/20-cochino.jpg' },
  { num: '21', name: 'Gallo', color: 'rojo', image: '/animals/21-gallo.jpg' },
  { num: '22', name: 'Camello', color: 'negro', image: '/animals/22-camello.jpg' },
  { num: '23', name: 'Cebra', color: 'rojo', image: '/animals/23-cebra.jpg' },
  { num: '24', name: 'Iguana', color: 'negro', image: '/animals/24-iguana.jpg' },
  { num: '25', name: 'Gallina', color: 'rojo', image: '/animals/25-gallina.jpg' },
  { num: '26', name: 'Vaca', color: 'negro', image: '/animals/26-vaca.jpg' },
  { num: '27', name: 'Perro', color: 'rojo', image: '/animals/27-perro.jpg' },
  { num: '28', name: 'Zamuro', color: 'negro', image: '/animals/28-zamuro.jpg' },
  { num: '29', name: 'Elefante', color: 'negro', image: '/animals/29-elefante.jpg' },
  { num: '30', name: 'Caimán', color: 'rojo', image: '/animals/30-caiman.jpg' },
  { num: '31', name: 'Lapa', color: 'negro', image: '/animals/31-lapa.jpg' },
  { num: '32', name: 'Ardilla', color: 'rojo', image: '/animals/32-ardilla.jpg' },
  { num: '33', name: 'Pescado', color: 'negro', image: '/animals/33-pescado.jpg' },
  { num: '34', name: 'Venado', color: 'rojo', image: '/animals/34-venado.jpg' },
  { num: '35', name: 'Jirafa', color: 'negro', image: '/animals/35-jirafa.jpg' },
  { num: '36', name: 'Culebra', color: 'rojo', image: '/animals/36-culebra.jpg' },
  { num: '37', name: 'Avispa', color: 'rojo', image: '/animals/37-avispa.jpg' },
  { num: '38', name: 'Conejo', color: 'negro', image: '/animals/38-conejo.jpg' },
  { num: '39', name: 'Tortuga', color: 'rojo', image: '/animals/39-tortuga.jpg' },
  { num: '40', name: 'Lechuza', color: 'negro', image: '/animals/40-lechuza.jpg' },
];

export const VENEZUELA_TIMES = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];
export const PERU_TIMES = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
export const TT_TIMES = ['09:00', '12:00', '15:00', '18:00'];

export const getAnimal = (num: string): Animal | undefined => {
  return ANIMALS.find(a => a.num === num);
};

export const getTimezone = (country: 'venezuela' | 'peru'): number => {
  return country === 'venezuela' ? -4 : -5;
};

export const formatTimeDisplay = (time: string): string => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

// Nombres de animales para administrador
export const A_NAMES: Record<string, string> = {
  '0': 'Delfín', '00': 'Ballena', '1': 'Carnero', '2': 'Toro', '3': 'Ciempiés',
  '4': 'Alacrán', '5': 'León', '6': 'Rana', '7': 'Perico', '8': 'Ratón',
  '9': 'Águila', '10': 'Tigre', '11': 'Gato', '12': 'Caballo', '13': 'Mono',
  '14': 'Paloma', '15': 'Zorro', '16': 'Oso', '17': 'Pavo', '18': 'Burro',
  '19': 'Chivo', '20': 'Cochino', '21': 'Gallo', '22': 'Camello', '23': 'Cebra',
  '24': 'Iguana', '25': 'Gallina', '26': 'Vaca', '27': 'Perro', '28': 'Zamuro',
  '29': 'Elefante', '30': 'Caimán', '31': 'Lapa', '32': 'Ardilla', '33': 'Pescado',
  '34': 'Venado', '35': 'Jirafa', '36': 'Culebra', '37': 'Avispa', '38': 'Conejo',
  '39': 'Tortuga', '40': 'Lechuza'
};

// Nombres para Triples y Terminales
export const TT_NAMES: Record<string, string> = {
  '09:00': '09:00 AM', '12:00': '12:00 PM', '15:00': '03:00 PM', '18:00': '06:00 PM'
};

export type { Animal };
