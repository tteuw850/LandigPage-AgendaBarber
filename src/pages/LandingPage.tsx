import DiagonalPhone from '../components/DiagonalPhone';
import BlackFeatureSection from '../components/BlackFeatureSection';
import FaqSection from '../components/FaqSection';
import SiteFooter from '../components/SiteFooter';
import { useEffect, useRef, useState } from 'react';
import '../styles/landing.css';
import logo from '../assets/images/agenda_barber_logo_square_transparent.png';

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [featureTab, setFeatureTab] = useState<'agendamento' | 'financeiro'>('agendamento');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onOutsideClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('pointerdown', onOutsideClick);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('pointerdown', onOutsideClick);
      document.removeEventListener('keydown', onEscape);
    };
  }, []);

  return (
    <main className="landing" id="home" aria-label="Agenda Barber">
      <div className="landing-first-screen">
      <header className="brand-header">
        <div className="brand">
          <img className="brand-logo" src={logo} alt="Logo AB" />
          <div className="brand-name">
            <span className="agenda">Agenda</span><span className="barber">Barber</span>
          </div>
        </div>
        <nav className="main-nav" aria-label="Navegação principal">
          <a className="nav-link nav-home" href="#home">Home</a>
          <div className="nav-dropdown" ref={menuRef}>
            <button
              className="nav-link nav-dropdown-button"
              type="button"
              aria-expanded={menuOpen}
              aria-controls="funcionalidades-menu"
              onClick={() => setMenuOpen((value) => !value)}
            >
              Funcionalidades
              <svg className={menuOpen ? 'chevron is-open' : 'chevron'} width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {menuOpen && (
              <div className="nav-dropdown-menu" id="funcionalidades-menu">
                <a href="#agendamentos" onClick={() => setMenuOpen(false)}>Agendamentos</a>
                <a href="#financas" onClick={() => setMenuOpen(false)}>Finanças</a>
              </div>
            )}
          </div>
          <a className="nav-link" href="#solucoes">Soluções</a>
          <a className="nav-link" href="#perguntas">Perguntas</a>
        </nav>
        <div className="header-actions" aria-label="Acoes do aplicativo">
          <a className="cta-button cta-download" href="/downloads/Agenda-Barber-1.0.0.apk" download="Agenda-Barber-1.0.0.apk">Baixar APP</a>
          <a className="cta-button cta-signup" href="https://wa.me/5511946464236?text=Ol%C3%A1%2C%20gostaria%20de%20adquirir%20uma%20conta%20no%20Agenda%20Barber." target="_blank" rel="noopener noreferrer">Criar Conta</a>
        </div>
      </header>
      <section className="hero-section" aria-labelledby="hero-title">
        <div className="hero-content">
          <h1 id="hero-title" className="hero-title">
            A <span className="hero-highlight">Agenda</span> da sua barbearia na palma de sua mão
          </h1>
          <p className="hero-subtitle">
            Menos tempo organizando horários. Mais tempo cuidando dos seus clientes e fazendo seu negócio crescer.
          </p>
          <div className="hero-actions">
            <a className="cta-button cta-download" href="/downloads/Agenda-Barber-1.0.0.apk" download="Agenda-Barber-1.0.0.apk">Baixar APP</a>
            <a className="cta-button cta-signup" href="https://wa.me/5511946464236?text=Ol%C3%A1%2C%20gostaria%20de%20adquirir%20uma%20conta%20no%20Agenda%20Barber." target="_blank" rel="noopener noreferrer">Criar Conta</a>
          </div>
          <div className="hero-phone-wrap" aria-hidden="true">
            <div className="hero-phone-anchor" />
          </div>
        </div>
      </section>
      </div>
      <section className="next-section" id="proximo-bloco" aria-label="Destaque das funcionalidades do Agenda Barber">
        <div className="feature-showcase">
          <div className="feature-copy">
            <div className="feature-scenes">
              <div className="feature-scene feature-scene--one">
            <p className="feature-count"><strong>01</strong><span>/ 03</span><span>· 00—03 SEGUNDOS</span></p>
            <span className="feature-time">00:00</span>
            <h2 className="feature-title">Sua <em>agenda.</em><span>Sempre em ordem.</span></h2>
            <p className="feature-description">
              Visualize seus horários, organize cada atendimento e tenha o controle da sua barbearia
              em poucos toques. Menos tempo planejando, mais tempo atendendo.
            </p>
              </div>
              <div className="feature-scene feature-scene--two">
                <p className="feature-count"><strong>02</strong><span>/ 03</span><span>· 03—05 SEGUNDOS</span></p>
                <span className="feature-time feature-second-clock">00:03</span>
                <h2 className="feature-title">Seus <em>clientes.</em><span>Sempre por perto.</span></h2>
                <p className="feature-description">
                  Tenha as informações dos seus clientes sempre à mão. Organize contatos,
                  consulte históricos e mantenha seus clientes favoritos a poucos toques de distância.
                </p>
              </div>
              <div className="feature-scene feature-scene--three">
                <p className="feature-count"><strong>03</strong><span>/ 03</span><span>· 05—08 SEGUNDOS</span></p>
                <span className="feature-time feature-third-clock">00:05</span>
                <h2 className="feature-title">Seus <em>resultados.</em><span>Sempre à vista.</span></h2>
                <p className="feature-description">
                  Acompanhe seu faturamento, cortes realizados, ticket médio e cancelamentos
                  em um só lugar. Tenha uma visão clara do desempenho da sua barbearia.
                </p>
              </div>
            </div>
            <div className="feature-progress" aria-hidden="true">
              <div className="feature-progress-line"><span /></div>
              <div className="feature-progress-labels">
                <span>00:00 AGENDA</span><span>00:03 CLIENTES</span><span>00:05 ESTATÍSTICAS</span>
              </div>
            </div>
            <span className="feature-note"><span className="feature-active-number">01</span> / EXPERIÊNCIA AGENDA BARBER</span>
          </div>
        </div>
      </section>
      <section className="landing-white-section" id="secao-branca" aria-labelledby={featureTab === 'agendamento' ? 'white-feature-title-agendamento' : 'white-feature-title-financeiro'} data-feature={featureTab}>
        <div className="white-feature-sticky">
          <div className="white-feature-copy">
            <p className="white-feature-count"><strong>FUNCIONALIDADES AGENDA BARBER</strong></p>
            <div className="white-feature-swap" aria-live="polite">
              <div className="white-feature-panel white-feature-panel--agendamento"
                aria-hidden={featureTab !== 'agendamento'}>
                <span className="white-feature-time">PASSO A PASSO</span>
                <h2 className="white-feature-title" id="white-feature-title-agendamento">
                  É muito <em>fácil.</em><span>Agende em poucos passos.</span>
                </h2>
                <p className="white-feature-description">
                  Toque no botão + para criar um novo agendamento. Escolha o cliente,
                  defina a data e o horário, selecione o serviço e pronto:
                  seu atendimento fica organizado na agenda.
                </p>
              </div>
              <div className="white-feature-panel white-feature-panel--financeiro"
                aria-hidden={featureTab !== 'financeiro'}>
                <span className="white-feature-time">SEUS INDICADORES</span>
                <h2 className="white-feature-title" id="white-feature-title-financeiro">
                  Seus <em>resultados.</em><span>Sempre à vista.</span>
                </h2>
                <p className="white-feature-description">
                  Acompanhe o faturamento, os cortes realizados, o ticket médio
                  e os cancelamentos em um só lugar. Tenha uma visão clara
                  do desempenho da sua barbearia.
                </p>
              </div>
            </div>
            <div className="white-feature-rule" aria-hidden="true"><span /></div>
            <div className="white-feature-tabs" role="group" aria-label="Selecionar funcionalidade">
              <button type="button" className={featureTab === 'agendamento' ? 'is-active' : ''}
                aria-pressed={featureTab === 'agendamento'} onClick={() => setFeatureTab('agendamento')}>Agendamento</button>
              <button type="button" className={featureTab === 'financeiro' ? 'is-active' : ''}
                aria-pressed={featureTab === 'financeiro'} onClick={() => setFeatureTab('financeiro')}>Financeiro</button>
            </div>
          </div>
        </div>
      </section>
      <BlackFeatureSection />
      <FaqSection />
      <DiagonalPhone featureTab={featureTab} />
      <SiteFooter />
    </main>
  );
}
