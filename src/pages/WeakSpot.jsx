import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured, PROGRESS_TABLE } from "../lib/supabaseClient";
import { shuffle, normalizeAnswer as normalize } from "../lib/quizUtils";
import Button from "../components/Button";
import {
  IconArrowLeft,
  IconCheck,
  IconX,
  IconLoader,
  IconImageOff,
  IconLock,
  IconTarget,
} from "../components/icons";

const GAMES_REQUIRED = 5;
const STREAK_TO_GRADUATE = 5;

export default function WeakSpot({ onBack, player }) {
  const gamesPlayed = player?.games_played ?? 0;
  const unlocked = gamesPlayed >= GAMES_REQUIRED;

  const [status, setStatus] = useState("loading"); // loading | error | empty | ready
  const [errorMessage, setErrorMessage] = useState("");
  const [queue, setQueue] = useState([]);
  const [graduatedCount, setGraduatedCount] = useState(0);

  // Para itens com foto, primeiro pergunta o código, depois o nome.
  // Itens do tipo "situação" têm só uma etapa (código/letra), como no teste normal.
  const [step, setStep] = useState("code"); // 'code' | 'name'
  const [codeWasCorrect, setCodeWasCorrect] = useState(null);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState(null); // null | 'correct' | 'incorrect'

  useEffect(() => {
    if (unlocked) loadWeakItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unlocked]);

  async function loadWeakItems() {
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
      .from(PROGRESS_TABLE)
      .select("training_streak, items ( id, name, code, image_url, item_type )")
      .eq("player_id", player.id)
      .eq("is_weak", true);

    if (error) {
      setErrorMessage("Não foi possível carregar seus pontos fracos. Tente novamente.");
      setStatus("error");
      return;
    }

    const weakItems = (data ?? [])
      .filter((row) => row.items)
      .map((row) => ({ ...row.items, streak: row.training_streak ?? 0 }));

    if (weakItems.length === 0) {
      setStatus("empty");
      return;
    }

    setQueue(shuffle(weakItems));
    setGraduatedCount(0);
    setStep("code");
    setCodeWasCorrect(null);
    setInput("");
    setFeedback(null);
    setStatus("ready");
  }

  const current = queue[0];
  const isSituacao = current?.item_type === "situacao";
  const hasTwoSteps = current && !isSituacao;
  const finished = status === "ready" && queue.length === 0;

  const expectedAnswer =
    step === "name" ? current?.name : current?.code;
  const expectsText = isSituacao || step === "name";

  function handleSubmit(e) {
    e.preventDefault();
    if (feedback || !current) return;
    const correct = normalize(input) === normalize(expectedAnswer);
    setFeedback(correct ? "correct" : "incorrect");
  }

  function handleNext() {
    if (!current) return;

    // Item com duas etapas (código + nome) e ainda está na primeira etapa:
    // guarda o resultado do código e avança pra pergunta do nome.
    if (hasTwoSteps && step === "code") {
      setCodeWasCorrect(feedback === "correct");
      setStep("name");
      setInput("");
      setFeedback(null);
      return;
    }

    // Fecha a rodada do item: só conta como sucesso se acertou tudo que foi
    // pedido (código sozinho para "situação"; código + nome para os demais).
    const success = hasTwoSteps
      ? codeWasCorrect && feedback === "correct"
      : feedback === "correct";

    finalizeRound(current, success);
  }

  async function finalizeRound(item, success) {
    const nextStreak = success ? item.streak + 1 : 0;
    const graduates = success && nextStreak >= STREAK_TO_GRADUATE;

    if (graduates) {
      await supabase
        .from(PROGRESS_TABLE)
        .update({ is_weak: false, training_streak: 0, consecutive_misses: 0 })
        .eq("player_id", player.id)
        .eq("item_id", item.id);

      setGraduatedCount((c) => c + 1);
      setQueue((prev) => prev.slice(1));
    } else {
      await supabase
        .from(PROGRESS_TABLE)
        .update({ training_streak: nextStreak })
        .eq("player_id", player.id)
        .eq("item_id", item.id);

      setQueue((prev) => {
        const [first, ...rest] = prev;
        return [...rest, { ...first, streak: nextStreak }];
      });
    }

    setStep("code");
    setCodeWasCorrect(null);
    setInput("");
    setFeedback(null);
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
      <h1 className="text-[15px] font-semibold text-ink">Treinar ponto fraco</h1>
      <div className="flex w-10 items-center justify-end text-sm font-semibold text-royal tnum">
        {status === "ready" && !finished ? `${queue.length}` : ""}
      </div>
    </div>
  );

  if (!unlocked) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col">
        {topBar}
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-royal-tint text-royal">
            <IconLock className="size-6" />
          </div>
          <h2 className="text-xl font-bold text-ink">Ainda não desbloqueado</h2>
          <p className="max-w-xs text-[15px] text-ink-muted">
            Jogue {GAMES_REQUIRED - gamesPlayed} partida
            {GAMES_REQUIRED - gamesPlayed === 1 ? "" : "s"} do teste de
            memória para desbloquear o treino de ponto fraco.
          </p>
          <p className="text-xs font-medium text-ink-muted tnum">
            {gamesPlayed} / {GAMES_REQUIRED} partidas
          </p>
          <Button variant="secondary" onClick={onBack}>
            Voltar ao início
          </Button>
        </div>
      </div>
    );
  }

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
            <Button variant="secondary" onClick={loadWeakItems}>
              Tentar de novo
            </Button>
          </div>
        )}

        {status === "empty" && (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-success-tint text-success">
              <IconCheck className="size-6" />
            </div>
            <h2 className="text-xl font-bold text-ink">Nenhum ponto fraco agora!</h2>
            <p className="max-w-xs text-[15px] text-ink-muted">
              Você não tem itens pendentes de treino no momento. Continue
              jogando o teste de memória — se errar algum item 2 vezes
              seguidas, ele aparece aqui automaticamente.
            </p>
            <Button variant="secondary" onClick={onBack}>
              Voltar ao início
            </Button>
          </div>
        )}

        {status === "ready" && finished && (
          <div className="flex w-full animate-fade-slide flex-col items-center gap-6 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-royal-tint text-royal">
              <IconTarget className="size-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-ink">Treino concluído!</h2>
              <p className="mt-1 text-[15px] text-ink-muted">
                {graduatedCount > 0
                  ? `Você dominou ${graduatedCount} ${graduatedCount === 1 ? "item" : "itens"} que estava errando. 🎯`
                  : "Volte quando quiser praticar de novo."}
              </p>
            </div>
            <Button variant="primary" className="w-full" onClick={onBack}>
              Voltar ao início
            </Button>
          </div>
        )}

        {status === "ready" && !finished && current && (
          <form
            onSubmit={handleSubmit}
            key={`${current.id}-${step}-${current.streak}`}
            className="flex w-full animate-fade-slide flex-col items-center"
          >
            <div className="flex w-full items-center justify-between">
              <p className="text-xs font-semibold tracking-[0.15em] text-ink-muted uppercase">
                Restam {queue.length} {queue.length === 1 ? "item" : "itens"}
              </p>
              {hasTwoSteps && (
                <p className="text-xs font-semibold tracking-[0.15em] text-royal uppercase">
                  {step === "code" ? "1/2 · código" : "2/2 · nome"}
                </p>
              )}
            </div>

            {isSituacao ? (
              <div className="mt-3 flex min-h-40 w-full flex-col items-center justify-center rounded-2xl bg-royal-tint/40 px-6 py-8 text-center">
                <p className="text-lg leading-relaxed font-medium text-ink">
                  {current.name}
                </p>
              </div>
            ) : (
              <div className="mt-3 aspect-4/3 w-full overflow-hidden rounded-2xl bg-royal-tint/40">
                {current.image_url ? (
                  <img
                    src={current.image_url}
                    alt="Item para identificar"
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
              {isSituacao
                ? "Qual é a letra ou código?"
                : step === "name"
                  ? "Qual é o nome do item?"
                  : "Qual é o código?"}
            </p>

            <div className="mt-2 flex items-center gap-1" aria-label="Sequência de acertos">
              {Array.from({ length: STREAK_TO_GRADUATE }).map((_, i) => (
                <span
                  key={i}
                  className={`size-2 rounded-full ${
                    i < current.streak ? "bg-royal" : "bg-line"
                  }`}
                />
              ))}
            </div>

            <input
              type="text"
              inputMode={expectsText ? "text" : "numeric"}
              pattern={expectsText ? undefined : "[0-9]*"}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize={step === "name" ? "words" : "characters"}
              enterKeyHint="done"
              placeholder={
                isSituacao ? "Ex: C" : step === "name" ? "Ex: Maçã Gala" : "0000"
              }
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
                  <IconX className="size-5" /> Ops… essa não é.
                </p>
                <div>
                  <p className="text-center text-xs font-semibold tracking-[0.15em] text-error/80 uppercase">
                    {step === "name" ? "Nome correto" : "Resposta correta"}
                  </p>
                  <div
                    className={
                      step === "name"
                        ? "sticker-edge mt-1.5 rounded-xl bg-white px-5 py-2 text-center text-lg font-semibold text-ink"
                        : "sticker-edge tnum mt-1.5 rounded-xl bg-white px-5 py-2 text-center font-mono text-xl font-semibold tracking-[0.2em] text-ink"
                    }
                  >
                    {expectedAnswer}
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
                {hasTwoSteps && step === "code" ? "Próximo · nome" : "Próximo"}
              </Button>
            )}
          </form>
        )}
      </div>
    </div>
  );
}