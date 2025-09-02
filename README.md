# 익명 커뮤니티 앱

Next.js와 Supabase를 사용한 익명 커뮤니티 애플리케이션입니다.

## 기능

- 익명 게시글 작성 및 조회
- 게시글 좋아요/싫어요 투표
- 자동 생성되는 익명 닉네임
- 실시간 게시글 목록
- 반응형 디자인 (다크모드 지원)

## 설치 및 실행

1. 의존성 설치:
```bash
npm install
```

2. 환경 변수 설정:
`.env.local` 파일의 환경 변수들을 실제 Supabase 프로젝트 정보로 업데이트 완료

3. Supabase 데이터베이스 설정:
`supabase/schema.sql` 파일의 SQL을 Supabase 대시보드에서 실행하여 테이블을 생성하세요.

4. 개발 서버 실행:
```bash
npm run dev
```

5. 브라우저에서 http://localhost:3000 접속

## 프로젝트 구조

```
src/
├── app/
│   ├── api/posts/          # 게시글 API 라우트
│   └── page.tsx            # 메인 페이지
├── components/
│   ├── CreatePost.tsx      # 게시글 작성 컴포넌트
│   └── PostList.tsx        # 게시글 목록 컴포넌트
└── lib/
    ├── auth.ts             # 익명 인증 로직
    ├── supabase.ts         # Supabase 클라이언트
    └── supabase-server.ts  # Supabase 서버 클라이언트
```

## 데이터베이스 스키마

- `posts`: 게시글 정보 (제목, 내용, 익명 ID, 좋아요/싫어요 수)
- `comments`: 댓글 정보 (추후 확장 가능)

## 기술 스택

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: 로컬 스토리지 기반 익명 ID

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
