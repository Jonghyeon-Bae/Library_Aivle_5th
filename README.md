# 📚 Library Mini Project 5: 5조의 도서관

> **Aivle 9th, Mini Project 5**
>
> 개인 서재를 디지털화하여 체계적으로 관리할 수 있는 모던 웹 애플리케이션입니다.
> Aladin 책 검색 API를 통해 손쉽게 도서 메타데이터를 불러오고, 내 서재의 도서 보유 현황과 대출 상태를 한눈에 파악할 수 있는 대시보드를 제공합니다.
> 본 프로젝트는 기존 PocketBase(BaaS) 단일 구조에서 **Spring Boot 백엔드 서버와 MySQL(Cloud DB)을 연동한 분리형 아키텍처**로 고도화되었습니다.

---

## ✨ 1. 프로그램 개요 및 주요 기능 (Features)

이 프로젝트는 사용자의 편의성과 직관적인 UX를 최우선으로 고려하여 개발되었습니다.

### 🔍 스마트 도서 검색 및 등록 (Aladin API & AI)

- **Aladin API 연동:** 책 제목, 저자, ISBN을 통해 정확한 도서 정보(표지, 출판사, 저자, 카테고리, 설명 등)를 즉시 불러옵니다. (기존 Kakao API는 Deprecated 처리)
- **AI 검색어 추천:** 사용자의 검색 경험을 극대화하기 위해 AI 기반의 검색어 추천 기능이 제공됩니다.
- **스마트 초기화 UX:** 도서 등록 후 사용자가 다음 책을 바로 검색할 수 있도록 입력창과 검색 결과가 자동으로 초기화됩니다.

### 📖 직관적인 도서 관리 (CRUD & 상태 관리)

- **도서의 생성, 조회, 수정, 삭제(CRUD)**가 완벽하게 지원됩니다.
- 실수로 도서를 삭제하는 것을 방지하기 위해 **삭제 확인 대화창(Confirm Dialog)**을 적용했습니다.
- 추천 도서는 별(★) 아이콘으로 직관적으로 하이라이팅 됩니다.
- **AI 도서 표지 생성:** 도서 수동 등록 시 AI를 통해 도서의 표지 썸네일을 직접 생성하고 저장할 수 있습니다.

### 🔄 대출 상태 관리 토글

- 도서의 `isAvailable` 속성을 토글하여 대출 상태를 실시간으로 변경합니다.
- 로그인한 회원이 대출을 시도하면 대출자로 등록되어 개별 도서 정보 및 마이페이지에서 이력을 확인할 수 있습니다.

### 📊 실시간 통계 대시보드

- Recharts 라이브러리를 활용하여 현재 등록된 도서 중 '대출 가능' / '대출 중' 현황을 파이(Pie) 차트로 시각화하여 대시보드 형태로 제공합니다.

### 🧡 도서 좋아요 & 검색 기록 (신규 🚀)

- **도서 좋아요:** 사용자가 도서를 찜(좋아요)하거나 취소할 수 있으며, 실시간 랭킹 사이드바에서 인기 도서 TOP 10 목록을 제공합니다.
- **검색 기록 관리:** 로그인 유저가 도서를 검색했던 이력을 로깅하고, 최근 5개의 검색어 조회 및 삭제 기능을 제공합니다.

---

## 🛠️ 2. 기술 스택 (Tech Stack)

### 💻 Frontend

- **Framework:** Next.js 16 (App Router)
- **Language & UI:** TypeScript 5, React 19
- **Styling:** Tailwind CSS v4 (PostCSS config 기반)
- **State Management:** TanStack React Query v5
- **Libraries:** Recharts (시각화), Lucide React (아이콘), Axios (HTTP 통신)

### ☕ Backend

- **Framework:** Spring Boot 4.0.6 (Java 17, Gradle)
- **Database & ORM:** MySQL, Spring Data JPA, H2 Database (개발 및 로컬 테스트용)
- **Security & Auth:** Spring Security, `jjwt` (Java JWT API 0.12.6)

### ☁️ Database & Infrastructure

- **Cloud Database:** Aiven Cloud DB (MySQL)
- **Deploy Platform:** Render (Web Service)
- **External APIs:** Aladin Search API, OpenAI DALL-E (AI 표지 생성용 API), OpenAI GPT-4o-mini (AI Review 서비스 API)

---

## 🗄️ 3. 데이터베이스 스키마 및 테이블 구조

백엔드로 사용된 MySQL 데이터베이스의 주요 테이블 구조입니다.

### 👤 `users` (회원 테이블)

| Field Name           | Type                    | Description                 |
| :------------------- | :---------------------- | :-------------------------- |
| **id** (PK)          | bigint (Auto Increment) | 사용자 고유 식별자          |
| **email**            | varchar(255) (Unique)   | 로그인용 이메일 주소        |
| **password**         | varchar(255)            | 암호화된 비밀번호           |
| **name**             | varchar(100)            | 사용자 실명/닉네임          |
| **avatar**           | varchar(500)            | 프로필 이미지 경로 또는 URL |
| **email_visibility** | tinyint(1)              | 이메일 공개 여부            |
| **verified**         | tinyint(1)              | 계정 인증 여부              |
| **created_at**       | datetime                | 생성 일시                   |
| **updated_at**       | datetime                | 수정 일시                   |

### 📚 `books` (도서 테이블)

| Field Name           | Type                    | Description                                  |
| :------------------- | :---------------------- | :------------------------------------------- |
| **id** (PK)          | bigint (Auto Increment) | 도서 고유 식별자                             |
| **user_id** (FK)     | bigint                  | 도서를 등록한 사용자 ID (`users.id`)         |
| **borrower_id** (FK) | bigint (Nullable)       | 현재 책을 대출 중인 사용자 ID (`users.id`)   |
| **title**            | varchar(255)            | 책 제목                                      |
| **author**           | varchar(255)            | 저자                                         |
| **publisher**        | varchar(255)            | 출판사                                       |
| **contents**         | text                    | 도서 설명 및 줄거리 (Aladin API Description) |
| **thumbnail**        | longtext                | 도서 표지 이미지 URL 또는 AI 생성 로컬 경로  |
| **is_available**     | tinyint(1)              | 대출 가능 여부 (1: 대출 가능 / 0: 대출 중)   |
| **bestbook**         | tinyint(1)              | 추천 도서 여부 (★ 배지 노출)                 |
| **like_count**       | int                     | 이 도서의 누적 좋아요 수                     |
| **ai_review**        | text                    | AI가 생성한 도서 리뷰 요약본                 |
| **isbn13**           | varchar(13) (Unique)    | 도서 고유 번호 (중복 등록 방지)              |
| **category**         | varchar(100)            | 도서 카테고리                                |
| **sales**            | int                     | 판매 지수 및 랭킹 산출용 가중치              |
| **created_at**       | datetime                | 도서 등록 일시                               |
| **updated_at**       | datetime                | 도서 정보 수정 일시                          |

### 🧡 `likes` (좋아요 매핑 테이블)

- `book_id`와 `user_id` 복합 Unique 제약 조건이 설정되어 사용자당 한 도서에 한 번만 좋아요가 가능합니다.
  | Field Name | Type | Description |
  | :--- | :--- | :--- |
  | **id** (PK) | bigint (Auto Increment) | 좋아요 레코드 식별자 |
  | **user_id** (FK) | bigint | 좋아요를 누른 사용자 ID (`users.id`) |
  | **book_id** (FK) | bigint | 대상 도서 ID (`books.id`) |
  | **created_at** | datetime | 등록 시간 |

### 🔍 `search_history` (검색 기록 테이블)

| Field Name       | Type                    | Description                          |
| :--------------- | :---------------------- | :----------------------------------- |
| **id** (PK)      | bigint (Auto Increment) | 검색 기록 고유 식별자                |
| **user_id** (FK) | bigint                  | 검색을 수행한 사용자 ID (`users.id`) |
| **keyword**      | varchar(255)            | 입력된 검색 키워드                   |
| **created_at**   | datetime                | 검색 수행 시간                       |

---

## 🚀 4. 시작하기 (Getting Started)

프로젝트를 로컬 컴퓨터에서 정상 실행하기 위한 단계별 개발 서버 구축 방법입니다.

### 4-1. 사전 준비 (Prerequisites)

- **Java:** JDK 17 이상 설치
- **Node.js:** v18 이상 설치
- **MySQL 데이터베이스:** Aiven 클라우드 DB 연동 또는 로컬 환경 MySQL

---

### 4-2. 백엔드 서버 설정 및 실행 (`library_5th_miniproject_backend`)

1. **환경 변수 파일 생성:**
   백엔드 프로젝트 루트 경로에 `.env` 파일을 생성하고 데이터베이스 접속 정보를 설정합니다.

   ```properties
   MYSQL_DRIVER_CLASS_NAME=com.mysql.cj.jdbc.Driver
   MYSQL_URL=jdbc:mysql://[host]:[port]/[database_name]?useSSL=true&requireSSL=true&verifyServerCertificate=false&serverTimezone=Asia/Seoul
   MYSQL_USERNAME=[username]
   MYSQL_PASSWORD=[password]
   ```

2. **애플리케이션 설정 확인 (`src/main/resources/application.yaml`):**
   - 배포 환경에 따라 `application.yaml` 파일 내 `spring.datasource` 구문이 `.env` 파일 값을 바인딩하는지 확인합니다.

3. **백엔드 빌드 및 구동:**
   프로젝트 루트에서 터미널을 열고 다음 명령어를 실행합니다.
   - **Windows (PowerShell):**
     ```powershell
     ./gradlew.bat bootRun
     ```
   - **macOS / Linux:**
     ```bash
     chmod +x gradlew
     ./gradlew bootRun
     ```
   - 백엔드는 기본 포트인 **`http://localhost:8080`**에서 구동됩니다.

---

### 4-3. 프론트엔드 웹 앱 설정 및 실행 (`Library_Aivle_5th`)

1. **의존성 설치:**
   프론트엔드 루트 폴더에서 패키지를 설치합니다.

   ```bash
   npm install
   ```

2. **환경 변수 설정 (`.env.local`):**
   루트 경로에 `.env.local` 또는 `.env` 파일을 생성하여 백엔드 API 주소를 매핑해 줍니다.

   ```properties
   NEXT_PUBLIC_API_URL=http://localhost:8080
   # AI 표지 생성 API 등을 위한 키 설정 (필요시 기입)
   # OPENAI_API_KEY=your_openai_api_key
   ```

3. **개발 서버 구동:**
   ```bash
   npm run dev
   ```

   - 브라우저에서 **`http://localhost:3000`** 주소로 접속합니다.

---

## ☁️ 5. 배포 및 인프라 구성 (Deployment in Render)

본 프로젝트를 클라우드 배포 플랫폼(Render 등)에 지속적 배포(CD)할 경우 아래와 같이 배포 환경을 설정할 수 있습니다.

### 방법 1: Render의 "Secret Files" 기능 활용 (추천)

- Render 웹 서비스의 **Environment** 탭으로 이동합니다.
- **Secret Files** 영역에서 **Add Secret File**을 생성하고 파일명으로 `.env`를 기입합니다.
- 내부 내용으로 로컬 환경의 `.env` 파일과 동일하게 MySQL 호스트, URL, 계정 패스워드 정보를 기입하면 컨테이너 빌드 시 루트 디렉토리에 해당 환경 변수 파일이 자동 생성됩니다.

### 방법 2: "Environment Variables" 개별 등록

- Render 서비스의 **Environment Variables** 메뉴에서 키-밸브 형태로 설정 값을 개별 기입합니다:
  - `MYSQL_DRIVER_CLASS_NAME` = `com.mysql.cj.jdbc.Driver`
  - `MYSQL_URL` = `jdbc:mysql://[host]:[port]/[database]...`
  - `MYSQL_USERNAME` = `avnadmin`
  - `MYSQL_PASSWORD` = `실제 패스워드`
- Spring Boot가 구동되면서 `application.yaml`에 작성된 `${MYSQL_URL}` 플레이스홀더를 통해 시스템 환경 변수를 동적으로 인젝션받게 됩니다.

---

## 📁 6. 프로젝트 디렉토리 구조 (Structure)

전체 프로젝트 구조 및 핵심 파일 현황입니다.

```
📁 library-mini-project4/
├── 📁 Library_Aivle_5th/                    # 프론트엔드 프로젝트 (Next.js)
│   ├── 📁 app/                              # Next.js App Router 디렉토리
│   │   ├── 📁 components/                   # 공통 UI 컴포넌트
│   │   │   ├── AddBookModal.tsx             # 도서 검색 및 등록 모달 (Aladin API)
│   │   │   ├── ManualAddBookModal.tsx       # 수동 도서 추가 모달 (AI 표지 생성 지원)
│   │   │   ├── BookListView.tsx             # 메인 도서 목록 및 정렬/페이징 컴포넌트
│   │   │   ├── BookDetailView.tsx           # 도서 상세 뷰 (대출 토글, AI 리뷰 등)
│   │   │   ├── DashboardChart.tsx           # 도서 통계 파이 차트 (Recharts)
│   │   │   └── RankingSidebar.tsx           # 인기 도서 TOP 10 랭킹 사이드바
│   │   ├── 📁 lib/                          # API 통신 클라이언트 모듈
│   │   │   ├── apiClient.ts                 # Axios 인스턴스 (JWT 자동 삽입 인터셉터)
│   │   │   ├── authApi.ts                   # 로그인, 회원가입 API 통신
│   │   │   ├── bookApi.ts                   # 도서 CRUD 및 어댑터 가공 API
│   │   │   ├── likeApi.ts                   # 도서 좋아요 API
│   │   │   └── stylePresets.ts              # AI 썸네일 테마 프리셋
│   │   ├── 📁 login/                        # 로그인 화면 모달 컴포넌트
│   │   ├── 📁 register/                     # 회원가입 화면 모달 컴포넌트
│   │   ├── 📁 me/                           # 마이페이지 및 내 등록 도서 관리
│   │   ├── 📁 genthum/                      # AI 도서 썸네일 생성 로직
│   │   ├── page.tsx                         # 메인 렌더링 홈 파일
│   │   ├── layout.tsx                       # 전역 레이아웃 및 폰트 세팅
│   │   └── globals.css                      # 전역 CSS 및 Tailwind v4 설정
│   ├── next.config.ts                       # Next.js 서버 설정
│   └── package.json                         # 프론트엔드 패키지 의존성 파일
│
└── 📁 library_5th_miniproject_backend/      # 백엔드 프로젝트 (Spring Boot)
    ├── 📁 src/main/java/com/aivle/bookapp/   # 백엔드 자바 소스 폴더
    │   ├── 📁 controller/                   # REST API 컨트롤러 계층 (Book, Auth, Like 등)
    │   ├── 📁 domain/                       # JPA 엔티티 계층 (Book, User, Like, SearchHistory)
    │   ├── 📁 dto/                          # 데이터 전송 객체 (DTO) 계층
    │   ├── 📁 repository/                   # JPA Repository 인터페이스 계층
    │   ├── 📁 service/                      # 핵심 비즈니스 로직 서비스 계층
    │   └── 📁 security/                     # Spring Security 및 JWT 컴포넌트
    ├── 📁 src/main/resources/
    │   ├── application.yaml                 # 데이터베이스 및 H2/MySQL 프로파일 환경 설정
    │   └── schema.sql                       # 초기 테이블 생성 스키마 SQL (필요시)
    ├── build.gradle                         # 스프링 부트 프로젝트 빌드 및 의존성 환경
    ├── RENDER_DEPLOYMENT.md                 # Render 배포 설정 가이드
    └── PROJECT_MEMORY.md                    # 프로젝트 아키텍처 및 히스토리 보존 문서
```

---

## 💡 7. 향후 고도화 계획 (Future Roadmap)

1. **상세 대출/반납 히스토리:** 단일 Boolean 토글을 넘어, 대출 시작일, 반납 예정일, 과거 대출 이력 등을 트래킹할 수 있는 다중 대출 이력 테이블 추가.
2. **AI 독서 비서 확장:** AI 리뷰 요약 기능 외에도, 사용자의 평소 읽는 카테고리를 분석하여 어울리는 도서를 챗봇 형식으로 자동 추천해 주는 기능 설계.
3. **무한 스크롤(Infinite Scroll) 최적화:** 전체 도서가 증가함에 따라 페이징 버튼 UX 외에도 스크롤을 이용한 리스트 탐색 성능 개선.
4. **리뷰 평점 상세화:** 별점(1~5점) 및 개인 텍스트 코멘트를 남길 수 있는 커뮤니티 형태의 평점/리뷰 스키마 도입.
