export interface Stadium {
  name: string;
  city: string;
  capacity: number;
}

export interface Trophies {
  liga_domestik: number;
  piala_domestik: number;
  internasional: number;
}

export interface Club {
  id: string;
  club: string;
  country: string;
  league: string;
  division: number;
  founded: number;
  stadium: Stadium;
  coach: string;
  key_players: string[];
  trophies: Trophies;
  nickname?: string;
  rival?: string;
  imageUrl?: string;
}

export interface Stats {
  total: number;
  countries: string[];
  leagues: string[];
}

export const totalTrophies = (c: Club) =>
  (c.trophies?.liga_domestik || 0) +
  (c.trophies?.piala_domestik || 0) +
  (c.trophies?.internasional || 0);
