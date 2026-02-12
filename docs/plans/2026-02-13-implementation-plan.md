# 달무티 점수판 — 구현 계획

**작성일**: 2026-02-13
**작성자**: PM
**상태**: 승인됨 (Phase 2 완료)
**기반 문서**: `docs/plans/2026-02-13-requirements.md`

---

## Task Breakdown — Phase 3 (Development)

### Stream A: Foundation (backend)

**A1. 타입 확장** (#6)
- `src/types/index.ts`: Round에 `hasRevolution?`, `taxExempt?` 추가
- 통계 타입: `PlayerStatistics`, `SessionPlayerStats`, `HeadToHeadStats`, `ScoreTrendData`, `ThemePreference`

**A2. 통계 계산 엔진** (#7, blocked by #6)
- 새 파일: `src/lib/statistics.ts`
- TDD: `src/lib/__tests__/statistics.test.ts` 먼저 작성
- 함수: `calculatePlayerStatistics`, `calculateSessionStatistics`, `calculateHeadToHeadStats`, `buildScoreTrendData`
- 기존 `calculateScore(rank)` 재사용 (`src/lib/scoring.ts:3`)

**A3. 스토어 확장** (#8, blocked by #6)
- `src/store/index.ts`: theme 상태 + 혁명 로직
- TDD: `src/store/__tests__/store.test.ts` 확장

### Stream B: Design System (designer)

**B1. 다크 모드 CSS 변수** (#9)
- `src/app/globals.css`: `:root` 확장 + `.dark` 블록
- WCAG AA 명암비 보장

**B2. 통계 페이지 레이아웃 설계** (#10)
- 와이어프레임 + 차트 색상 팔레트 + 컴포넌트 스펙
- `docs/design/`에 저장

### Stream C: Theme Infrastructure (frontend)

**C1. ThemeProvider** (#11, blocked by #9)
- `src/components/theme/ThemeProvider.tsx`
- `layout.tsx`에 래핑

**C2. ThemeToggle** (#12, blocked by #11)
- `src/components/theme/ThemeToggle.tsx`

**C3. 다크 모드 마이그레이션** (#13, blocked by #11)
- 11개 기존 컴포넌트 하드코딩 색상 → CSS 변수

### Stream D: Statistics UI (frontend)

**D1. Recharts 설치** (#14)
- `npm install recharts`

**D2. 글로벌 통계 페이지** (#15, blocked by #7, #10)
- `src/app/stats/page.tsx`
- `src/components/stats/StatsOverview.tsx`
- `src/components/stats/PlayerStatsCard.tsx`
- `src/components/stats/HeadToHeadComparison.tsx`

**D3. 세션 내 통계 탭 + 차트** (#16, blocked by #7, #10, #14)
- `src/app/sessions/[sessionId]/page.tsx` 수정 (탭)
- `src/components/stats/SessionStatsTab.tsx`
- `src/components/stats/ScoreTrendChart.tsx` (Recharts, 동적 임포트)

**D4. 네비게이션 업데이트** (#19, blocked by #15)
- 세션 목록 + 헤더에 통계 링크

### Stream E: Revolution UI (frontend)

**E1. 혁명 체크박스 + 세금 면제 배너** (#17, blocked by #8)
- `RankingList.tsx`, `new/page.tsx`, `edit/page.tsx`

**E2. 라운드 이력 배지** (#18, blocked by #8)
- 세션 상세 페이지 라운드 이력에 혁명/세금면제 Badge

### Stream F: QA

**F1. 통계 테스트 검증** (#20, blocked by #7)
**F2. 혁명 로직 테스트 검증** (#21, blocked by #8)
**F3. 코드 리뷰 + 접근성** (#22, blocked by #13, #16, #18)
**F4. E2E 테스트** (#23, blocked by #22)
**F5. 최종 검증** (#24, blocked by #23)

---

## Task Dependencies (DAG)

```
A1(#6) ─┬─→ A2(#7) ──→ D2(#15), D3(#16), F1(#20)
         └─→ A3(#8) ──→ E1(#17), E2(#18), F2(#21)
B1(#9) ──→ C1(#11) ──→ C2(#12), C3(#13)
B2(#10) ──→ D2(#15), D3(#16)
D1(#14) ──→ D3(#16)
D2(#15) ──→ D4(#19)
C3(#13) + D3(#16) + E2(#18) ──→ F3(#22) ──→ F4(#23) ──→ F5(#24)
```

## Parallel Execution Plan

```
시간 →

backend:   [A1 #6] → [A2 #7] → [A3 #8] → (지원)
designer:  [B1 #9] → [B2 #10] → (리뷰)
frontend:  [D1 #14] → [C1 #11] → [C2 #12] → [C3 #13] → [D2 #15] → [D3 #16] → [E1 #17] → [E2 #18] → [D4 #19]
qa:        (대기) → [F1 #20] → [F2 #21] → [F3 #22] → [F4 #23] → [F5 #24]
```

## Critical Files

| 파일 | 변경 | 소유자 |
|------|------|--------|
| `src/types/index.ts` | Round 확장 + 통계 타입 | backend |
| `src/lib/statistics.ts` | **신규** — 통계 엔진 | backend |
| `src/store/index.ts` | theme + 혁명 로직 | backend |
| `src/app/globals.css` | 다크 모드 CSS | designer |
| `src/app/stats/page.tsx` | **신규** — 통계 페이지 | frontend |
| `src/app/sessions/[sessionId]/page.tsx` | 탭 추가 | frontend |
| `src/components/stats/*` | **신규** — 통계 컴포넌트 | frontend |
| `src/components/theme/*` | **신규** — 테마 컴포넌트 | frontend |
| `src/components/round/RankingList.tsx` | 혁명 체크박스 | frontend |

## Reuse Existing Code

- `src/lib/scoring.ts:calculateScore()` — 통계 계산 재사용
- `src/hooks/useHydration.ts` — ThemeProvider 재사용
- `src/components/ui/Badge.tsx` — 혁명/세금면제 배지
- `src/components/ui/Checkbox.tsx` — 혁명 체크박스

## Estimated Test Count

| 영역 | 유닛 | E2E |
|------|------|-----|
| 통계 계산 | ~20 | - |
| 스토어 확장 | ~15 | - |
| 통계 컴포넌트 | ~25 | - |
| 테마 컴포넌트 | ~8 | - |
| 혁명 UI | ~6 | - |
| 다크 모드 | ~6 | - |
| E2E | - | ~10 |
| **합계 (신규)** | **~80** | **~10** |
| **전체 (기존+신규)** | **~132** | **~17** |

## Verification

1. `npm run typecheck` — 타입 에러 없음
2. `npm run lint` — 린트 통과
3. `npm test` — 기존 52개 + 신규 ~80개 통과
4. `npm run build` — 프로덕션 빌드 성공
5. `npm run test:e2e` — 기존 7개 + 신규 ~10개 통과
6. `npm run verify:all` — 전체 검증 통과
7. 수동 검증: 다크 모드, 혁명/세금, 통계 정확성, 반응형, LocalStorage 호환성
