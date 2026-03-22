**한국어** | [English](./README.en.md)

# FigLog

선언적 로깅 파이프라인: **Figma에서 로깅 포인트 마킹 → JSON 스펙 추출 → 빌드 타임 메타데이터 주입 → 런타임 자동 수집**

## 동작 방식

```
DA가 Figma에서 로깅 포인트 마킹 → JSON 스펙 / 시트용 TSV 추출
  → 개발자가 data-log 속성 추가 (또는 AI가 스펙 기반으로 자동 삽입)
  → Vite 플러그인이 빌드 타임에 컴포넌트/폴더 메타데이터 주입
  → useAutoLog 훅이 런타임에 click & view 이벤트 자동 수집
```

## 패키지 구조

| 패키지 | 설명 |
|---|---|
| [`@figlog/schema`](./packages/schema) | 로깅 스펙의 공유 TypeScript 타입 및 JSON 스키마 |
| [`@figlog/vite-plugin`](./packages/vite-plugin) | 빌드 타임에 `data-log-component`, `data-log-folder` 자동 주입하는 Vite 플러그인 |
| [`@figlog/runtime`](./packages/runtime) | 클릭/뷰 이벤트 자동 수집 React 훅 (`useAutoLog`) |
| [`@figlog/figma-plugin`](./packages/figma-plugin) | DA가 Figma에서 로깅 포인트를 마킹하고 스펙을 추출하는 Figma 플러그인 |

## 빠른 시작

### 1. 설치

```bash
pnpm add @figlog/runtime
pnpm add -D @figlog/vite-plugin
```

### 2. Vite 설정

```typescript
// vite.config.ts
import autoLog from '@figlog/vite-plugin'

export default defineConfig({
  plugins: [autoLog({ folderDepth: 1 })],
})
```

### 3. 훅 연결

```tsx
// App.tsx
import { useAutoLog } from '@figlog/runtime'

function App() {
  useAutoLog({
    domainMap: { shop: 'OnlineShop' },
    onLog: (eventType, payload) => {
      myAnalytics.track(eventType, payload)
    },
  })

  return <ProductListScreen />
}
```

### 4. 요소에 로깅 속성 추가

```tsx
<div data-log-screen="productList">
  {/* DA가 정의한 이벤트 (data-log-id 지정) */}
  <Button data-log="click" data-log-id="addToCart">
    담기
  </Button>

  {/* 자동 생성 이벤트명 (id 생략) */}
  <Button data-log="click">상세 보기</Button>

  {/* 뷰 이벤트 - 요소가 뷰포트에 진입하면 발생 */}
  <Banner data-log="view" data-log-id="productCard">
    상품 카드
  </Banner>
</div>
```

## HTML 속성

| 속성 | 주입 주체 | 설명 |
|---|---|---|
| `data-log` | 개발자 | `'click'` 또는 `'view'` |
| `data-log-id` | 개발자 | DA가 정의한 이벤트 ID (생략 시 자동 생성) |
| `data-log-screen` | 개발자 | 화면 식별자 (placement에 사용) |
| `data-log-component` | 빌드 타임 (자동) | 파일명에서 추출 |
| `data-log-folder` | 빌드 타임 (자동) | 폴더명에서 추출 |

## 이벤트명 생성 규칙

| 모드 | 조건 | 패턴 | 예시 |
|---|---|---|---|
| DA 정의 | `data-log-id` 있음 | `{action}{Domain}{Id}` | `clickOnlineShopAddToCart` |
| 자동 생성 | `data-log-id` 없음 | `{folder}.{component}.{action}` | `shop.ProductList.click` |

## Figma 플러그인

DA가 Figma 디자인 파일에서 직접 로깅 포인트를 마킹하고 관리할 수 있는 플러그인입니다.

### 주요 기능

- **이벤트 마킹**: 선택한 레이어에 eventType, eventName, placement 등을 지정
- **편집/삭제**: Result 탭에서 기존 이벤트를 클릭하여 수정 또는 삭제
- **Export JSON**: 전체 이벤트를 JSON 스펙으로 추출 (클립보드 복사)
- **Copy for Sheet**: 탭으로 구분된 TSV 형식으로 복사 — Google Sheets / Excel에 바로 붙여넣기 가능
- **자동 Figma 링크**: 각 노드의 Figma URL을 자동 생성하여 시트에 포함
- **노드 포커스**: Result 탭에서 이벤트를 클릭하면 해당 레이어로 자동 이동

### 시트 복사 컬럼 순서

```
구분 | eventType | placement | eventName | actionType | 설명 | url
```

### 설치

1. Figma → Plugins → Development → Import plugin from manifest
2. `packages/figma-plugin/manifest.json` 선택

### 데이터 저장

로깅 데이터는 Figma 파일의 `pluginData`에 저장됩니다. 별도 서버나 로컬 파일 없이 Figma 파일과 함께 동기화되며, 같은 파일을 열면 누구나 동일한 데이터를 볼 수 있습니다.

## 디자인 파일

[`design/figlog-mockup-uiux.fig`](./design/figlog-mockup-uiux.fig) — Figma Make로 생성한 쇼핑몰 목업 디자인 파일

## 개발

```bash
# 의존성 설치
pnpm install

# 전체 빌드
pnpm build

# 예시 앱 실행
cd examples/react-app && pnpm dev

# Figma 플러그인 빌드
pnpm --filter @figlog/figma-plugin build
```

## 라이선스

MIT
