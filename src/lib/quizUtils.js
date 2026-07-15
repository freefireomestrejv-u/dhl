export function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Normaliza texto para comparar respostas ignorando acentos, til, cedilha,
// maiúsculas/minúsculas e espaços nas pontas. Ex: "maca gala" === "Maçã Gala".
export function normalizeAnswer(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();
}