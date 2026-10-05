# EEH STUDIO

공식 사이트: https://eehstudio.kr
관리자: https://eeh-studio.home-business-kr.chatgpt.site/admin

## 배포 구조

- main 브랜치 루트의 HTML·JS·이미지·도면을 GitHub Pages로 게시합니다. CNAME은 eehstudio.kr입니다.
- backend/에는 현재 관리자와 API의 재현 가능한 소스, 스키마와 테스트가 있습니다. GitHub Pages는 이 서버 코드를 실행하지 않습니다. 관리자는 Sites의 Worker·D1·R2에서 실행합니다.
- 공개 페이지는 읽기 전용 /api/public/content.js에서 **게시한 내용만** 받아옵니다. 초안·저장 이력·계정 정보는 공개 피드에 포함하지 않습니다. 업로드 이미지 주소는 관리자 서버의 절대 주소로 연결합니다.
- 관리자에서 임시 저장 → 미리보기 → 게시하기 순서로 작업합니다. 게시 후 공식 사이트를 새로 열면 반영됩니다.
- backend/public의 자산과 루트 자산은 같은 원본입니다. backend/site/index.html이 페이지 원본이며, backend에서 node scripts/export-github-pages.mjs <빈 출력 폴더>를 실행하면 Pages 배포본을 다시 만들 수 있습니다.
- 서버의 CMS_ADMIN_EMAIL 및 데이터베이스·파일 저장소는 서버 환경에서 관리합니다. 비밀번호·토큰·운영 DB는 저장소에 넣지 않습니다.

## 검증

backend에서 node tests/cms.mjs를 실행합니다. GitHub Actions의 pages build and deployment에서 커밋별 실제 배포 결과를 확인할 수 있습니다.
