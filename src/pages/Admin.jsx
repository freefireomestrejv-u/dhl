import { useEffect, useState } from "react";
import {
  supabase,
  isSupabaseConfigured,
  ITEMS_TABLE,
  IMAGES_BUCKET,
} from "../lib/supabaseClient";
import Button from "../components/Button";
import {
  IconArrowLeft,
  IconUpload,
  IconTrash,
  IconLoader,
  IconX,
  IconEdit,
  IconHelp,
} from "../components/icons";

const SESSION_KEY = "sj_admin_ok";
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;
const hasPasswordProtection = Boolean(ADMIN_PASSWORD);

function storagePathFromUrl(url) {
  if (!url) return null;
  const marker = `/object/public/${IMAGES_BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.slice(idx + marker.length);
}

// Reduz a foto para no máximo 1000px no lado maior e recomprime em JPEG.
function resizeImage(file, maxDimension = 1000, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(objectUrl);
          if (blob) resolve(blob);
          else reject(new Error("Falha ao comprimir imagem"));
        },
        "image/jpeg",
        quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Falha ao carregar imagem"));
    };
    img.src = objectUrl;
  });
}

export default function Admin({ onBack }) {
  const [authed, setAuthed] = useState(!hasPasswordProtection);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (hasPasswordProtection) {
      setAuthed(sessionStorage.getItem(SESSION_KEY) === "1");
    }
  }, []);

  function handlePasswordSubmit(e) {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, "1");
      setAuthed(true);
    } else {
      setPasswordError("Senha incorreta.");
    }
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
      <h1 className="text-[15px] font-semibold text-ink">Painel do admin</h1>
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

  if (!authed) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col">
        {topBar}
        <div className="flex flex-1 flex-col items-center justify-center px-6">
          <form
            onSubmit={handlePasswordSubmit}
            className="flex w-full flex-col items-center gap-4 text-center"
          >
            <h2 className="text-lg font-semibold text-ink">Área restrita</h2>
            <p className="text-sm text-ink-muted">
              Digite a senha de administrador para continuar.
            </p>
            <input
              type="password"
              autoFocus
              value={passwordInput}
              onChange={(e) => {
                setPasswordInput(e.target.value);
                setPasswordError("");
              }}
              className="w-full rounded-2xl border border-line bg-white px-5 py-4 text-center text-base text-ink focus:border-royal"
              placeholder="Senha"
            />
            {passwordError && (
              <p className="text-sm font-medium text-error">{passwordError}</p>
            )}
            <Button type="submit" variant="primary" className="w-full">
              Entrar
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return <AdminPanel topBar={topBar} />;
}

const EMPTY_FORM = {
  itemType: "produto",
  name: "",
  code: "",
  unitType: "unidade",
};

function AdminPanel({ topBar }) {
  const [items, setItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [itemType, setItemType] = useState(EMPTY_FORM.itemType);
  const [name, setName] = useState(EMPTY_FORM.name);
  const [code, setCode] = useState(EMPTY_FORM.code);
  const [unitType, setUnitType] = useState(EMPTY_FORM.unitType);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [confirmingId, setConfirmingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    setItemsLoading(true);
    const { data, error } = await supabase
      .from(ITEMS_TABLE)
      .select("id, name, code, image_url, unit_type, item_type, created_at")
      .order("created_at", { ascending: false });
    if (!error) setItems(data ?? []);
    setItemsLoading(false);
  }

  function resetForm() {
    setEditingId(null);
    setItemType(EMPTY_FORM.itemType);
    setName(EMPTY_FORM.name);
    setCode(EMPTY_FORM.code);
    setUnitType(EMPTY_FORM.unitType);
    setImageFile(null);
    setImagePreviewUrl(null);
    setExistingImageUrl(null);
    setSubmitError("");
  }

  function startEdit(item) {
    setEditingId(item.id);
    setItemType(item.item_type || "produto");
    setName(item.name);
    setCode(item.code);
    setUnitType(item.unit_type || "unidade");
    setImageFile(null);
    setImagePreviewUrl(null);
    setExistingImageUrl(item.image_url);
    setSubmitError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const resizedBlob = await resizeImage(file);
      const resizedFile = new File(
        [resizedBlob],
        file.name.replace(/\.\w+$/, ".jpg"),
        { type: "image/jpeg" }
      );
      setImageFile(resizedFile);
      setImagePreviewUrl(URL.createObjectURL(resizedFile));
    } catch (err) {
      setImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError("");

    if (!name.trim() || !code.trim()) {
      setSubmitError(
        itemType === "situacao"
          ? "Preencha a situação e a letra/código."
          : "Preencha o nome e o código."
      );
      return;
    }

    setSubmitting(true);
    try {
      let imageUrl = itemType === "situacao" ? null : editingId ? existingImageUrl : null;

      if (itemType === "produto" && imageFile) {
        const path = `${crypto.randomUUID()}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from(IMAGES_BUCKET)
          .upload(path, imageFile, {
            cacheControl: "31536000",
            upsert: false,
            contentType: "image/jpeg",
          });
        if (uploadError) throw uploadError;

        const { data: publicData } = supabase.storage
          .from(IMAGES_BUCKET)
          .getPublicUrl(path);
        imageUrl = publicData.publicUrl;
      }

      const payload = {
        item_type: itemType,
        name: name.trim(),
        code: code.trim(),
        unit_type: itemType === "produto" ? unitType : "unidade",
        image_url: imageUrl,
      };

      if (editingId) {
        const { data: updated, error: updateError } = await supabase
          .from(ITEMS_TABLE)
          .update(payload)
          .eq("id", editingId)
          .select()
          .single();
        if (updateError) throw updateError;
        setItems((prev) => prev.map((i) => (i.id === editingId ? updated : i)));
      } else {
        const { data: inserted, error: insertError } = await supabase
          .from(ITEMS_TABLE)
          .insert(payload)
          .select()
          .single();
        if (insertError) throw insertError;
        setItems((prev) => [inserted, ...prev]);
      }

      resetForm();
    } catch (err) {
      setSubmitError("Não foi possível salvar o item. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleDeleteClick(item) {
    if (confirmingId === item.id) {
      handleDelete(item);
      return;
    }
    setConfirmingId(item.id);
    setTimeout(() => {
      setConfirmingId((current) => (current === item.id ? null : current));
    }, 3000);
  }

  async function handleDelete(item) {
    setConfirmingId(null);
    setDeletingId(item.id);
    try {
      await supabase.from(ITEMS_TABLE).delete().eq("id", item.id);
      const path = storagePathFromUrl(item.image_url);
      if (path) {
        await supabase.storage.from(IMAGES_BUCKET).remove([path]);
      }
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      if (editingId === item.id) resetForm();
    } catch (err) {
      // falha silenciosa — o item continua na lista para nova tentativa
    } finally {
      setDeletingId(null);
    }
  }

  const previewSrc = imagePreviewUrl || existingImageUrl;

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col pb-16">
      {topBar}

      <form
        onSubmit={handleSubmit}
        className="mx-5 mt-6 flex flex-col gap-4 rounded-2xl border border-line bg-white p-5 shadow-[var(--shadow-card)]"
      >
        {editingId && (
          <div className="flex items-center justify-between rounded-xl bg-royal-tint px-3 py-2">
            <p className="text-xs font-semibold text-royal">Editando item</p>
            <button
              type="button"
              onClick={resetForm}
              className="text-xs font-semibold text-royal underline"
            >
              Cancelar
            </button>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-ink-muted">Tipo de item</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setItemType("produto")}
              className={`flex-1 rounded-xl border px-4 py-3 text-[15px] font-medium transition-colors ${
                itemType === "produto"
                  ? "border-royal bg-royal-tint text-royal"
                  : "border-line bg-white text-ink-muted hover:border-line-strong"
              }`}
            >
              Produto
            </button>
            <button
              type="button"
              onClick={() => setItemType("situacao")}
              className={`flex-1 rounded-xl border px-4 py-3 text-[15px] font-medium transition-colors ${
                itemType === "situacao"
                  ? "border-royal bg-royal-tint text-royal"
                  : "border-line bg-white text-ink-muted hover:border-line-strong"
              }`}
            >
              Situação
            </button>
          </div>
        </div>

        {itemType === "produto" && (
          <label className="sticker-edge relative flex aspect-4/3 w-full cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl bg-royal-tint/30 text-royal transition-colors hover:bg-royal-tint/50">
            {previewSrc ? (
              <>
                <img
                  src={previewSrc}
                  alt="Pré-visualização"
                  className="absolute inset-0 size-full object-cover"
                />
                <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">
                  Trocar foto
                </span>
              </>
            ) : (
              <>
                <IconUpload />
                <span className="text-sm font-medium">Adicionar foto</span>
                <span className="text-xs text-royal/70">opcional, mas recomendado</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-ink-muted" htmlFor="item-name">
            {itemType === "situacao" ? "Descrição da situação" : "Nome do item"}
          </label>
          {itemType === "situacao" ? (
            <textarea
              id="item-name"
              rows={3}
              placeholder="Ex: Cliente quer só consultar o preço de um item, sem levar na compra"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="resize-none rounded-xl border border-line bg-white px-4 py-3 text-[15px] leading-relaxed text-ink focus:border-royal"
            />
          ) : (
            <input
              id="item-name"
              type="text"
              placeholder="Ex: Pepino Japonês"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl border border-line bg-white px-4 py-3 text-[15px] text-ink focus:border-royal"
            />
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-ink-muted" htmlFor="item-code">
            {itemType === "situacao" ? "Letra ou código" : "Código"}
          </label>
          <input
            id="item-code"
            type="text"
            inputMode={itemType === "situacao" ? "text" : "numeric"}
            placeholder={itemType === "situacao" ? "Ex: C, R, F11" : "Ex: 4062"}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="tnum rounded-xl border border-line bg-white px-4 py-3 text-[15px] uppercase tracking-wider text-ink focus:border-royal"
          />
        </div>

        {itemType === "produto" && (
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-ink-muted">Tipo de contagem</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setUnitType("unidade")}
                className={`flex-1 rounded-xl border px-4 py-3 text-[15px] font-medium transition-colors ${
                  unitType === "unidade"
                    ? "border-royal bg-royal-tint text-royal"
                    : "border-line bg-white text-ink-muted hover:border-line-strong"
                }`}
              >
                Unidade
              </button>
              <button
                type="button"
                onClick={() => setUnitType("peso")}
                className={`flex-1 rounded-xl border px-4 py-3 text-[15px] font-medium transition-colors ${
                  unitType === "peso"
                    ? "border-royal bg-royal-tint text-royal"
                    : "border-line bg-white text-ink-muted hover:border-line-strong"
                }`}
              >
                Peso
              </button>
            </div>
          </div>
        )}

        {submitError && (
          <p className="text-sm font-medium text-error">{submitError}</p>
        )}

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={submitting}
          icon={submitting ? <IconLoader className="size-4.5 animate-spin" /> : null}
        >
          {submitting
            ? "Salvando…"
            : editingId
              ? "Salvar alterações"
              : "Adicionar item"}
        </Button>
      </form>

      <div className="mx-5 mt-8 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink-muted">
          Itens cadastrados {items.length > 0 && `(${items.length})`}
        </h2>
      </div>

      <div className="mx-5 mt-3 flex flex-col gap-2">
        {itemsLoading && (
          <div className="flex items-center justify-center gap-2 py-8 text-ink-muted">
            <IconLoader className="size-4.5 animate-spin" />
            <span className="text-sm">Carregando…</span>
          </div>
        )}

        {!itemsLoading && items.length === 0 && (
          <p className="rounded-2xl border border-dashed border-line-strong px-4 py-6 text-center text-sm text-ink-muted">
            Nenhum item cadastrado ainda. Adicione o primeiro acima.
          </p>
        )}

        {!itemsLoading &&
          items.map((item) => (
            <div
              key={item.id}
              className={`flex items-center gap-3 rounded-xl border bg-white p-2.5 ${
                editingId === item.id ? "border-royal" : "border-line"
              }`}
            >
              <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-royal-tint/40">
                {item.item_type === "situacao" ? (
                  <IconHelp className="size-5 text-royal/60" />
                ) : item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="size-full object-cover"
                  />
                ) : (
                  <IconUpload className="size-4 text-royal/40" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p
                  className={`text-[14px] font-medium text-ink ${
                    item.item_type === "situacao" ? "line-clamp-2" : "truncate"
                  }`}
                >
                  {item.name}
                </p>
                <div className="flex items-center gap-1.5">
                  <p className="tnum font-mono text-xs text-ink-muted">{item.code}</p>
                  <span className="rounded-full bg-black/[0.04] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
                    {item.item_type === "situacao"
                      ? "Situação"
                      : item.unit_type === "peso"
                        ? "Peso"
                        : "Unidade"}
                  </span>
                </div>
              </div>

              <button
                onClick={() => startEdit(item)}
                className="flex h-9 shrink-0 items-center justify-center rounded-lg px-2.5 text-ink-muted transition-colors hover:bg-royal-tint hover:text-royal"
                aria-label="Editar item"
              >
                <IconEdit />
              </button>

              <button
                onClick={() => handleDeleteClick(item)}
                disabled={deletingId === item.id}
                className={`flex h-9 shrink-0 items-center justify-center rounded-lg px-3 text-xs font-semibold transition-colors ${
                  confirmingId === item.id
                    ? "bg-error text-white"
                    : "text-ink-muted hover:bg-error-tint hover:text-error"
                }`}
              >
                {deletingId === item.id ? (
                  <IconLoader className="size-4 animate-spin" />
                ) : confirmingId === item.id ? (
                  "Confirmar?"
                ) : (
                  <IconTrash />
                )}
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}
