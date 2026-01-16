export default {
  async fetch() {
    const MAX_TENTATIVAS = 5;
    const VERSION = "acf"; // change if you want (e.g., "ra", "nvi")

    const livros = [
      { nome: "Salmos", caps: 150, abrev: "sl" },
      { nome: "Provérbios", caps: 31, abrev: "pv" },
      { nome: "Isaías", caps: 66, abrev: "is" },
      { nome: "Mateus", caps: 28, abrev: "mt" },
      { nome: "João", caps: 21, abrev: "jo" },
      { nome: "Romanos", caps: 16, abrev: "rm" }
    ];

    const now = new Date();
    const dayKey = now.toISOString().slice(0, 10);

    let seed = parseInt(dayKey.replace(/-/g, ""), 10);

    const next = (max) => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed % max;
    };

    let referencia = null;
    let texto = null;

    for (let i = 0; i < MAX_TENTATIVAS; i++) {
      const livro = livros[next(livros.length)];
      const capitulo = next(livro.caps) + 1;
      const versiculo = next(40) + 1;

      referencia = `${livro.nome} ${capitulo}:${versiculo}`;

      // ABíbliaDigital: /api/verses/{version}/{bookAbbrev}/{chapter}/{verse}
      const url = `https://www.abibliadigital.com.br/api/verses/${encodeURIComponent(
        VERSION
      )}/${encodeURIComponent(livro.abrev)}/${capitulo}/${versiculo}`;

      try {
        const resp = await fetch(url, {
          headers: {
            // Optional: if you have a token, uncomment and set it
            // Authorization: `Bearer ${ABIBLIA_TOKEN}`,
          }
        });

        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

        const data = await resp.json();

        // Common response has: { text: "...", ... }
        texto =
          (typeof data?.text === "string" && data.text.trim()) ||
          (typeof data?.verse?.text === "string" && data.verse.text.trim()) ||
          (typeof data?.verses?.[0]?.text === "string" && data.verses[0].text.trim()) ||
          null;

        if (texto) {
          return new Response(JSON.stringify({ referencia, texto }), {
            headers: { "Content-Type": "application/json" }
          });
        }
      } catch (err) {
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
