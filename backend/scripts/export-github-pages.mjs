import {cpSync,mkdirSync,readFileSync,writeFileSync,existsSync,readdirSync} from 'node:fs';
import path from 'node:path';
const root=process.cwd(),out=path.resolve(process.argv[2]||'outputs/github-pages');
if(existsSync(out)&&readdirSync(out).length)throw new Error('Use an empty export directory.');
const backend='https://eeh-studio.home-business-kr.chatgpt.site',site='https://eehstudio.kr';
mkdirSync(out,{recursive:true});cpSync('public',out,{recursive:true});
let html=readFileSync('site/index.html','utf8').replaceAll(backend,site);
html=html.replace('<script src="cms-content.js">',`<script src="${backend}/api/public/content.js"></script><script src="cms-content.js">`).replace('href="/admin"',`href="${backend}/admin" target="_top"`);
writeFileSync(path.join(out,'index.html'),html);
writeFileSync(path.join(out,'CNAME'),'eehstudio.kr\n');
writeFileSync(path.join(out,'.nojekyll'),'');
for(const file of ['robots.txt','sitemap.xml','work/freeze-lab/index.html','work/social-value-market/index.html','work/cses-2025/index.html']){
 const p=path.join(out,file);if(existsSync(p))writeFileSync(p,readFileSync(p,'utf8').replaceAll(backend,site).replaceAll('2026-10-04','2026-10-05'));
}
mkdirSync(path.join(out,'admin'),{recursive:true});
writeFileSync(path.join(out,'admin/index.html'),`<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>EEH STUDIO 관리자</title><meta http-equiv="refresh" content="0;url=${backend}/admin"></head><body><a href="${backend}/admin" target="_top">관리자 로그인으로 이동</a><script>location.replace(${JSON.stringify(backend+'/admin')})</script></body></html>`);
const source=path.join(out,'backend');mkdirSync(source,{recursive:true});
for(const file of ['app','build','components','db','drizzle','hooks','lib','scripts','site','tests','types','vendor','public','package.json','pnpm-lock.yaml','pnpm-workspace.yaml','vite.config.ts','next.config.ts','drizzle.config.ts','postcss.config.mjs','tsconfig.json','cloudflare-env.d.ts','eslint.config.mjs','components.json','.gitignore','.npmrc','README.md']){
 if(existsSync(file))cpSync(file,path.join(source,file),{recursive:true});
}
mkdirSync(path.join(source,'.openai'),{recursive:true});cpSync('.openai/hosting.json',path.join(source,'.openai/hosting.json'));
writeFileSync(path.join(out,'README.md'),`# EEH STUDIO\n\n공식 사이트: ${site}\n관리자: ${backend}/admin\n\n## 배포 구조\n\n- main 브랜치 루트의 HTML·JS·이미지·도면을 GitHub Pages로 게시합니다. CNAME은 eehstudio.kr입니다.\n- backend/에는 현재 관리자와 API의 재현 가능한 소스, 스키마와 테스트가 있습니다. GitHub Pages는 이 서버 코드를 실행하지 않습니다. 관리자는 Sites의 Worker·D1·R2에서 실행합니다.\n- 공개 페이지는 읽기 전용 /api/public/content.js에서 **게시한 내용만** 받아옵니다. 초안·저장 이력·계정 정보는 공개 피드에 포함하지 않습니다. 업로드 이미지 주소는 관리자 서버의 절대 주소로 연결합니다.\n- 관리자에서 임시 저장 → 미리보기 → 게시하기 순서로 작업합니다. 게시 후 공식 사이트를 새로 열면 반영됩니다.\n- backend/public의 자산과 루트 자산은 같은 원본입니다. backend/site/index.html이 페이지 원본이며, backend에서 node scripts/export-github-pages.mjs <빈 출력 폴더>를 실행하면 Pages 배포본을 다시 만들 수 있습니다.\n- 서버의 CMS_ADMIN_EMAIL 및 데이터베이스·파일 저장소는 서버 환경에서 관리합니다. 비밀번호·토큰·운영 DB는 저장소에 넣지 않습니다.\n\n## 검증\n\nbackend에서 node tests/cms.mjs를 실행합니다. GitHub Actions의 pages build and deployment에서 커밋별 실제 배포 결과를 확인할 수 있습니다.\n`);
console.log(JSON.stringify({out,site,admin:backend+'/admin'}));
