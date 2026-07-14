import { IconArrowLeft } from "../components/icons";

function B({ children }) {
  return <strong className="font-semibold text-royal">{children}</strong>;
}

function Section({ title, children }) {
  return (
    <section className="mt-8 first:mt-0">
      <h2 className="text-[13px] font-bold uppercase tracking-[0.1em] text-royal">
        {title}
      </h2>
      <div className="mt-3 flex flex-col gap-2 text-[15px] leading-relaxed text-ink">
        {children}
      </div>
    </section>
  );
}

function Item({ children }) {
  return (
    <p className="flex gap-2">
      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-royal/50" />
      <span>{children}</span>
    </p>
  );
}

export default function Instructions({ onBack }) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col pb-16">
      <div className="flex items-center gap-3 px-5 pt-5 safe-top">
        <button
          onClick={onBack}
          className="flex size-10 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-black/[0.04] hover:text-ink"
          aria-label="Voltar ao início"
        >
          <IconArrowLeft />
        </button>
        <h1 className="text-[15px] font-semibold text-ink">
          Cartilha do operador de caixa
        </h1>
      </div>

      <div className="mx-5 mt-2">
        <Section title="Sistema caixa (funções)">
          <p className="text-ink-muted text-[13px]">
            <B>Taxa delivery:</B> 122716
          </p>
          <Item><B>F2</B> — Consulta de finalizadora (subtotal)</Item>
          <Item><B>Z</B> — Fechamento de cupom fiscal (10% somente em dinheiro ou cartão débito, gás 5%)</Item>
          <Item><B>F11</B> — Desconto percentual (cigarro − 10%, menos benefícios alimentação/refeição)</Item>
          <Item><B>F8</B> — Recarga de celular (dinheiro, débito — menos benefícios alimentação/refeição)</Item>
          <Item><B>F6</B> — Abertura de caixa (troca de operador)</Item>
          <Item><B>F9</B> — Abertura do dia (primeira abertura do caixa)</Item>
          <Item><B>1</B> — Dinheiro</Item>
          <Item><B>4</B> — Cartão de crédito</Item>
          <Item><B>5</B> — Cartão de débito</Item>
          <Item><B>6</B> — P.O.S</Item>
          <Item><B>7</B> — Convênio / crediário próprio da loja</Item>
          <Item><B>10</B> — Troca</Item>
          <Item>
            <B>11</B> — Cartão de crédito próprio da loja (DM Card / SIGA CRED) — em até 3x sem juros em compras acima de R$50,00
          </Item>
          <Item><B>12</B> — Pix</Item>
          <Item><B>C</B> — Consulta de produto (código de barras)</Item>
          <Item><B>G</B> — Abertura de gaveta</Item>
          <Item>
            <B>142/</B> — Recebimento do convênio / crediário (sempre conferir a data do vencimento)
          </Item>
          <Item>
            <B>640/</B> — Recebimento do cartão próprio da loja (DMCard / SIGA CRED — somente em dinheiro)
          </Item>
          <Item>
            <B>1 toque sinal sonoro</B> — Fiscal ir até o caixa (cancelamento, diferença no preço do produto, liberação, etc.)
          </Item>
          <Item>
            <B>*</B> — Puxa peso da balança / multiplica item (colocar na tela o valor que está sendo pago)
          </Item>
          <Item>
            <B>3 toques sinal sonoro</B> — Trocar dinheiro, avisar que é entrega, P.O.S, etc.
          </Item>
        </Section>

        <Section title="Compras">
          <p className="font-semibold text-ink">Sempre passar compra em pé quando:</p>
          <Item>Não deixar muita sacola em cima do caixa — lembre-se de economizar</Item>
          <Item>Prestar atenção ao multiplicar caixas de leite, fardos de cerveja, etc.</Item>
          <Item>
            Passar item e olhar na tela para ver se registrou corretamente, principalmente
            quando multiplica itens, produtos de peso do hortifruti e/ou carnes
          </Item>
          <Item>
            Sempre ao registrar etiqueta de carnes, padaria ou hortifruti, colocar na
            balança para conferir peso e nome — em caso de divergência, sempre chamar o
            fiscal, <B>nunca digitar sozinho</B>
          </Item>
          <Item>
            <B>Nunca</B> perguntar ao cliente a variedade do produto do hortifruti (ex.:
            maçã gala ou fuji) — o operador deve saber o produto que se trata
          </Item>

          <p className="mt-2 font-semibold text-ink">Ajudar a empacotar</p>
          <Item>
            Agilidade em passar e finalizar compras (finalizar e já chamar o próximo da fila)
          </Item>
          <Item>
            Sempre agir com simpatia, ter visão, agilidade e atenção — mostre-se
            indispensável para a empresa
          </Item>

          <Item>
            Para cancelamento de <B>item</B>, sempre informar o cliente o motivo (e
            informar ao fiscal o motivo e o número do item)
          </Item>
          <Item>
            Para cancelamento de <B>compra</B> por falta de saldo ou não autorizado,
            informar ao fiscal o <B>código 51</B> (código interno), para não constranger
            o cliente
          </Item>
          <Item>
            Falar o script colado no caixa, passar ao cliente as promoções da loja e
            sempre entregar o cupom com o "ok" na notinha
          </Item>
        </Section>

        <Section title="Organização do caixa">
          <Item>Deixar o caixa sempre limpo e organizado</Item>
          <Item>Sacolas organizadas e repostas para a próxima operadora</Item>
          <Item>Notas de dinheiro em ordem e do mesmo lado</Item>
          <Item>Separar comprovantes: TEF, POS, recarga, pagamento de crediário, etc.</Item>
          <Item>
            Não deixar acabar moedas nem esperar a troca de turno para pedir — economize
            troco, sempre peça pro cliente
          </Item>
        </Section>

        <Section title="Vales">
          <p className="font-semibold text-ink">Vale gás de cozinha:</p>
          <Item>Cliente traz o vasilhame vazio e retira na loja</Item>
          <Item>
            Caixa de leite, o vale-gás e o entregador levam e retiram o vasilhame na
            casa do cliente
          </Item>

          <p className="mt-2 font-semibold text-ink">Vale vasilhame:</p>
          <Item>Preencher especificando qual refrigerante se trata</Item>
          <Item>
            Preencher especificando, se for vasilhame de cerveja, quantos ml são e se
            a caixa pertence ao cliente
          </Item>

          <p className="mt-2 font-semibold text-ink">Comanda de entrega:</p>
          <Item>Preencher todos os campos e conferir os dados com o cliente</Item>
          <Item>
            Preencher tudo o que for fora da caixa de entrega (caixa de leite, cesta
            básica, vassoura/rodo, etc.)
          </Item>

          <p className="mt-2">
            <B>Taxa de entrega:</B> será cobrada quando o bairro <B>NÃO</B> estiver
            próximo à loja — sempre chamar a fiscal para confirmar o valor (cód: 5050,
            valor: R$9,00)
          </p>
          <p>
            <B>Frete de entrega:</B> R$6,00 — código: 704
          </p>
        </Section>

        <Section title="Operadora de caixa">
          <Item>Uniforme sempre limpo e passado</Item>
          <Item>Usar calça jeans básica, tênis e blusa de frio (depois, somente blazer)</Item>
          <Item>Sapatos em cores neutras</Item>
          <Item>Maquiagem não muito carregada</Item>
          <Item>Acessórios discretos (brincos, anéis, pulseiras, etc.)</Item>
          <Item>Proibido mascar chiclete</Item>
          <Item>Pontualidade nos horários de entrada, café e almoço</Item>
          <Item>Fumantes: fumar apenas dentro do horário de café e almoço</Item>
          <Item>Respeitar a escala do mês</Item>
          <Item>
            O material de trabalho é fornecido pela empresa — cada um deve zelar pelo
            seu; se perder ou esquecer, terá que repor
          </Item>
          <Item>
            Não carregar nada pessoal no caixa, somente material de trabalho — outros
            itens devem ficar guardados no armário pessoal
          </Item>
          <Item>
            Proibido uso de celular na empresa, exceto nos horários de café e almoço
            (e sempre guardado no armário pessoal)
          </Item>
          <Item>
            Verificar sempre se não há recado das fiscais no celular — anotar o número
            delas e deixar o número de vocês também
          </Item>
        </Section>

        <Section title="Código teclado">
          <p>
            Quando a fiscal disser o código <B>Teclado</B> (código usado internamente),
            significa que ela está em dúvida se algum item foi registrado — por exemplo:
            criança com um danone, chocolate ou item pequeno na mão; caixa de leite ou
            fardo de cerveja embaixo do carrinho, etc.
          </p>
          <p>
            Fique atenta ao sinal e, caso não tenha passado algum item, diga ao cliente
            que <B>"o teclado não está funcionando"</B> e peça para conferir.
          </p>
        </Section>
      </div>
    </div>
  );
}