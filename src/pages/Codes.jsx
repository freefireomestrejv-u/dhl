import { useEffect, useMemo, useState } from "react";
import { supabase, isSupabaseConfigured, ITEMS_TABLE } from "../lib/supabaseClient";
import Button from "../components/Button";
import {
  IconArrowLeft,
  IconLoader,
  IconImageOff,
  IconX,
  IconSearch,
} from "../components/icons";

export default function Codes({ onBack }) {
  const [status, setStatus] = useState("loading"); // loading | error | ready
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    setStatus("loading");

    if (!isSupabaseConfigured) {
      setStatus("error");
      return;
    }

    const { data, error } = await supabase
      .from(ITEMS_TABLE)
      .select("id, name, code, image_url, unit_type")
      .order("name", { ascending: true });

    if (error) {
      setStatus("error");
      return;
    }

    setItems(data ?? []);
    setStatus("ready");
  }

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) || item.code.toLowerCase().includes(q)
    );
  }, [items, query]);

  const topBar = (
    <div className="flex items-center gap-3 px-5 pt-5 safe-top">
      <button
        onClick={onBack}
        className="flex size-10 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-black/[0.04] hover:text-ink"
        aria-label="Voltar ao início"
      >
        <IconArrowLeft />
      </button>
      <h1 className="text-[15px] font-semibold text-ink">
        Códigos completos {items.length > 0 && `(${items.length})`}
      </h1>
    </div>
  );

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col pb-16">
      {topBar}

      {status === "ready" && items.length > 0 && (
        <div className="mx-5 mt-5">
          <div className="flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-3 focus-within:border-royal">
            <IconSearch className="size-4.5 shrink-0 text-ink-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nome ou código"
              className="w-full text-[15px] text-ink placeholder:text-ink-muted focus:outline-none"
            />
          </div>
        </div>
      )}

      <div className="mx-5 mt-4 flex flex-col gap-2">
        {status === "loading" && (
          <div className="flex items-center justify-center gap-2 py-8 text-ink-muted">
            <IconLoader className="size-4.5 animate-spin" />
            <span className="text-sm">Carregando…</span>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-error-tint text-error">
              <IconX className="size-6" />
            </div>
            <p className="max-w-xs text-[15px] text-ink-muted">
              Não foi possível carregar os itens. Tente novamente.
            </p>
            <Button variant="secondary" onClick={loadItems}>
              Tentar de novo
            </Button>
          </div>
        )}

        {status === "ready" && items.length === 0 && (
          <p className="rounded-2xl border border-dashed border-line-strong px-4 py-6 text-center text-sm text-ink-muted">
            Nenhum item cadastrado ainda.
          </p>
        )}

        {status === "ready" && items.length > 0 && filteredItems.length === 0 && (
          <p className="rounded-2xl border border-dashed border-line-strong px-4 py-6 text-center text-sm text-ink-muted">
            Nenhum item encontrado para "{query}".
          </p>
        )}

        {status === "ready" &&
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-xl border border-line bg-white p-2.5"
            >
              <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-royal-tint/40">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="size-full object-cover"
                  />
                ) : (
                  <IconImageOff className="size-4 text-royal/40" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-medium text-ink">
                  {item.name}
                </p>
                <span className="rounded-full bg-black/[0.04] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
                  {item.unit_type === "peso" ? "Peso" : "Unidade"}
                </span>
              </div>

              <div className="tnum shrink-0 rounded-lg bg-black/[0.03] px-3 py-1.5 font-mono text-sm font-semibold tracking-wider text-ink">
                {item.code}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}