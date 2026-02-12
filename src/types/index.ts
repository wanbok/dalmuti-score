export interface Player {
  id: string;
  name: string;
  createdAt: number;
}

export interface RoundResult {
  playerId: string;
  rank: number;
}

export interface Round {
  id: string;
  participantIds: string[];
  results: RoundResult[];
  createdAt: number;
}

export interface Session {
  id: string;
  name: string;
  playerIds: string[];
  rounds: Round[];
  createdAt: number;
}

export interface ScoreEntry {
  playerId: string;
  scores: (number | null)[]; // null = did not participate
  total: number;
  rank: number;
}
