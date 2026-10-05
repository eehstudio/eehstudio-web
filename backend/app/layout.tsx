import type {Metadata} from 'next';
export const metadata:Metadata={title:'EEH STUDIO',description:'브랜딩 · 오프라인 전시·팝업 · 마케팅 · 디자인'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="ko"><body>{children}</body></html>}
