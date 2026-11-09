import logo from '../assets/images/agenda_barber_logo_square_transparent.png'
import '../styles/site-footer.css'

const apkUrl = '/downloads/Agenda-Barber-1.0.0.apk'
const whatsappUrl = 'https://wa.me/5511946464236?text=Ol%C3%A1%2C%20gostaria%20de%20adquirir%20uma%20conta%20no%20Agenda%20Barber.'

const currentYear = new Date().getFullYear()

export default function SiteFooter() {
  return (
    <footer className="site-footer" id="rodape" aria-label="Rodapé do Agenda Barber">
      <div className="site-footer-container">
        <div className="site-footer-accent" aria-hidden="true" />

        <div className="site-footer-highlight">
          <div className="site-footer-headline">
            <span className="site-footer-eyebrow">AGENDA BARBER / SEU PRÓXIMO PASSO</span>
            <h2>Sua barbearia, <em>mais à frente.</em></h2>
            <p>Menos tempo organizando. Mais tempo cuidando dos clientes e fazendo seu negócio crescer.</p>
          </div>
          <div className="site-footer-actions">
            <a className="site-footer-download" href={apkUrl} download="Agenda-Barber-1.0.0.apk">
              Baixar APP <span aria-hidden="true">↓</span>
            </a>
            <a className="site-footer-signup" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              Criar Conta <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>

        <div className="site-footer-divider" />

        <div className="site-footer-columns">
          <div className="site-footer-brand-column">
            <a href="#home" className="site-footer-brand" aria-label="Agenda Barber — voltar ao início">
              <img src={logo} alt="" width="44" height="44" />
              <span><strong>Agenda</strong>Barber</span>
            </a>
            <p>Uma agenda inteligente para quem vive da barbearia.</p>
          </div>
          <nav className="site-footer-nav" aria-label="Navegação do rodapé">
            <h3>Explorar</h3>
            <a href="#home">Início</a>
            <a href="#secao-branca">Funcionalidades</a>
            <a href="#secao-preta-final">Soluções</a>
            <a href="#perguntas">Perguntas frequentes</a>
          </nav>
          <div className="site-footer-links">
            <h3>Comece agora</h3>
            <a href={apkUrl} download="Agenda-Barber-1.0.0.apk">Baixar para Android</a>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">Falar pelo WhatsApp</a>
            <span>Aplicativo para Android</span>
          </div>
        </div>

        <div className="site-footer-bottom">
          <span>© {currentYear} Agenda Barber. Todos os direitos reservados.</span>
          <a href="#home">Voltar ao topo <span aria-hidden="true">↑</span></a>
        </div>
      </div>
    </footer>
  )
}
