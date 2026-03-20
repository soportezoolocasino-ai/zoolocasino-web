export interface Animal {
  num: string;
  name: string;
  color: 'rojo' | 'negro' | 'verde';
  image: string;
}

export interface SorteoAnimalito {
  id: string;
  time: string;
  result: string;
}

export interface SorteoTriple {
  id: string;
  time: string;
  r1: string;
  r2: string;
  r3: string;
}

export interface SorteoTerminal {
  id: string;
  time: string;
  r1: string;
  r2: string;
}

export interface Mas1Result {
  numero: string;
  animal_num: string;
}
