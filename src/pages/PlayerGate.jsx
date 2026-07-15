import { useEffect, useRef, useState } from "react";
import {
  supabase,
  isSupabaseConfigured,
  PLAYERS_TABLE,
  UNITS,
} from "../lib/supabaseClient";
import Button from "../components/Button";
import { IconArrowLeft, IconCheck, IconX, IconLoader } from "../components/icons";

function normalizeName(value) {
  return String(value ?? "").trim().toUpperCase();
}

function normalizePassword(value) {
  return String(value ?? "").replace(/\D/g, "").slice(0, 4);
}

// Tela antes do quiz: entrar com nome + senha (PIN de até 4 dígitos)
// ou criar um usuário novo (nome único + unidade + senha única).
export default function PlayerGate({ onBack, onEnter }) {
  const [mode, setMode] = useState("login"); // 'login' | 'create'

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [unit, setUnit] = useState("");

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Checagem de disponibilidade da senha em tempo real, só no modo criar.
  const [passwordStatus, setPasswordStatus] = useState(null); // null | 'checking' | 'available' | 'taken'
  const checkToken = useRef(0);

  useEffect(() => {
    if (mode !== "create") return;
    const digits = normalizePassword(password);

    if (digits.length === 0) {
      setPasswordStatus(null);
      return;
    }

    const token = ++checkToken.current;
    setPasswordStatus("checking");

    const timeout = setTimeout(async () => {
      if (!isSupabaseConfigured) return;
      const { data } = await supabase
        .from(PLAYERS_TABLE)
        .select("id")
        .eq("password", digits)
        .maybeSingle();

      if (checkToken.current !== token) return; // resposta antiga, ignora
      setPasswordStatus(data ? "taken" : "available");
    }, 400);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [password, mode]);

  function switchMode(nextMode) {
    setMode(nextMode);
    setError("");
    setPassword("");
    setPasswordStatus(null);
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    const trimmedName = normalizeName(name);
    const trimmedPassword = normalizePassword(password);

    if (!trimmedName || !trimmedPassword) {
      setError("Preencha o nome e a senha.");
      return;
    }

    setSubmitting(true);
    const { data, error: fetchError } = await supabase
      .from(PLAYERS_TABLE)
      .select("id, name, unit, best_correct, best_wrong, password")
      .eq("name", trimmedName)
      .maybeSingle();
    setSubmitting(false);

    if (fetchError) {
      setError("Não foi possível verificar o usuário. Tente novamente.");
      return;
    }
    if (!data) {
      setError(
        "Usuário não encontrado. Verifique se você digitou o nome corretamente ou crie o seu usuário."
      );
      return;
    }
    if (data.password !== trimmedPassword) {
      setError("Senha incorreta.");
      return;
    }

    onEnter(data);
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError("");

    const trimmedName = normalizeName(name);
    const digits = normalizePassword(password);

    if (!trimmedName) {
      setError("Digite um nome.");
      return;
    }
    if (!unit) {
      setError("Escolha a unidade.");
      return;
    }
    if (!/^\d{1,4}$/.test(digits)) {
      setError("A senha deve ter até 4 dígitos numéricos.");
      return;
    }

    setSubmitting(true);

    const { data: existingName } = await supabase
      .from(PLAYERS_TABLE)
      .select("id")
      .eq("name", trimmedName)
      .maybeSingle();

    if (existingName) {
      setSubmitting(false);
      setError("Esse nome já existe. Entre com ele ou escolha outro nome.");
      return;
    }

    const { data: existingPassword } = await supabase
      .from(PLAYERS_TABLE)
      .select("id")
      .eq("password", digits)
      .maybeSingle();

    if (existingPassword) {
      setSubmitting(false);
      setPasswordStatus("taken");
      setError("Essa senha já está em uso. Escolha outra.");
      return;
    }

    const { data: created, error: insertError } = await supabase
      .from(PLAYERS_TABLE)
      .insert({
        name: trimmedName,
        password: digits,
        unit,
        best_correct: 0,
        best_wrong: 0,
      })
      .select("id, name, unit, best_correct, best_wrong, password")
      .single();

    setSubmitting(false);

    if (insertError) {
      // condição de corrida: alguém cadastrou o mesmo nome/senha entre as checagens acima e o insert
      setError("Nome ou senha já em uso. Tente novamente com outros dados.");
      return;
    }

    onEnter(created);
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
      <h1 className="text-[15px] font-semibold text-ink">
        {mode === "login" ? "Entrar para jogar" : "Criar usuário"}
      </h1>
    </div>
  );

  if (!isSupabaseConfigured) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col">
        {topBar}
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-error-tint text-error">
            <IconX className="size-6" />
          </div>
          <p className="max-w-xs text-[15px] text-ink-muted">
            O Supabase ainda não foi configurado. Preencha{" "}
            <code className="rounded bg-black/5 px-1 py-0.5 text-sm">
              VITE_SUPABASE_URL
            </code>{" "}
            e{" "}
            <code className="rounded bg-black/5 px-1 py-0.5 text-sm">
              VITE_SUPABASE_ANON_KEY
            </code>{" "}
            no arquivo <code className="rounded bg-black/5 px-1 py-0.5 text-sm">.env</code>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      {topBar}

      <div className="flex flex-1 flex-col justify-center px-6 py-8">
        <form
          onSubmit={mode === "login" ? handleLogin : handleCreate}
          className="flex w-full flex-col gap-4"
        >
          <div>
            <label className="text-xs font-semibold tracking-[0.12em] text-royal uppercase">
              Nome
            </label>
            <input
              type="text"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="characters"
              enterKeyHint="next"
              placeholder="SEU NOME"
              value={name}
              onChange={(e) => setName(e.target.value.toUpperCase())}
              autoFocus
              className="mt-2 w-full rounded-2xl border border-line bg-white px-5 py-4 text-lg font-semibold uppercase tracking-wide text-ink placeholder:text-line-strong placeholder:normal-case focus:border-royal"
            />
          </div>

          {mode === "create" && (
            <div>
              <label className="text-xs font-semibold tracking-[0.12em] text-royal uppercase">
                Unidade
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-line bg-white px-5 py-4 text-[15px] font-medium text-ink focus:border-royal"
              >
                <option value="" disabled>
                  Selecione a unidade
                </option>
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold tracking-[0.12em] text-royal uppercase">
              Senha (até 4 dígitos)
            </label>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="off"
              maxLength={4}
              enterKeyHint="done"
              placeholder="0000"
              value={password}
              onChange={(e) => setPassword(normalizePassword(e.target.value))}
              className="tnum mt-2 w-full rounded-2xl border border-line bg-white px-5 py-4 text-center text-2xl font-semibold tracking-[0.4em] text-ink placeholder:text-line-strong focus:border-royal"
            />

            {mode === "create" && passwordStatus && (
              <p
                className={`mt-2 flex items-center gap-1.5 text-sm font-medium ${
                  passwordStatus === "available"
                    ? "text-success"
                    : passwordStatus === "taken"
                      ? "text-error"
                      : "text-ink-muted"
                }`}
              >
                {passwordStatus === "checking" && (
                  <>
                    <IconLoader className="size-3.5" /> Verificando…
                  </>
                )}
                {passwordStatus === "available" && (
                  <>
                    <IconCheck className="size-3.5" /> Senha disponível
                  </>
                )}
                {passwordStatus === "taken" && (
                  <>
                    <IconX className="size-3.5" /> Senha já em uso
                  </>
                )}
              </p>
            )}
          </div>

          {error && (
            <div className="rounded-2xl bg-error-tint px-4 py-3 text-sm font-medium text-error">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            className="mt-2 w-full"
            disabled={submitting}
          >
            {submitting ? (
              <IconLoader className="size-4.5" />
            ) : mode === "login" ? (
              "Entrar e jogar"
            ) : (
              "Criar e jogar"
            )}
          </Button>
        </form>

        <div className="mt-6 flex justify-center">
          {mode === "login" ? (
            <button
              onClick={() => switchMode("create")}
              className="text-sm font-medium text-ink-muted underline decoration-line-strong underline-offset-4 hover:text-ink"
            >
              Criar usuário
            </button>
          ) : (
            <button
              onClick={() => switchMode("login")}
              className="text-sm font-medium text-ink-muted underline decoration-line-strong underline-offset-4 hover:text-ink"
            >
              Já tenho usuário
            </button>
          )}
        </div>
      </div>
    </div>
  );
}