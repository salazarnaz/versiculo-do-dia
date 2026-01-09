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

    const now = new Date();
    const slot = Math.floor(now.getTime() / (ROTATE_EVERY_HOURS * 60 * 60 * 1000));

    let seed = 0;
    for (const c of String(slot)) seed = (seed * 31 + c.charCodeAt(0)) >>> 0;

    const rand = (max) => seed % max;

    const livro = livros[rand(livros.length)];
    seed = (seed * 1103515245 + 12345) >>> 0;

    const capitulo = (seed % livro.caps) + 1;
    seed = (seed * 1103515245 + 12345) >>> 0;

    const versiculo = (seed % 20) + 1;

    const referencia = `${livro.nome} ${capitulo}:${versiculo}`;
    const url = `https://api.biblesupersearch.com/api?bible=almeida_rc&reference=${encodeURIComponent(referencia)}`;

    let texto = "Versículo não encontrado";

    try {
      const resp = await fetch(url);
      const data = await resp.json();
      if (data?.results?.length > 0) {
        texto = data.results[0].text.trim();
      }
    } catch (e) {
      texto = "Versículo não encontrado (erro de API)";
    }

    const saida = `“${texto}”\n${livro.nome} ${capitulo}:${versiculo}`;

    return new Response(saida, {
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });
  }
};
