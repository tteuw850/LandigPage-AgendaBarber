import barber from '../assets/images/barbeiro.png'
import { useBlackChapterScroll } from '../hooks/useBlackChapterScroll'
import '../styles/black-chapter.css'

const benefits = [
 { n: '01', title: 'Tempo que volta para você', detail: 'Chega de procurar horários entre mensagens, cadernos e anotações.' },
 { n: '02', title: 'Clientes sempre organizados', detail: 'Informações e histórico dos clientes em um só lugar.' },
 { n: '03', title: 'Resultados sem adivinhação', detail: 'Cortes, faturamento e despesas sempre à vista.' },
 { n: '04', title: 'A solução é o Agenda Barber', detail: 'Agende, organize e acompanhe seu negócio pelo celular.' },
]

export default function BlackFeatureSection() {
 const { sectionRef, activeStep } = useBlackChapterScroll(benefits.length)
 return (
  <section className="landing-black-follow-section" id="secao-preta-final"
   ref={sectionRef} aria-labelledby="black-chapter-title">
   <div className="black-chapter-sticky">
    <div className="black-chapter-copy">
     <p className="black-chapter-count">05 / <strong>POR QUE O AGENDA BARBER?</strong></p>
     <span className="black-chapter-label">A IMPORTÂNCIA DE SIMPLIFICAR</span>
     <h2 className="black-chapter-title" id="black-chapter-title">
      Mais tempo para <em>o que importa.</em>
     </h2>
     <p className="black-chapter-intro">
      Administrar sua barbearia não deveria tomar o tempo do atendimento.
      O Agenda Barber reúne o essencial para você focar nos clientes e no crescimento do seu negócio.
     </p>
     <div className="black-chapter-benefits" aria-label="Benefícios do aplicativo">
      <span className="black-chapter-rail" aria-hidden="true"><span className="black-chapter-rail-fill" /></span>
      {benefits.map((item, index) => (
       <div className="black-chapter-benefit" key={item.n}
        data-active={index === activeStep} data-complete={index < activeStep}>
        <span className="black-chapter-benefit-number" aria-hidden="true">{item.n}</span>
        <div><h3>{item.title}</h3><p>{item.detail}</p></div>
       </div>
      ))}
     </div>
    </div>
    <div className="black-chapter-visual" aria-hidden="true">
     <span className="black-chapter-light" />
     <img src={barber} className="black-chapter-barber" alt="" loading="lazy" decoding="async" />
    </div>
   </div>
  </section>
 )
}
