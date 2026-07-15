import Button from "../components/Button";
import { IconTarget } from "../components/icons";

export default function Home({
  onPlay,
  onWeakSpot,
  onAdmin,
  onCodes,
  onInstructions,
  onRanking,
}) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 py-16 text-center safe-top safe-bottom">
      <div className="flex size-36 items-center justify-center overflow-hidden rounded-2xl">
        <img
          src="https://i.postimg.cc/Qt6F5vhh/images-8.jpg"
          alt="Logo do mercado"
          fetchpriority="high"
          decoding="async"
          className="size-full object-contain"
        />
      </div>

      <p className="mt-6 text-xs font-semibold tracking-[0.18em] text-royal uppercase">
        Supermercado · Treinamento
      </p>

      <h1 className="mt-3 text-5xl font-extrabold tracking-tight text-ink">
        Super José
      </h1>

      <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-ink-muted">
        Treine os códigos das frutas e verduras. Acerte, erre, aprenda —
        e nunca mais trave na balança.
      </p>

      <div className="mt-10 flex w-full flex-col gap-3">
        <Button variant="primaryDark" className="w-full" onClick={onPlay}>
          Teste de memória
        </Button>
        <Button
          variant="primary"
          className="w-full"
          icon={<IconTarget className="size-4.5" />}
          onClick={onWeakSpot}
        >
          Treinar ponto fraco
        </Button>
        <Button variant="tint" className="w-full" onClick={onRanking}>
          Ranking
        </Button>
        <Button variant="yellow" className="w-full" onClick={onCodes}>
          Ver códigos completos
        </Button>
        <Button variant="dark" className="w-full" onClick={onInstructions}>
          Ver instruções
        </Button>
        <Button variant="secondary" className="w-full" onClick={onAdmin}>
          Painel do admin
        </Button>
      </div>
    </div>
  );
}