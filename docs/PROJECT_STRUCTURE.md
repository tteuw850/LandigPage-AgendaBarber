# Agenda Barber - Estrutura do frontend

Landing page React, TypeScript e Vite.

src/
  components/    Componentes de interface, celular e transicoes
  pages/         LandingPage e futuras paginas
  hooks/         Hooks customizados (reservado)
  services/      Integracoes com API (reservado)
  contexts/      Contextos React (reservado)
  utils/         Funcoes auxiliares (reservado)
  assets/
    images/      Imagens 3D e mockups usados pelo site
    videos/      Videos MP4 e WebM
    icons/       Arquivos SVG
    references/  Imagens de referencia nao importadas
  styles/        Estilos CSS por pagina, componente e globais
  App.tsx        Entrada da pagina
  main.tsx       Renderizacao React

tests/qa/          Historico de testes visuais com Edge
scripts/media/     Ferramentas de conversao de video
archive/legacy-src/     Backups e rascunhos historicos
archive/legacy-scripts/ Scripts codificados antigos
mockups-apk/       Mockups externos preservados na raiz
public/            Recursos publicos do Vite

Comandos: npm run dev, npm run build, npm run lint.
Os testes visuais em tests/qa precisam do Vite ativo em localhost:5173.
Exemplo: node tests/qa/screen23-phone-sticky-exit-qa.cjs

Backup externo completo: D:\AgendaBarberLadingPage-backup-before-organize-20261109

Pastas reservadas ficam vazias com .gitkeep ate haver implementacoes reais.


Nova secao preta: src/components/BlackFeatureSection.tsx; comportamento de scroll em src/hooks/useBlackChapterScroll.ts; estilo em src/styles/black-chapter.css.

FAQ: src/components/FaqSection.tsx, src/styles/faq-section.css e desenho topografico em src/assets/images/faq-contours.svg.

APK oficial Android 1.0.0: public/downloads/Agenda-Barber-1.0.0.apk (SHA-256: ad717bb8aee8ce80b4ab4b10c3f84ebcdb794a0fe023a12b2f67fc42be83ae66). Os dois botoes Baixar APP usam o mesmo arquivo estatico.

Rodape institucional: src/components/SiteFooter.tsx, estilos em src/styles/site-footer.css. Mantem links oficiais de APK e WhatsApp.
