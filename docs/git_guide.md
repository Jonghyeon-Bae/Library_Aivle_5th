# 🌿 5조 도서관 Git 협업 및 안티그래비티 개발 가이드

이 문서는 프로젝트 개발 시 일관성 있는 브랜치 관리, 깨끗한 커밋 히스토리 보존 방법 및 안티그래비티 IDE에서 깃허브 계정을 원활하게 연동하는 방법을 요약한 가이드라인입니다.

---

## 1. Git 브랜치 및 배포 관리 전략

### 1) 단일 배포 브랜치 전략 (Single Branch Deployment)
* `Deploy` 브랜치를 따로 나누어 코드를 다르게 관리하는 대신, **`main` 단일 브랜치**로 소스 코드를 통일합니다.
* 개발(Local) 환경과 배포(Production/Render) 환경의 분리는 코드 변경이 아닌 **환경 변수**와 **스프링 부트 프로파일(`local` / `prod`)** 설정을 사용해 스위칭합니다.
  * **Local:** H2 DB 연동, `NEXT_PUBLIC_API_URL=http://localhost:8080`
  * **Prod:** Aiven MySQL DB 연동, `NEXT_PUBLIC_API_URL=https://[배포주소]`

### 2) 기능별 브랜치 라이프사이클 (Feature Branch Lifecycle)
고정 브랜치(예: `wonje`)를 두고 계속 커밋하면 충돌과 코드 누적 문제가 발생하므로, **"1개 기능 = 1개 브랜치"** 원칙을 따릅니다.
1. `main` 브랜치를 가장 최신 상태로 pull 받습니다.
2. 새 기능 단위 브랜치를 만듭니다. (예: `wonje/feature-login`, `wonje/fix-book-layout`)
3. 개발이 완료되면 깃허브 원격지로 push합니다.
4. **GitHub 웹 사이트**에서 `main` 브랜치를 타겟으로 **Pull Request(PR)**를 생성합니다.
5. PM(검수자)이 코드 리뷰 및 승인 후 **Squash and Merge**로 병합합니다.
6. 머지 완료 즉시 사용한 기능 브랜치는 **원격 및 로컬 저장소 모두에서 즉시 삭제**합니다.

### 3) 깃 그래프 최적화: Squash and Merge
* GitHub PR 승인 시 일반 머지 대신 **`Squash and merge`**를 사용해 병합합니다.
* 기능 브랜치에서 팀원들이 작성한 자잘한 에러/오타 수정 커밋들이 `main`에 병합될 때 **단 하나의 명확한 작업 커밋(예: `Feat: 로그인 기능 구현 (#12)`)**으로 압축되어 붙습니다.
* 깃 그래프가 깨끗한 **일직선(Linear History)**으로 유지되어 코드 추적과 롤백이 쉬워집니다.

---

## 2. 안티그래비티(Antigravity) IDE 깃허브 로그인 이슈 해결

안티그래비티 환경에서 계정 연동이나 웹 리다이렉션 오류로 로그인이 차단되는 현상은 아래 두 가지 방법으로 완벽히 우회할 수 있습니다.

### 방법 1: GitHub CLI(`gh`) 설치 및 인증 연동 (권장)
현재 컴퓨터에 `gh` 커맨드가 설치되지 않아 오류가 발생하는 경우, 윈도우 패키지 매니저를 통해 명령 한 줄로 설치할 수 있습니다.

1. **GitHub CLI 설치:** 안티그래비티 터미널을 열고 아래 명령어를 입력합니다.
   ```powershell
   winget install GitHub.cli
   ```
2. **터미널 재실행:** 설치가 완료되면 안티그래비티 에디터를 완전히 종료한 후 다시 켜거나, 터미널 창을 새로 열어줍니다.
3. **인증 시작:** 터미널에 아래 명령어를 칩니다.
   ```powershell
   gh auth login
   ```
4. **터미널 대화형 가이드 설정:**
   * *What account do you want to log into?* ➡️ **GitHub.com**
   * *What is your preferred protocol for Git operations?* ➡️ **HTTPS**
   * *Authenticate Git with your GitHub credentials?* ➡️ **Yes**
   * *How would you like to authenticate GitHub CLI?* ➡️ **Login with a web browser**
5. 터미널 화면에 나타난 **8자리 일회용 보안 코드(One-time code)**를 복사하고 엔터를 누르면 웹 브라우저 로그인 창이 열립니다. 코드를 브라우저에 입력하고 승인하면 에디터 전체에 깃허브 계정이 동기화됩니다.

### 방법 2: 깃허브 개인 액세스 토큰 (Personal Access Token - PAT) 사용
웹 브라우저 로그인 연동 자체에 보안 충돌이 나는 경우, 깃허브 토큰 값을 패스워드로 대체해 등록합니다.

1. **토큰 생성:** GitHub 홈페이지 우측 프로필 클릭 ➡️ `Settings` ➡️ `Developer settings` ➡️ `Personal access tokens (classic)` ➡️ `Generate new token (classic)` 선택.
2. **권한 체크:** 토큰 이름(Note)을 적고, 권한 설정 범위에서 **`repo` (전체 레포지토리 관리 권한)**를 반드시 체크한 뒤 생성합니다.
3. **토큰 값 복사:** 발행된 `ghp_...`로 시작하는 긴 문자열을 복사합니다.
4. **안티그래비티 로그인:** 안티그래비티 터미널이나 깃 GUI에서 깃허브 푸시 시 사용자 ID와 Password 입력을 요구하는 팝업이 뜨면, **비밀번호 입력란에 실제 패스워드 대신 복사한 토큰 값(`ghp_...`)을 입력**합니다.
