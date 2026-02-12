# 달무티 점수판 — Statistics Wireframe

> **Version**: 1.0
> **Author**: Designer
> **Date**: 2026-02-13

---

## 1. Global Statistics Page (`/stats`)

### Layout

```
+------------------------------------------+
| [<] 통계                    [ThemeToggle] |  AppHeader
+------------------------------------------+
|                                          |
| [StatCard]        [StatCard]             |  2-col grid
|  총 세션           총 라운드              |
|    12                47                  |
|                                          |
| [StatCard]        [StatCard]             |
|  참여 선수          평균 라운드/세션       |
|     6                3.9                 |
+------------------------------------------+
|                                          |
| 선수별 성적                    [정렬: ▼] |  Section header
| +--------------------------------------+ |
| | 1. 철수                    12게임    | |  PlayerStatRow
| |    승률 42% [========---]  평균 2.1  | |
| +--------------------------------------+ |
| | 2. 영희                    12게임    | |
| |    승률 33% [======-----]  평균 2.5  | |
| +--------------------------------------+ |
| | 3. 민수                    10게임    | |
| |    승률 20% [====-------]  평균 3.1  | |
| +--------------------------------------+ |
| | ...                                  | |
+------------------------------------------+
|                                          |
| 성적 추이                                |  Section header
| +--------------------------------------+ |
| |                                      | |
| |      📈 Line Chart                  | |  ScoreChart
| |   y: avg rank (inverted)             | |
| |   x: sessions (S1, S2, S3...)       | |
| |   lines: one per player              | |
| |                                      | |
| |   height: 256px                      | |
| +--------------------------------------+ |
|                                          |
+------------------------------------------+
```

### Data Requirements

| Metric | Source | Calculation |
|---|---|---|
| 총 세션 | `sessions.length` | Direct count |
| 총 라운드 | all sessions | `sum(s.rounds.length)` |
| 참여 선수 | all sessions | Unique player IDs |
| 평균 라운드/세션 | derived | totalRounds / totalSessions |
| 선수별 승률 | per player | rounds with rank=1 / total participated rounds |
| 선수별 평균순위 | per player | mean(rank) across all participated rounds |
| 선수별 총게임 | per player | sessions where player participated |
| 성적 추이 | per session | average rank per session per player |

### Sort Options

PlayerStatRow list sortable by:
- 승률 (기본, 내림차순)
- 평균순위 (오름차순)
- 게임수 (내림차순)

---

## 2. Session Statistics Tab

### Location

Within session detail page (`/sessions/[sessionId]`).
Tab bar below AppHeader, above content area.

### Tab Bar

```
+------------------------------------------+
| [스코어보드]  [통계]                      |  Tab bar
+------------------------------------------+
```

- Active tab: `text-primary font-semibold border-b-2 border-primary`
- Inactive tab: `text-text-secondary hover:text-text-primary`
- Tab bar: `flex gap-6 border-b border-border px-4`
- Tab padding: `py-3`

### Statistics Tab Layout

```
+------------------------------------------+
| 라운드별 점수 추이                        |  Section header
| +--------------------------------------+ |
| |                                      | |
| |      📈 Line Chart                  | |  ScoreChart
| |   y: cumulative score (inverted)     | |
| |   x: rounds (R1, R2, R3...)         | |
| |   lines: one per player              | |
| |                                      | |
| |   height: 256px                      | |
| +--------------------------------------+ |
|                                          |
| 세션 요약                                |  Section header
| [StatCard]        [StatCard]             |
|  최다 1위          최저 총점 (승자)       |
|    철수 (3회)        철수 (12점)         |
|                                          |
| [StatCard]        [StatCard]             |
|  최고 총점 (패자)    총 라운드            |
|    민수 (28점)       8라운드             |
+------------------------------------------+
```

### Session Statistics Data

| Metric | Calculation |
|---|---|
| 라운드별 점수 추이 | Per-player cumulative score at each round |
| 최다 1위 | Player with most rank=1 results |
| 최저 총점 (승자) | Player with lowest total (= best) |
| 최고 총점 (패자) | Player with highest total (= worst) |
| 총 라운드 | session.rounds.length |

---

## 3. Navigation Flow

```
/sessions ──[통계 아이콘]──> /stats (글로벌 통계)
    │
    └──[세션 카드]──> /sessions/[id]
                         │
                         ├── [스코어보드 탭] (기존)
                         └── [통계 탭] (NEW)
```

### Entry Points

1. **Sessions list page** → "통계" icon button in AppHeader → `/stats`
2. **Session detail page** → "통계" tab → in-page tab switch (no route change)

---

## 4. Empty States

### Global Stats — No Sessions

```
+------------------------------------------+
| 아직 데이터가 없습니다                     |
| 세션을 생성하고 라운드를 기록하면           |
| 통계를 볼 수 있습니다                     |
|                                          |
|        [첫 세션 만들기]                   |
+------------------------------------------+
```

### Session Stats — No Rounds

```
+------------------------------------------+
| 아직 라운드가 없습니다                     |
| 라운드를 추가하면 통계를 볼 수 있습니다     |
|                                          |
|        [라운드 추가]                      |
+------------------------------------------+
```

### Session Stats — 1 Round Only

Show stats without chart (chart needs 2+ data points).
Display note: "2라운드 이상 진행하면 추이 차트가 표시됩니다"

---

## 5. Responsive Behavior

- **StatCard grid**: `grid grid-cols-2 gap-3` (always 2 columns within max-w-lg)
- **ScoreChart**: Full width, fixed 256px height, responsive via Recharts `ResponsiveContainer`
- **PlayerStatRow**: Full width, stacks naturally
- **Tab bar**: Horizontally scrollable if needed (unlikely with 2 tabs)
- **Chart tooltip**: Positioned to stay within viewport bounds
