# 그린케미칼 제조법 관리 시스템

## 기능
- **제조법 (4페이지)**, **제품보증규격**, **품질보증규격** 통합 입력 → 자동 양식화
- 변경 항목 **_굵음+기울임+밑줄_** 표시
- Supabase 연동으로 팀 공유 저장
- 인쇄 시 원본 양식과 동일한 레이아웃 출력

---

## 배포 순서

### 1. Supabase 설정
1. [supabase.com](https://supabase.com) 접속 → 새 프로젝트 생성
2. **SQL Editor** 탭 → `supabase_schema.sql` 파일 내용 전체 붙여넣기 → 실행
3. **Settings → API** 에서 `Project URL`과 `anon public key` 복사

### 2. GitHub 업로드
```bash
git init
git add .
git commit -m "init: 그린케미칼 제조법 관리 시스템"
git remote add origin https://github.com/[본인계정]/[저장소명].git
git push -u origin main
```

### 3. Vercel 배포
1. [vercel.com](https://vercel.com) → **Import Project** → GitHub 저장소 선택
2. **Settings → Environment Variables** 에 아래 두 가지 추가:
   - `REACT_APP_SUPABASE_URL` = Supabase Project URL
   - `REACT_APP_SUPABASE_ANON_KEY` = Supabase anon key
3. **Deploy** 클릭

### 4. 로컬 개발
```bash
cp .env.example .env.local
# .env.local 파일에 실제 Supabase 키 입력

npm install
npm start
```

---

## 파일 구조
```
src/
  App.js              - 메인 레이아웃 (사이드바 + 툴바 + 탭)
  ManufacturingForm.js - 입력 폼 (원료, 규격, 공정조건 등)
  PrintPreview.js     - 출력 미리보기 (6페이지 양식)
  DocumentList.js     - 저장 문서 목록 (Supabase 연동)
  supabaseClient.js   - Supabase 클라이언트 초기화
supabase_schema.sql   - DB 테이블 생성 SQL
```

---

## 양식 구성
| 페이지 | 내용 |
|--------|------|
| 1/4 | 헤더 + Material Balance + 제품규격 |
| 2/4 | 작업개요 공정 1~5 (원료사입~숙성) |
| 3/4 | 작업개요 공정 6~9 (분석~포장) |
| 4/4 | 제조기계/유해물질/포장/저장취급 |
| 제품보증규격 | 공정도 + 분석항목 표 |
| 품질보증규격 | 규격표 + 특기사항 |
