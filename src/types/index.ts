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
  revolution?: boolean;
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

export type ThemeMode = 'light' | 'dark' | 'system';

export interface PlayerStatistics {
  playerId: string;
  totalGames: number;
  totalSessions: number;
  wins: number;
  winRate: number;
  averageRank: number;
  bestRank: number;
  worstRank: number;
  revolutionCount: number;
}

export interface SessionStatistics {
  sessionId: string;
  playerId: string;
  gamesPlayed: number;
  wins: number;
  averageRank: number;
  totalScore: number;
  finalRank: number;
}

export interface HeadToHeadStats {
  player1Id: string;
  player2Id: string;
  player1Wins: number;
  player2Wins: number;
  draws: number;
  totalFaceOffs: number;
}

export interface RoundTrendPoint {
  roundIndex: number;
  cumulativeScore: number;
}
