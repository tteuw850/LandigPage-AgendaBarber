import { useId, useState } from 'react'
import '../styles/faq-section.css'

const questions = [
  { question: 'Meus clientes precisam instalar o aplicativo?', answer: 'Não. O Agenda Barber foi pensado para uso do barbeiro. Você mesmo cadastra clientes e organiza os agendamentos, sem exigir que eles instalem outro aplicativo.' },
  { question: 'Como faço um novo agendamento?', answer: 'Toque no botão +, selecione o cliente, escolha o serviço, a data e o horário. Assim, o atendimento fica registrado na sua agenda.' },
  { question: 'Posso cadastrar meus serviços e valores?', answer: 'Sim. Organize os serviços oferecidos pela barbearia, com preços e duração, para facilitar a escolha no momento de agendar.' },
  { question: 'Consigo agendar clientes que vêm toda semana?', answer: 'Sim. Você pode configurar atendimentos recorrentes para clientes que costumam vir no mesmo dia e horário, respeitando os horários disponíveis.' },
  { question: 'Como evitar dois clientes no mesmo horário?', answer: 'A agenda verifica a disponibilidade e os conflitos de horário ao organizar os atendimentos. Você também pode bloquear períodos em que não deseja receber agendamentos.' },
  { question: 'Posso organizar minha lista de clientes?', answer: 'Sim. Cadastre os dados dos clientes e encontre as informações necessárias para agilizar os próximos atendimentos.' },
  { question: 'Quais resultados financeiros posso acompanhar?', answer: 'A área de Estatísticas reúne informações como faturamento, cortes concluídos, ticket médio, cancelamentos e despesas, para ajudar você a entender o desempenho do negócio.' },
  { question: 'Em quais aparelhos posso usar o Agenda Barber?', answer: 'O aplicativo está sendo desenvolvido para Android, com uso focado no profissional da barbearia. A disponibilidade da versão final será informada nos canais oficiais do projeto.' },
]

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const prefix = useId()

  return (
    <section className="landing-faq" id="perguntas" aria-labelledby="faq-heading">
      <div className="faq-layout">
        <div className="faq-intro">
          <p className="faq-eyebrow">AGENDA BARBER / DÚVIDAS FREQUENTES</p>
          <h2 id="faq-heading">O que todo mundo <em>pergunta</em> antes.</h2>
          <p className="faq-lead">Tudo o que você precisa saber para organizar sua barbearia com mais facilidade.</p>
          <a className="faq-link" href="#secao-branca">
            <span aria-hidden="true">↗</span>
            VER FUNCIONALIDADES
          </a>
        </div>
        <div className="faq-accordion" aria-label="Perguntas frequentes">
          {questions.map(({ question, answer }, index) => {
            const expanded = openIndex === index
            const answerId = `${prefix}-faq-answer-${index}`
            const questionId = `${prefix}-faq-question-${index}`
            return (
              <div key={question} className="faq-item" data-expanded={expanded}>
                <h3 className="faq-item-heading">
                  <button className="faq-trigger" type="button"
                    id={questionId}
                    aria-controls={answerId}
                    aria-expanded={expanded}
                    onClick={() => setOpenIndex(expanded ? null : index)}>
                    <span>{question}</span>
                    <span className="faq-toggle" aria-hidden="true">
                      {expanded ? '−' : '+'}
                    </span>
                  </button>
                </h3>
                <div className="faq-answer-grid" aria-hidden={!expanded}>
                  <div className="faq-answer-wrap">
                    <div className="faq-answer" id={answerId} role="region" aria-labelledby={questionId}>
                      <p>{answer}</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
