# ZoomBoard: High Performance Infinite Canvas

## 🚀 FE Developer SEO & Business Strategy
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

## 🏗️ Architecture Rules

> **Data Flow Rule**: All data fetching and processing logic must be handled at the **Page Level (Top-Level Container)**.
> - Child components should remain "dumb" (Presentational) and only receive data via props.
> - Avoid fetching data inside small leaf components unless absolutely necessary for isolation.
> - This aligns with the Container/Presentational pattern and Next.js recommendations for Server Components.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
