# 줌보드 (ZoomBoard): 고성능 무한 캔버스

## 🚀 프론트엔드 개발자 SEO & 비즈니스 전략
본 프로젝트는 단순한 개발 이상의 수익 창출 가치를 지향합니다.

### 1. 수익 창출 모델 (Business Models)
- **정보형 블로그/매거진**: 특정 기술 트렌드, 가전/IT 기기 리뷰 등을 통해 애드센스 수익 창출.
- **Web Tool 서비스**: 단위 변환기, 이미지 압축기 등 유틸리티 제공을 통한 지속적 트래픽 유도.
- **큐레이션 서비스**: AI 도구 모음, 채용 정보 등 가공된 데이터를 통한 니즈 해결.
- **제휴 마케팅 (Affiliate)**: 제품 추천을 통한 수수료 획득 (쿠팡 파트너스 등).

### 2. 핵심 SEO 전략
- **프레임워크**: Next.js (SSR/SSG) 기반 검색 최적화.
- **성능 (Core Web Vitals)**: LCP < 2.5s, FID < 100ms, CLS 최적화.
- **구조화 데이터**: JSON-LD를 통한 리치 스니펫 노출 최적화.
- **CSR 및 FOUC 방지**: 쿠키 기반 상태 관리와 SSR 하이드레이션을 통한 깜빡임 없는 UX 제공.

## 🚀 성능 및 아키텍처 최적화 (Optimization & Architecture)

본 프로젝트는 단순한 기능 구현을 넘어, 극한의 성능과 사용자 경험을 위해 다음과 같은 고급 패턴을 적용했습니다.

### 1. FOUC (Flash Of Unstyled Content) 완벽 방지
- **문제**: 클라이언트 컴포넌트(`Sidebar`)의 초기 상태가 로컬 스토리지에만 있을 경우, 서버 렌더링(SSR) 결과와 일치하지 않아 페이지 로드 시 UI가 깜빡이거나 덜컹거리는 현상 발생.
- **해결**:
  - UI 상태(사이드바 열림 여부 등)를 **쿠키(Cookie)** 에 동기화.
  - Next.js 서버 컴포넌트(`RuleLayout`)에서 쿠키를 읽어 초기 상태(`initialIsOpen`)를 결정.
  - 이를 통해 HTML이 브라우저에 도착하는 순간부터 정확한 UI 상태를 렌더링.

### 2. 즉각적인 스토어 하이드레이션 (Instant Store Hydration)
- **문제**: `useEffect`로 클라이언트에서 데이터를 가져오면 첫 화면이 빈 상태로 보였다가 데이터가 로드되는 지연(Layout Shift) 발생.
- **해결**:
  - **Server Side Fetching**: `layout.tsx` 등 서버 컴포넌트에서 초기 데이터(Notes 등)를 미리 가져옴.
  - **Hydration Initializer**: `NoteInitializer` 컴포넌트를 통해 가져온 데이터를 Zustand 스토어에 **초기 렌더링 즉시 주입**.
  - **결과**: "로딩 중..." 화면 없이 즉시 완성된 콘텐츠 표시.

### 3. SEO 및 접근성 심화
- **정교한 메타데이터**: 페이지별 동적 `title`, `description`, OpenGraph 태그 자동 생성.
- **시맨틱 구조**: `main`, `aside`, `section` 등 의미론적 태그 사용으로 스크린 리더 및 검색 엔진 친화적 구조.
- **구조화 데이터 (JSON-LD)**: `WebApplication`, `BreadcrumbList` 등의 스키마 마크업 적용.

> **데이터 흐름 규칙 (Data Flow Rule)**: 모든 데이터 가져오기 및 처리 로직은 반드시 **페이지 레벨 (Top-Level Container)** 에서 처리되어야 합니다.
> - 자식 컴포넌트는 "단순한(dumb)" 상태(프레젠테이션 전용)를 유지하며, props를 통해서만 데이터를 받아야 합니다.
> - 격리가 절대적으로 필요한 경우가 아니라면 작은 말단(leaf) 컴포넌트 내부에서 데이터를 가져오지 마십시오.
> - 이는 Container/Presentational 패턴 및 Next.js의 서버 컴포넌트 권장 사항과 일치합니다.

## 시작하기 (Getting Started)

먼저, 개발 서버를 실행합니다:

```bash
npm run dev
# 또는
yarn dev
# 또는
pnpm dev
# 또는
bun dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 결과를 확인하세요.

`app/page.tsx` 파일을 수정하여 페이지 편집을 시작할 수 있습니다. 파일을 수정하면 페이지가 자동으로 업데이트됩니다.

이 프로젝트는 [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts)를 사용하여 Vercel의 새로운 글꼴 제품군인 [Geist](https://vercel.com/font)를 자동으로 최적화하고 로드합니다.

## 더 알아보기 (Learn More)

Next.js에 대해 더 알아보려면 다음 리소스를 참고하세요:

- [Next.js 문서](https://nextjs.org/docs) - Next.js의 기능과 API에 대해 알아보세요.
- [Learn Next.js](https://nextjs.org/learn) - 인터랙티브한 Next.js 튜토리얼입니다.

[Next.js GitHub 저장소](https://github.com/vercel/next.js)를 확인하실 수 있으며, 피드백과 기여는 언제나 환영합니다!

## Vercel 배포 (Deploy on Vercel)

Next.js 앱을 배포하는 가장 쉬운 방법은 Next.js 제작자가 만든 [Vercel 플랫폼](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)을 사용하는 것입니다.

자세한 내용은 [Next.js 배포 문서](https://nextjs.org/docs/app/building-your-application/deploying)를 확인하세요.
