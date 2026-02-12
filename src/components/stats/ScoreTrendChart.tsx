"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import { calculateAllPlayerRoundTrends } from "@/lib/statistics";
import type { Session, Player } from "@/types";

const CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "var(--color-chart-6)",
  "var(--color-chart-7)",
  "var(--color-chart-8)",
  "var(--color-chart-9)",
  "var(--color-chart-10)",
  "var(--color-chart-11)",
  "var(--color-chart-12)",
];

interface ScoreTrendChartProps {
  session: Session;
  players: Player[];
}

export function ScoreTrendChart({ session, players }: ScoreTrendChartProps) {
  const playerMap = useMemo(
    () => new Map(players.map((p) => [p.id, p])),
    [players]
  );

  const trends = useMemo(
    () => calculateAllPlayerRoundTrends(session.playerIds, session.rounds),
    [session]
  );

  const chartData = useMemo(() => {
    return session.rounds.map((_, i) => {
      const point: Record<string, string | number | null> = {
        label: `R${i + 1}`,
      };
      for (const [playerId, trendPoints] of trends.entries()) {
        const name = playerMap.get(playerId)?.name ?? playerId;
        const tp = trendPoints.find((t) => t.roundIndex === i);
        point[name] = tp ? tp.cumulativeScore : null;
      }
      return point;
    });
  }, [session.rounds, trends, playerMap]);

  const playerLines = useMemo(() => {
    return session.playerIds.map((id, i) => ({
      dataKey: playerMap.get(id)?.name ?? id,
      color: CHART_COLORS[i % CHART_COLORS.length],
    }));
  }, [session.playerIds, playerMap]);

  const revolutionRounds = useMemo(() => {
    return session.rounds
      .map((r, i) => ({ index: i, revolution: r.revolution }))
      .filter((r) => r.revolution);
  }, [session.rounds]);

  return (
    <ResponsiveContainer width="100%" height={256}>
      <LineChart
        data={chartData}
        margin={{ top: 8, right: 8, bottom: 8, left: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Legend iconType="circle" iconSize={8} />
        {revolutionRounds.map((r) => (
          <ReferenceLine
            key={r.index}
            x={`R${r.index + 1}`}
            strokeDasharray="3 3"
            label="혁명"
          />
        ))}
        {playerLines.map((line) => (
          <Line
            key={line.dataKey}
            dataKey={line.dataKey}
            stroke={line.color}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
            type="monotone"
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
