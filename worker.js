export default {
  async fetch(request) {
    const MAX_TENTATIVAS = 5;

    const livros = [
      { nome: "Salmos", caps: 150 },
      { nome: "Provérbios", caps: 31 },
      { nome: "Isaías", caps: 66 },
      { nome: "Mateus", caps: 28 },
      { nome: "João", caps: 21 },
      { nome: "Romanos", caps: 16 }
    ];

    // 📅 Data do calendário (UTC)
    const now = new Date();
    const dayKey = `${now.getUTCFullYear()}-${now.getUTCMonth() + 1}-${now.getUTCDate()}`;

    // Seed determinística baseada no dia
   let seed = now.getUTCFullYear() + now.getUTCMonth() + now.getUTCDate();
    for (const c of dayKey) seed = (seed * 31 + c.charCodeAt(0)) >>> 0;

    const dayKey = now.toISOString().split('T')[0]; // formata para YYYY-MM-DD
let seed = parseInt(dayKey.replace(/-/g, ''), 10); // Converte a data em um número

    const next = (max) => {
      seed = (seed * 1103515245 + 12345) >>> 0;
      return seed % max;
    };

    let referencia = null;
    let texto = null;

    for (let i = 0; i < MAX_TENTATIVAS; i++) {
      const livro = livros[next(livros.length)];
      const capitulo = next(livro.caps) + 1;
      const versiculo = next(20) + 1;

      referencia = `${livro.nome} ${capitulo}:${versiculo}`;
      const url = `https://api.biblesupersearch.com/api?bible=almeida_rc&reference=${encodeURIComponent(referencia)}`;

      try {
        const resp = await fetch(url);
        const data = await resp.json();

        const entry = data?.results && Object.values(data.results)[0];
        texto = entry?.text?.trim();

        if (texto) break;
      } catch {
        // tenta novamente
      }
    }

    // Fallback final
    if (!texto) {
      referencia = "Provérbios 3:5";
      texto = "Confia no Senhor de todo o teu coração, e não te estribes no teu próprio entendimento.";
    }

    return new Response(
      JSON.stringify({
        data: dayKey,
        referencia,
        texto
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  }
};
