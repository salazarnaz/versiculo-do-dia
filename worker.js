export default {
  async fetch(request) {
    const ROTATE_EVERY_HOURS = 24;
 
    const livros = [
      { nome: "Salmos", caps: 150 },
      { nome: "Provérbios", caps: 31 },
      { nome: "Isaías", caps: 66 },
      { nome: "Mateus", caps: 28 },
      { nome: "João", caps: 21 },
      { nome: "Romanos", caps: 16 }
    ];

    const slot = Math.floor(Date.now() / (ROTATE_EVERY_HOURS * 60 * 60 * 1000));

    let seed = 0;
    for (const c of String(slot)) seed = (seed * 31 + c.charCodeAt(0)) >>> 0;

    const rand = (max) => seed % max;

    const livro = livros[rand(livros.length)];
    seed = (seed * 1103515245 + 12345) >>> 0;

    const capitulo = (seed % livro.caps) + 1;
    seed = (seed * 1103515245 + 12345) >>> 0;

    const versiculo = (seed % 15) + 1;

    const referencia = `${livro.nome} ${capitulo}:${versiculo}`;
    const url = `https://api.biblesupersearch.com/api?bible=almeida_rc&reference=${encodeURIComponent(referencia)}`;

    let texto;

    try {
      const resp = await fetch(url);
      const data = await resp.json();
      texto = data?.results?.[0]?.text?.trim() || null;
    } catch {
      texto = null;
    }

    if (!texto) {
      texto = "Confia no Senhor de todo o teu coração, e Ele dirigirá teus caminhos.";
    }

    // Retorna apenas JSON limpo
    return new Response(JSON.stringify({ referencia, texto }), {
      headers: { "Content-Type": "application/json" }
    });
  }
};
