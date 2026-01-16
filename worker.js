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

    // Data em UTC YYYY-MM-DD
    const now = new Date();
    const dayKey = now.toISOString().slice(0, 10);

    // seed determinística baseada na data (YYYYMMDD)
    let seed = parseInt(dayKey.replace(/-/g, ''), 10);

    // LCG PRNG
    const next = (max) => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed % max;
    };

    let referencia = null;
    let texto = null;

    for (let i = 0; i < MAX_TENTATIVAS; i++) {
      const livro = livros[next(livros.length)];
      const capitulo = next(livro.caps) + 1;
      // escolhe versículo entre 1 e 40 (ajuste se quiser outro limite)
      const versiculo = next(40) + 1;

   const referencia = 'Provérbios 3:5';
const url = `https://api.biblesupersearch.com/api?bible=almeida_rc&reference=${encodeURIComponent(referencia)}`;

try {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const data = await resp.json();
  // exemplo seguro de extração (ajuste se a API tiver outro formato)
  const entry = data?.results && Object.values(data.results)[0];
  const texto = entry?.text?.trim();
  if (texto) {
    return new Response(JSON.stringify({ referencia, texto }), { headers: { 'Content-Type': 'application/json' } });
  } else {
    // fallback quando não há texto
    return new Response(JSON.stringify({ referencia, texto: 'Texto não encontrado' }), { headers: { 'Content-Type': 'application/json' } });
  }
} catch (err) {
  return new Response(JSON.stringify({ referencia, error: err.message }), { headers: { 'Content-Type': 'application/json' } });
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
