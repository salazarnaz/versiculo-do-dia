export default {
  async fetch() {
    const MAX_TENTATIVAS = 5;
    const VERSION = "acf"; // change if you want: "ra", "nvi", etc.

    const livros = [
      { nome: "Salmos", caps: 150 },
      { nome: "Provérbios", caps: 31 },
      { nome: "Isaías", caps: 66 },
      { nome: "Mateus", caps: 28 },
      { nome: "João", caps: 21 },
      { nome: "Romanos", caps: 16 }
    ];

    const now = new Date();
    const dayKey = now.toISOString().slice(0, 10);

    let seed = parseInt(dayKey.replace(/-/g, ""), 10);

    const next = (max) => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed % max;
    };

    // --- NEW: load ABibliaDigital books once per request, then map name -> abbrev.pt
    let booksIndex = null;
    try {
      const booksResp = await fetch("https://www.abibliadigital.com.br/api/books");
      if (!booksResp.ok) throw new Error(`Books HTTP ${booksResp.status}`);
      const books = await booksResp.json();

      // Build a lookup: normalized name -> abbrev.pt (e.g., "salmos" -> "sl")
      booksIndex = new Map(
        (books || []).map((b) => [
          normalize(b?.name),
          b?.abbrev?.pt
        ])
      );
    } catch (err) {
      // If books endpoint fails, we can’t reliably map abbreviations.
      return new Response(JSON.stringify({ error: `Failed to load books: ${err.message}` }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    let referencia = null;
    let texto = null;

    for (let i = 0; i < MAX_TENTATIVAS; i++) {
      const livro = livros[next(livros.length)];
      const capitulo = next(livro.caps) + 1;
      const versiculo = next(40) + 1;

      const abbrev = booksIndex.get(normalize(livro.nome));
      if (!abbrev) {
        // try next attempt if the book name didn't match
        continue;
      }

      referencia = `${livro.nome} ${capitulo}:${versiculo}`;

      // ABibliaDigital verse endpoint: /api/verses/{version}/{book}/{chapter}/{verse}
      const url = `https://www.abibliadigital.com.br/api/verses/${encodeURIComponent(VERSION)}/${encodeURIComponent(abbrev)}/${capitulo}/${versiculo}`;

      try {
        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

        const data = await resp.json();

        // ABibliaDigital commonly returns { text: "...", book: {...}, chapter: X, number: Y }
        // Keep extraction robust in case format differs.
        texto =
          (typeof data?.text === "string" && data.text.trim()) ||
          (typeof data?.verse?.text === "string" && data.verse.text.trim()) ||
          (typeof data?.verses?.[0]?.text === "string" && data.verses[0].text.trim()) ||
          null;

        if (texto) {
          // KEEP your return style (JSON)
          return new Response(JSON.stringify({ referencia, texto }), {
            headers: { "Content-Type": "application/json" }
          });
        }
      } catch (err) {
        // KEEP your behavior: return error immediately
        return new Response(JSON.stringify({ referencia, error: err.message }), {
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    if (!texto) {
      referencia = "Provérbios 3:5";
      texto = "Erro";
    }

    return new Response(JSON.stringify({ data: dayKey, referencia, texto }), {
      headers: { "Content-Type": "application/json" }
    });
  }
};

// helper to match names with accents/case differences
function normalize(s) {
  return (s || "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}
