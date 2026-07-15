import { useEffect, useState } from "react";
import {
  supabase,
  isSupabaseConfigured,
  ITEMS_TABLE,
  PLAYERS_TABLE,
} from "../lib/supabaseClient";
import Button from "../components/Button";
import {
  IconArrowLeft,
  IconCheck,
  IconX,
  IconLoader,
  IconImageOff,
} from "../components/icons";

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function normalize(value) {
  return String(value ?? "").trim().toUpperCase();
}

export default function Quiz({ onBack, player, difficulty, onChangeDifficulty, onPeakUpdate }) {
  const [status, setStatus] = useState("loading"); // loading | error | ready
  const [errorMessage, setErrorMessage] = useState("");
  const [items, setItems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState(null); // null | 'correct' | 'incorrect'
  const [score, setScore] = useState({ correct: 0, wrong: 0 });

  // pico (recorde pessoal) do jogador logado, atualizado quando o quiz termina
  const [peak, setPeak] = useState({
    best_correct: player?.best_correct ?? 0,
    best_wrong: player?.best_wrong ?? 0,
  });
  const [peakSaved, setPeakSaved] = useState(false);
  const [isNewRecord, setIsNewRecord] = useState(false);

  useEffect(() => {
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadItems() {
    setStatus("loading");
    setErrorMessage("");

    if (!isSupabaseConfigured) {
      setErrorMessage(
        "O Supabase ainda não foi configurado neste projeto. Preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env."
      );
      setStatus("error");
      return;
    }

    const { data, error } = await supabase
      .from(ITEMS_TABLE)
      .select("id, name, code, image_url, unit_type, item_type");

    if (error) {
      setErrorMessage("Não foi possível carregar os itens. Tente novamente.");
      setStatus("error");
      return;
    }

    setItems(shuffle(data ?? []));
    setCurrentIndex(0);
    setScore({ correct: 0, wrong: 0 });
    setFeedback(null);
    setInput("");
    setStatus("ready");
  }

  function restart() {
    setItems((prev) => shuffle(prev));
    setCurrentIndex(0);
    setScore({ correct: 0, wrong: 0 });
    setFeedback(null);
    setInput("");
    setPeakSaved(false);
    setIsNewRecord(false);
  }

  const current = items[currentIndex];
  const isSituacao = current?.item_type === "situacao";
  const total = items.length;
  const finished = status === "ready" && total > 0 && currentIndex >= total;

  // Ao concluir o quiz, se o resultado bateu o recorde (pico) do jogador,
  // atualiza o ranking. Só muda quando supera o pico anterior — nunca diminui.
  useEffect(() => {
    if (!finished || !player || peakSaved) return;
    setPeakSaved(true); // marca antes de chamar, evita disparo duplo

    if (score.correct <= peak.best_correct) return;

    (async () => {
      const { error } = await supabase
        .from(PLAYERS_TABLE)
        .update({ best_correct: score.correct, best_wrong: score.wrong })
        .eq("id", player.id);

      if (!error) {
        const nextPeak = { best_correct: score.correct, best_wrong: score.wrong };
        setPeak(nextPeak);
        setIsNewRecord(true);
        onPeakUpdate?.(nextPeak);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  function handleSubmit(e) {
    e.preventDefault();
    if (feedback || !current) return;
    const correct = normalize(input) === normalize(current.code);
    setFeedback(correct ? "correct" : "incorrect");
    setScore((s) => ({
      correct: s.correct + (correct ? 1 : 0),
      wrong: s.wrong + (correct ? 0 : 1),
    }));
  }

  function handleNext() {
    setFeedback(null);
    setInput("");
    setCurrentIndex((i) => i + 1);
  }

  const topBar = (
    <div className="flex items-center justify-between px-5 pt-5 safe-top">
      <button
        onClick={onBack}
        className="flex size-10 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-black/[0.04] hover:text-ink"
        aria-label="Voltar ao início"
      >
        <IconArrowLeft />
      </button>

      {status === "ready" && total > 0 && !finished && (
        <p className="text-sm font-medium text-ink-muted tnum">
          {currentIndex + 1} / {total}
        </p>
      )}

      <div className="flex items-center gap-2 text-sm font-semibold tnum">
        <span className="flex items-center gap-1 text-success">
          <IconCheck className="size-3.5" /> {score.correct}
        </span>
        <span className="flex items-center gap-1 text-error">
          <IconX className="size-3.5" /> {score.wrong}
        </span>
      </div>
    </div>
  );

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      {topBar}

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-8">
        {status === "loading" && (
          <div className="flex flex-col items-center gap-3 text-ink-muted">
            <IconLoader className="size-6 animate-spin" />
            <p className="text-sm">Carregando…</p>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-error-tint text-error">
              <IconX className="size-6" />
            </div>
            <p className="max-w-xs text-[15px] text-ink-muted">{errorMessage}</p>
            <Button variant="secondary" onClick={loadItems}>
              Tentar de novo
            </Button>
          </div>
        )}

        {status === "ready" && total === 0 && (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-royal-tint text-royal">
              <IconImageOff className="size-6" />
            </div>
            <p className="max-w-xs text-[15px] text-ink-muted">
              Ainda não há itens cadastrados. Peça para um administrador
              cadastrar no painel do admin.
            </p>
            <Button variant="secondary" onClick={onBack}>
              Voltar ao início
            </Button>
          </div>
        )}

        {status === "ready" && total > 0 && finished && (
          <div
            key="summary"
            className="flex w-full animate-fade-slide flex-col items-center gap-6 text-center"
          >
            <div className="flex size-14 items-center justify-center rounded-2xl bg-royal-tint text-royal">
              <IconCheck className="size-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-ink">Quiz concluído!</h2>
              <p className="mt-1 text-[15px] text-ink-muted">
                Você acertou {score.correct} de {total}.
              </p>
              {isNewRecord && (
                <p className="mt-1 text-sm font-semibold text-royal">
                  🏆 Novo recorde pessoal!
                </p>
              )}
            </div>

            <div className="flex w-full gap-3">
              <div className="flex-1 rounded-2xl border border-line bg-success-tint px-4 py-3">
                <p className="text-2xl font-bold text-success tnum">{score.correct}</p>
                <p className="text-xs font-medium text-ink-muted">acertos</p>
              </div>
              <div className="flex-1 rounded-2xl border border-line bg-error-tint px-4 py-3">
                <p className="text-2xl font-bold text-error tnum">{score.wrong}</p>
                <p className="text-xs font-medium text-ink-muted">erros</p>
              </div>
            </div>

            <div className="mt-2 flex w-full flex-col gap-3">
              <Button
                variant="primary"
                className="w-full"
                onClick={onChangeDifficulty ?? restart}
              >
                Jogar de novo
              </Button>
              <Button variant="ghost" className="w-full" onClick={onBack}>
                Voltar ao início
              </Button>
            </div>
          </div>
        )}

        {status === "ready" && total > 0 && !finished && current && (
          <form
            onSubmit={handleSubmit}
            key={current.id}
            className="flex w-full animate-fade-slide flex-col items-center"
          >
            {isSituacao ? (
              <div className="flex min-h-40 w-full flex-col items-center justify-center rounded-2xl bg-royal-tint/40 px-6 py-8 text-center">
                <p className="text-lg leading-relaxed font-medium text-ink">
                  {current.name}
                </p>
              </div>
            ) : (
              <div className="aspect-4/3 w-full overflow-hidden rounded-2xl bg-royal-tint/40">
                {current.image_url ? (
                  <img
                    src={current.image_url}
                    alt={current.name}
                    fetchpriority="high"
                    decoding="async"
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-royal/40">
                    <IconImageOff className="size-10" />
                  </div>
                )}
              </div>
            )}

            <p className="mt-6 text-xs font-semibold tracking-[0.18em] text-royal uppercase">
              {isSituacao ? "Qual é a letra ou código?" : "Qual é o código?"}
            </p>
            {!isSituacao && difficulty !== "dificil" && (
              <h2 className="mt-1 text-center text-2xl font-bold text-ink">
                {current.name}
              </h2>
            )}

            <input
              type="text"
              inputMode={isSituacao ? "text" : "numeric"}
              pattern={isSituacao ? undefined : "[0-9]*"}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="characters"
              enterKeyHint="done"
              placeholder={isSituacao ? "Ex: C" : "0000"}
              value={input}
              disabled={Boolean(feedback)}
              onChange={(e) => setInput(e.target.value)}
              autoFocus
              className="tnum mt-6 w-full rounded-2xl border border-line bg-white px-5 py-4 text-center text-2xl font-semibold uppercase tracking-[0.3em] text-ink placeholder:text-line-strong focus:border-royal disabled:bg-black/[0.02]"
            />

            {!feedback && (
              <Button type="submit" variant="primary" className="mt-5 w-full">
                Confirmar
              </Button>
            )}

            {feedback === "correct" && (
              <div className="mt-5 flex w-full animate-fade-slide flex-col items-center gap-4 rounded-2xl bg-success-tint px-5 py-5">
                <p className="flex items-center gap-2 font-semibold text-success">
                  <IconCheck className="size-5" /> Parabéns, você acertou!
                </p>
              </div>
            )}

            {feedback === "incorrect" && (
              <div className="mt-5 flex w-full animate-fade-slide flex-col items-center gap-3 rounded-2xl bg-error-tint px-5 py-5">
                <p className="flex items-center gap-2 font-semibold text-error">
                  <IconX className="size-5" /> Ops… você errou!
                </p>
                <div>
                  <p className="text-center text-xs font-semibold tracking-[0.15em] text-error/80 uppercase">
                    Resposta correta
                  </p>
                  <div className="sticker-edge tnum mt-1.5 rounded-xl bg-white px-5 py-2 text-center font-mono text-xl font-semibold tracking-[0.2em] text-ink">
                    {current.code}
                  </div>
                </div>
              </div>
            )}

            {feedback && (
              <Button
                type="button"
                variant="primary"
                className="mt-3 w-full"
                onClick={handleNext}
              >
                Próximo
              </Button>
            )}
          </form>
        )}
      </div>
    </div>
  );
}