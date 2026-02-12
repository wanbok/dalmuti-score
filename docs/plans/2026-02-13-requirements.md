# 달무티 점수판 — 요구사항 문서

**작성일**: 2026-02-13
**작성자**: PM
**상태**: 승인됨 (Phase 1 완료)

## Context

달무티 점수판 앱(https://dalmuti-score.vercel.app)은 이미 배포된 상태로, 기본 기능(세션/라운드/플레이어 CRUD, 드래그 순위 입력, 스코어보드, LocalStorage 영속성)이 완성되어 있다. 사용자가 다음 3가지 개선을 요청했다.

**경쟁 분석 결과**: 6개 경쟁앱 분석 완료 (BG Stats, Scored, Score Anything, KeepTheScore, Scory, Keep Score). 우리의 독보적 강점은 순위 드래그앤드롭 입력 + 달무티 전용 점수 로직. 혁명/세금 규칙은 세계적으로 유일한 차별화 기회.

---

## Feature 1: 플레이어 통계 대시보드 (최우선)

### 1.1 글로벌 통계 페이지 (`/stats`)

새 페이지. 모든 세션을 통합한 플레이어 통계.

**종합 순위 탭:**
- 테이블: 순위, 이름, 참여 라운드 수, 승률(1등 비율), 평균 순위, 1등 횟수, 꼴등 횟수
- 컬럼 정렬 가능 (클라이언트)
- 빈 상태: 세션이 없을 때 안내 메시지

**라이벌 비교 탭:**
- 플레이어 2명 선택 (드롭다운)
- Head-to-head: 같은 라운드에서 누가 더 높은 순위였는지 통계
- 승/패/무 카운트, 승률 비교 바 차트

### 1.2 세션 내 통계 탭

기존 세션 상세 페이지(`/sessions/[sessionId]`)에 탭 추가: **점수판 | 라운드 이력 | 통계**

**세션 통계 탭 내용:**
- 해당 세션 플레이어별 성적 요약 (평균 순위, 1등 횟수, 총점)
- 점수 추이 라인 차트: X축 = 라운드 번호, Y축 = 누적 점수, 플레이어별 라인
- 혁명 발생 라운드 표시 (차트에 마커)

### 1.3 차트 라이브러리

**Recharts** 사용 (React 선언형 컴포넌트, 트리셰이킹 가능, TypeScript 지원).
- 동적 임포트로 번들 분할

### 1.4 통계 계산 로직

순수 함수로 구현. 기존 `calculateScore(rank)` 재사용.

```
calculatePlayerStatistics(playerId, sessions) → PlayerStatistics
calculateSessionStatistics(session) → SessionPlayerStats[]
calculateHeadToHeadStats(p1Id, p2Id, sessions) → HeadToHeadStats
buildScoreTrendData(session) → ScoreTrendData[]
```

### 1.5 새로운 타입

```typescript
interface PlayerStatistics {
  playerId: string
  totalRounds: number
  totalSessions: number
  averageRank: number
  firstPlaceCount: number
  lastPlaceCount: number
  winRate: number          // firstPlaceCount / totalRounds
  revolutionCount: number
}

interface SessionPlayerStats {
  playerId: string
  rounds: number
  firstPlace: number
  lastPlace: number
  averageRank: number
  totalScore: number
}

interface HeadToHeadStats {
  player1Id: string
  player2Id: string
  player1Wins: number
  player2Wins: number
  draws: number
  totalFaceOffs: number
}

interface ScoreTrendData {
  roundIndex: number
  [playerId: string]: number  // 플레이어별 누적 점수
}
```

---

## Feature 2: 다크 모드

### 2.1 CSS 변수 확장

현재 `:root`에 `--background`, `--foreground`만 있음. 확장 필요:

```css
:root {
  --background: #f9fafb;
  --foreground: #171717;
  --card-bg: #ffffff;
  --card-border: #e5e7eb;
  --muted: #6b7280;
  --accent: #2563eb;
}

.dark {
  --background: #0a0a0a;
  --foreground: #ededed;
  --card-bg: #1a1a1a;
  --card-border: #262626;
  --muted: #9ca3af;
  --accent: #3b82f6;
}
```

### 2.2 테마 적용

- 클라이언트 컴포넌트 ThemeProvider
- Zustand 스토어에서 `theme` 읽기 (`'light' | 'dark' | 'system'`)
- `<html>` 요소에 `class="dark"` 토글
- 시스템 테마 변경 감지 (`matchMedia`)

### 2.3 테마 토글 UI

- 세션 목록 페이지 AppHeader의 action 슬롯에 배치
- 아이콘 기반: 해/달 아이콘
- 3단 순환: light → dark → system

### 2.4 스토어 확장

```typescript
theme: ThemePreference  // 초기값 'system'
setTheme: (theme: ThemePreference) => void
```

### 2.5 기존 컴포넌트 다크 모드 대응

하드코딩된 색상을 CSS 변수로 교체 (11개 컴포넌트).

---

## Feature 3: 혁명 규칙 + 세금 반영

### 3.1 데이터 모델 변경

`Round` 인터페이스에 옵셔널 필드 추가 (하위 호환):

```typescript
interface Round {
  // ... 기존 필드 ...
  hasRevolution?: boolean   // 이 라운드에서 혁명 발생
  taxExempt?: boolean       // 이전 라운드 혁명으로 세금 면제
}
```

### 3.2 스토어 로직 변경

- `addRound`: 이전 라운드 `hasRevolution` → 새 라운드 `taxExempt = true`
- `updateRound`: 혁명 변경 시 다음 라운드 `taxExempt` 재계산
- `deleteRound`: 삭제 후 후속 라운드 `taxExempt` 재계산

### 3.3 UI 변경

- 라운드 입력: "혁명 발생" Checkbox + 세금 면제 배너
- 라운드 이력: 혁명 Badge, 세금 면제 Badge
- 통계: 혁명 횟수/비율

---

## Out of Scope (다음 반복)

- 달무티 역할명 (대달무티/소달무티/대빈민/소빈민) — Analyst가 Tier 1 추천했으나 사용자가 연기 결정
- 클라우드 동기화, 내보내기/가져오기
- PWA, 결과 공유
- 타이머, 커스텀 규칙

---

## 비기능 요구사항

- TDD 필수: 모든 코드에 테스트 먼저 작성
- WCAG 2.1 AA: 명암비 4.5:1+, 키보드 내비게이션, ARIA
- 반응형: 모바일/태블릿/데스크톱
- 하위 호환: 기존 LocalStorage 데이터 손실 없음
- 번들 최적화: Recharts 동적 임포트
