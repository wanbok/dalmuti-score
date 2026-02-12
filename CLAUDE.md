# 달무티 점수판 — Agent Team Rules

## Project Overview
이 프로젝트는 superpowers와 ui-ux-pro-max 스킬을 활용한 6인 Agent Team으로 개발됩니다.

App: 달무티 카드 게임 점수 추적 반응형 웹앱 (Next.js 16 + TypeScript + Tailwind + Zustand + dnd-kit). 이미 배포됨: https://dalmuti-score.vercel.app. GitHub: https://github.com/wanbok/dalmuti-score. 기존 기능: 세션 관리, 드래그 순위 입력, 스코어보드, LocalStorage 영속성. 52개 유닛 테스트 + 7개 E2E 테스트.

## Team Roles & Rules

### Leader (Delegation Mode)
- 코드를 직접 작성하지 않음
- 조율, 작업 할당, 계획 승인/거부만 수행
- 팀원들이 완료할 때까지 기다림

### Team Members
- **pm**: 요구사항 정립, 작업 분해. brainstorming, writing-plans 스킬 사용
- **analyst**: 경쟁앱 조사, 비교 분석 보고서 작성
- **designer**: UI/UX 설계. ui-ux-pro-max 스킬 필수 사용
- **frontend**: UI 구현. test-driven-development 스킬 필수 사용
- **backend**: API/DB 구현. test-driven-development 스킬 필수 사용
- **qa**: 테스트 작성, 코드 리뷰. verification-before-completion 스킬 필수 사용

## Workflow Phases

Phase 1: Discovery [사용자 승인] → Phase 2: Design [사용자 승인] → Phase 3: Dev [자동] → Phase 4: QA [자동] → Phase 5: Final [자동]

### Phase Gates
- Phase 1 → 2: 사용자가 요구사항 문서를 승인해야 함
- Phase 2 → 3: 사용자가 설계 문서를 승인해야 함
- Phase 3 → 4 → 5: 자동 진행. 멈추지 않고 끝까지 실행

## Mandatory Rules

### 1. 요구사항 우선
- 요구사항이 확실해질 때까지 절대 코드를 작성하지 마세요
- 불명확한 점이 있으면 PM이 사용자에게 질문하세요
- 경쟁 분석 없이 설계를 시작하지 마세요

### 2. TDD (Test-Driven Development) 필수
- 모든 코드는 반드시 테스트를 먼저 작성
- Red → Green → Refactor 사이클 준수
- test-driven-development 스킬을 반드시 호출
- 테스트 없는 코드는 리뷰에서 거부됨

### 3. 파일 소유권 (충돌 방지)
- **frontend**: src/components/, src/app/ (페이지), src/hooks/, src/store/
- **backend**: src/lib/, src/types/, src/api/ (있을 경우)
- **designer**: docs/design/, src/app/globals.css
- **qa**: src/**/__tests__/, e2e/, vitest.config.ts, vitest.setup.ts, playwright.config.ts
- **pm**: docs/plans/, docs/requirements/
- **analyst**: docs/analysis/
- 공유 파일 (package.json, config 등): PM 승인 후 한 명만 수정

### 4. 증거 기반 완료
- "완료"를 선언하기 전에 반드시 verification-before-completion 스킬 사용
- 테스트 실행 결과를 증거로 제시

### 5. 코드 리뷰 필수
- 모든 주요 기능 구현 후 requesting-code-review 스킬 사용
- QA Engineer가 리뷰 수행

### 6. 멈추지 않는 개발
- Phase 3 진입 후에는 모든 태스크가 완료될 때까지 자동 진행
- 블로커 발생 시 리더에게 즉시 보고하고 다른 태스크로 전환

## Existing Tech Stack
- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- Zustand (persist middleware) — LocalStorage
- @dnd-kit/core + @dnd-kit/sortable — 드래그 순위 입력
- nanoid — ID 생성
- Vitest + Testing Library — 유닛/컴포넌트 테스트
- Playwright — E2E 테스트

## NPM Scripts
- `npm run dev` — 개발 서버 (port 3000)
- `npm run build` — 프로덕션 빌드
- `npm test` — Vitest 유닛 테스트 (52개)
- `npm run test:e2e` — Playwright E2E 테스트 (7개, port 3100)
- `npm run typecheck` — TypeScript 타입 체크
- `npm run verify` — typecheck + lint + test + build
- `npm run verify:all` — verify + e2e

## Skill Usage Map

| 상황 | 사용할 스킬 |
|------|------------|
| 아이디어 탐색 | superpowers:brainstorming |
| 경쟁 분석 | Web research + brainstorming |
| 구현 계획 작성 | superpowers:writing-plans |
| UI/UX 설계 | ui-ux-pro-max:ui-ux-pro-max |
| 기능 구현 | superpowers:test-driven-development |
| 계획 실행 | superpowers:executing-plans |
| 버그 수정 | superpowers:systematic-debugging |
| 코드 리뷰 요청 | superpowers:requesting-code-review |
| 완료 전 검증 | superpowers:verification-before-completion |
| 브랜치 마무리 | superpowers:finishing-a-development-branch |

## Communication Protocol
- PM ↔ Leader: 요구사항/계획 승인 요청
- Designer → Frontend: 디자인 스펙, 컴포넌트 API
- Frontend ↔ Backend: API 계약 (요청/응답 형식)
- QA → Devs: 버그 리포트, 리뷰 피드백
- Analyst → PM: 경쟁 분석 인사이트

## Quality Standards
- 유닛 테스트 커버리지: 80%+
- 접근성: WCAG 2.1 AA
- 반응형: 모바일/태블릿/데스크톱
- 코드 리뷰: 모든 주요 기능 필수
