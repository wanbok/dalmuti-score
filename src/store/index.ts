import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Player, Session, Round, RoundResult, ThemeMode } from "@/types";
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

  // Round CRUD
  addRound: (sessionId: string, participantIds: string[], results: RoundResult[], revolution?: boolean) => void;
  updateRound: (sessionId: string, roundId: string, participantIds: string[], results: RoundResult[], revolution?: boolean) => void;
  deleteRound: (sessionId: string, roundId: string) => void;
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
          rounds: [],
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

      addRound: (sessionId: string, participantIds: string[], results: RoundResult[], revolution?: boolean) => {
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
              ? { ...s, rounds: [...s.rounds, round] }
              : s
          ),
        }));
      },

      updateRound: (sessionId: string, roundId: string, participantIds: string[], results: RoundResult[], revolution?: boolean) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  rounds: s.rounds.map((r) =>
                    r.id === roundId
                      ? { ...r, participantIds, results, revolution: revolution ?? false }
                      : r
                  ),
                }
              : s
          ),
        }));
      },

      deleteRound: (sessionId: string, roundId: string) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? { ...s, rounds: s.rounds.filter((r) => r.id !== roundId) }
              : s
          ),
        }));
      },

      getRound: (sessionId: string, roundId: string) => {
        const session = get().sessions.find((s) => s.id === sessionId);
        return session?.rounds.find((r) => r.id === roundId);
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
      version: 2,
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
        return persistedState as AppState;
      },
    }
  )
);
