import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Player, Session, GameSet, Round, RoundResult, ThemeMode } from "@/types";
import { generateId } from "@/lib/id";

interface AppState {
  players: Player[];
  sessions: Session[];
  theme: ThemeMode;

  // Player CRUD
  addPlayer: (name: string) => Player;
  removePlayer: (id: string) => void;
  renamePlayer: (id: string, name: string) => void;
  getPlayer: (id: string) => Player | undefined;

  // Session CRUD
  createSession: (name: string, playerIds: string[]) => Session;
  deleteSession: (id: string) => void;
  renameSession: (id: string, name: string) => void;
  addPlayerToSession: (sessionId: string, playerName: string) => void;
  removePlayerFromSession: (sessionId: string, playerId: string) => void;
  getSession: (id: string) => Session | undefined;

  // Set CRUD
  createSet: (sessionId: string, targetRounds: number) => GameSet | undefined;
  deleteSet: (sessionId: string, setId: string) => void;
  getSet: (sessionId: string, setId: string) => GameSet | undefined;

  // Round CRUD (within a set)
  addRound: (sessionId: string, setId: string, participantIds: string[], results: RoundResult[], revolution?: boolean) => void;
  updateRound: (sessionId: string, setId: string, roundId: string, participantIds: string[], results: RoundResult[], revolution?: boolean) => void;
  deleteRound: (sessionId: string, setId: string, roundId: string) => void;
  getRound: (sessionId: string, roundId: string) => Round | undefined;

  // Theme
  setTheme: (theme: ThemeMode) => void;

  // Onboarding
  onboardingCompleted: boolean;
  onboardingStep: number;
  completeOnboarding: () => void;
  setOnboardingStep: (step: number) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      players: [],
      sessions: [],
      theme: "system" as ThemeMode,

      addPlayer: (name: string) => {
        const player: Player = { id: generateId(), name, createdAt: Date.now() };
        set((state) => ({ players: [...state.players, player] }));
        return player;
      },

      removePlayer: (id: string) => {
        set((state) => ({
          players: state.players.filter((p) => p.id !== id),
        }));
      },

      renamePlayer: (id: string, name: string) => {
        set((state) => ({
          players: state.players.map((p) =>
            p.id === id ? { ...p, name } : p
          ),
        }));
      },

      getPlayer: (id: string) => {
        return get().players.find((p) => p.id === id);
      },

      createSession: (name: string, playerIds: string[]) => {
        const session: Session = {
          id: generateId(),
          name,
          playerIds,
          sets: [],
          createdAt: Date.now(),
        };
        set((state) => ({ sessions: [...state.sessions, session] }));
        return session;
      },

      deleteSession: (id: string) => {
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== id),
        }));
      },

      renameSession: (id: string, name: string) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === id ? { ...s, name } : s
          ),
        }));
      },

      addPlayerToSession: (sessionId: string, playerName: string) => {
        const player = get().addPlayer(playerName);
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? { ...s, playerIds: [...s.playerIds, player.id] }
              : s
          ),
        }));
      },

      removePlayerFromSession: (sessionId: string, playerId: string) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? { ...s, playerIds: s.playerIds.filter((id) => id !== playerId) }
              : s
          ),
        }));
      },

      getSession: (id: string) => {
        return get().sessions.find((s) => s.id === id);
      },

      // Set CRUD
      createSet: (sessionId: string, targetRounds: number) => {
        const gameSet: GameSet = {
          id: generateId(),
          targetRounds,
          rounds: [],
          createdAt: Date.now(),
        };
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? { ...s, sets: [...s.sets, gameSet] }
              : s
          ),
        }));
        return gameSet;
      },

      deleteSet: (sessionId: string, setId: string) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? { ...s, sets: s.sets.filter((gs) => gs.id !== setId) }
              : s
          ),
        }));
      },

      getSet: (sessionId: string, setId: string) => {
        const session = get().sessions.find((s) => s.id === sessionId);
        return session?.sets.find((gs) => gs.id === setId);
      },

      // Round CRUD (within a set)
      addRound: (sessionId: string, setId: string, participantIds: string[], results: RoundResult[], revolution?: boolean) => {
        const round: Round = {
          id: generateId(),
          participantIds,
          results,
          revolution: revolution ?? false,
          createdAt: Date.now(),
        };
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  sets: s.sets.map((gs) =>
                    gs.id === setId
                      ? { ...gs, rounds: [...gs.rounds, round] }
                      : gs
                  ),
                }
              : s
          ),
        }));
      },

      updateRound: (sessionId: string, setId: string, roundId: string, participantIds: string[], results: RoundResult[], revolution?: boolean) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  sets: s.sets.map((gs) =>
                    gs.id === setId
                      ? {
                          ...gs,
                          rounds: gs.rounds.map((r) =>
                            r.id === roundId
                              ? { ...r, participantIds, results, revolution: revolution ?? false }
                              : r
                          ),
                        }
                      : gs
                  ),
                }
              : s
          ),
        }));
      },

      deleteRound: (sessionId: string, setId: string, roundId: string) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  sets: s.sets.map((gs) =>
                    gs.id === setId
                      ? { ...gs, rounds: gs.rounds.filter((r) => r.id !== roundId) }
                      : gs
                  ),
                }
              : s
          ),
        }));
      },

      getRound: (sessionId: string, roundId: string) => {
        const session = get().sessions.find((s) => s.id === sessionId);
        if (!session) return undefined;
        for (const gs of session.sets) {
          const round = gs.rounds.find((r) => r.id === roundId);
          if (round) return round;
        }
        return undefined;
      },

      setTheme: (theme: ThemeMode) => set({ theme }),

      // Onboarding
      onboardingCompleted: false,
      onboardingStep: 0,
      completeOnboarding: () => set({ onboardingCompleted: true, onboardingStep: -1 }),
      setOnboardingStep: (step: number) => set({ onboardingStep: step }),
    }),
    {
      name: "dalmuti-score-storage",
      version: 3,
      migrate: (persistedState, version) => {
        const state = persistedState as Record<string, unknown>;
        if (version === 0) {
          if (!state.theme) {
            state.theme = "system";
          }
        }
        if (version < 2) {
          state.onboardingCompleted = false;
          state.onboardingStep = 0;
        }
        if (version < 3) {
          // Migrate sessions from flat rounds to sets
          const sessions = state.sessions as Array<Record<string, unknown>>;
          if (sessions) {
            for (const session of sessions) {
              const rounds = session.rounds as Round[] | undefined;
              if (rounds && !session.sets) {
                if (rounds.length > 0) {
                  session.sets = [{
                    id: generateId(),
                    targetRounds: rounds.length,
                    rounds,
                    createdAt: (session.createdAt as number) ?? Date.now(),
                  }];
                } else {
                  session.sets = [];
                }
                delete session.rounds;
              }
            }
          }
        }
        return persistedState as AppState;
      },
    }
  )
);
