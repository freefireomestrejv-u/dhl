import Button from "../components/Button";
import { IconArrowLeft, IconEye, IconEyeOff } from "../components/icons";

// Tela exibida depois que o jogador entra (ou ao recomeçar o quiz),
// perguntando qual dificuldade ele quer jogar.
export default function Difficulty({ onBack, onSelect }) {
  const topBar = (
    <div className="flex items-center gap-3 px-5 pt-5 safe-top">
      <button
        onClick={onBack}
        className="flex size-10 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-black/[0.04] hover:text-ink"
        aria-label="Voltar ao início"
      >
        <IconArrowLeft />
      </button>
      <h1 className="text-[15px] font-semibold text-ink">Escolha a dificuldade</h1>
    </div>
  );

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      {topBar}

      <div className="flex flex-1 flex-col justify-center px-6 py-8">
        <p className="text-center text-xs font-semibold tracking-[0.18em] text-royal uppercase">
          Antes de começar
        </p>
        <h2 className="mt-2 text-center text-2xl font-bold text-ink">
          Qual dificuldade você quer?
        </h2>

        <div className="mt-8 flex w-full flex-col gap-4">
          <button
            onClick={() => onSelect("facil")}
            className="flex w-full items-start gap-4 rounded-2xl border border-line bg-white px-5 py-5 text-left transition-colors hover:border-royal hover:bg-royal-tint/40 active:translate-y-px"
          >
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-success-tint text-success">
              <IconEye className="size-5.5" />
            </div>
            <div>
              <p className="text-[15px] font-bold text-ink">Fácil</p>
              <p className="mt-0.5 text-sm text-ink-muted">
                Mostra a foto e o nome do item.
              </p>
            </div>
          </button>

          <button
            onClick={() => onSelect("dificil")}
            className="flex w-full items-start gap-4 rounded-2xl border border-line bg-white px-5 py-5 text-left transition-colors hover:border-royal hover:bg-royal-tint/40 active:translate-y-px"
          >
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-error-tint text-error">
              <IconEyeOff className="size-5.5" />
            </div>
            <div>
              <p className="text-[15px] font-bold text-ink">Difícil</p>
              <p className="mt-0.5 text-sm text-ink-muted">
                Mostra apenas a foto do item.
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}