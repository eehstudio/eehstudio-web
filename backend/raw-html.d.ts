// The Vite build imports these HTML templates as strings.
declare module '*.html?raw' {
  const html: string;
  export default html;
}
