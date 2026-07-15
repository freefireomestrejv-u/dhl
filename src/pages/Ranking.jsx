import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured, PLAYERS_TABLE } from "../lib/supabaseClient";
import Button from "../components/Button";
import { IconArrowLeft, IconCheck, IconX, IconLoader } from "../components/icons";

export default function Ranking({ onBack }) {
  const [status, setStatus] = useState("loading"); // loading | error | ready
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    setStatus("loading");

    if (!isSupabaseConfigured) {
      setStatus("error");
      return;
    }

    const { data, error } = await supabase
      .from(PLAYERS_TABLE)
      .select("id, name, unit, best_correct, best_wrong")
      .order("best_correct", { ascending: false })
      .order("best_wrong", { ascending: true });

    if (error) {
      setStatus("error");
      return;
    }

    setPlayers(data ?? []);
    setStatus("ready");
  }

  const topBar = (
    <div className="flex items-center gap-3 px-5 pt-5 safe-top">
      <button
        onClick={onBack}
        className="flex size-10 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-black/[0.04] hover:text-ink"
        aria-label="Voltar ao início"
      >
        <IconArrowLeft />
      </button>
      <h1 className="text-[15px] font-semibold text-ink">Ranking</h1>
    </div>
  );

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      {topBar}

      <div className="flex flex-1 flex-col px-5 py-6">
        {status === "loading" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-ink-muted">
            <IconLoader className="size-6 animate-spin" />
            <p className="text-sm">Carregando…</p>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-error-tint text-error">
              <IconX className="size-6" />
            </div>
            <p className="max-w-xs text-[15px] text-ink-muted">
              Não foi possível carregar o ranking. Tente novamente.
            </p>
            <Button variant="secondary" onClick={load}>
              Tentar de novo
            </Button>
          </div>
        )}

        {status === "ready" && players.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="max-w-xs text-[15px] text-ink-muted">
              Ainda ninguém jogou o teste de memória. Jogue para aparecer aqui!
            </p>
          </div>
        )}

        {status === "ready" && players.length > 0 && (
          <div className="flex flex-col gap-2.5">
            {players.map((player, index) => {
              const position = index + 1;
              const isTop3 = position <= 3;
              return (
                <div
                  key={player.id}
                  className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 ${
                    isTop3
                      ? "border-royal/20 bg-royal-tint/40"
                      : "border-line bg-white"
                  }`}
                >
                  <div
                    className={`flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold tnum ${
                      isTop3 ? "bg-royal text-white" : "bg-black/[0.04] text-ink-muted"
                    }`}
                  >
                    {position}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-semibold text-ink">
                      {player.name}
                    </p>
                    <p className="truncate text-xs text-ink-muted">{player.unit}</p>
                  </div>

                  <div className="flex items-center gap-3 text-sm font-semibold tnum">
                    <span className="flex items-center gap-1 text-success">
                      <IconCheck className="size-3.5" /> {player.best_correct}
                    </span>
                    <span className="flex items-center gap-1 text-error">
                      <IconX className="size-3.5" /> {player.best_wrong}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}