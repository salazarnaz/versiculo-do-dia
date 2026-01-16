export default {
  async fetch() {
    const MAX_TENTATIVAS = 5;
    const livros = [
      { nome: "Salmos", caps: 150 },
      { nome: "Provérbios", caps: 31 },
      { nome: "Isaías", caps: 66 },
      { nome: "Mateus", caps: 28 },
      { nome: "João", caps: 21 },
      { nome: "Romanos", caps: 16 }
    ];

    const now = new Date();
    now.setDate(now.getDate() + 2);
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

      // Use the random reference (or temporarily hardcode if you want to test)
      referencia = `${livro.nome} ${capitulo}:${versiculo}`;
      // referencia = "Provérbios 3:5"; // <- test line if you want

      // IMPORTANT: request minimal format so results are easy to parse
      const url = `https://api.biblesupersearch.com/api?bible=almeida_rc&data_format=minimal&reference=${encodeURIComponent(referencia)}`;

      try {
        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

        const data = await resp.json();

        // minimal format: results.almeida_rc is an array of verse objects
        texto = data?.results?.almeida_rc?.[0]?.text?.trim() ?? null;
        
        if (texto) {
          return new Response(JSON.stringify({ referencia, texto }), {
            headers: { "Content-Type": "application/json" }
          });
        }
        // if no text, loop again to try another random verse
      } catch (err) {
        // keep your existing behavior: return the error immediately
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
