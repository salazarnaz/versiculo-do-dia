export default {
  async fetch() {
    const MAX_TENTATIVAS = 5;
    const livros = [
      // 📜 Antigo Testamento
      { nome: "Gênesis", caps: 50 },
      { nome: "Êxodo", caps: 40 },
      { nome: "Levítico", caps: 27 },
      { nome: "Deuteronômio", caps: 34 },
      { nome: "Josué", caps: 24 },
      { nome: "Juízes", caps: 21 },
      { nome: "Rute", caps: 4 },
      { nome: "1 Samuel", caps: 31 },
      { nome: "2 Samuel", caps: 24 },
      { nome: "1 Reis", caps: 22 },
      { nome: "2 Reis", caps: 25 },
      { nome: "1 Crônicas", caps: 29 },
      { nome: "2 Crônicas", caps: 36 },
      { nome: "Esdras", caps: 10 },
      { nome: "Neemias", caps: 13 },
      { nome: "Ester", caps: 10 },
      { nome: "Jó", caps: 42 },
      { nome: "Salmos", caps: 150 },
      { nome: "Provérbios", caps: 31 },
      { nome: "Eclesiastes", caps: 12 },
      { nome: "Cânticos", caps: 8 },
      { nome: "Isaías", caps: 66 },
      { nome: "Jeremias", caps: 52 },
      { nome: "Lamentações", caps: 5 },
      { nome: "Ezequiel", caps: 48 },
      { nome: "Daniel", caps: 12 },
      { nome: "Oséias", caps: 14 },
      { nome: "Joel", caps: 3 },
      { nome: "Amós", caps: 9 },
      { nome: "Obadias", caps: 1 },
      { nome: "Jonas", caps: 4 },
      { nome: "Miquéias", caps: 7 },
      { nome: "Naum", caps: 3 },
      { nome: "Habacuque", caps: 3 },
      { nome: "Sofonias", caps: 3 },
      { nome: "Ageu", caps: 2 },
      { nome: "Zacarias", caps: 14 },
      { nome: "Malaquias", caps: 4 },
    
      // 📖 Novo Testamento
      { nome: "Mateus", caps: 28 },
      { nome: "Marcos", caps: 16 },
      { nome: "Lucas", caps: 24 },
      { nome: "João", caps: 21 },
      { nome: "Atos", caps: 28 },
      { nome: "Romanos", caps: 16 },
      { nome: "1 Coríntios", caps: 16 },
      { nome: "2 Coríntios", caps: 13 },
      { nome: "Gálatas", caps: 6 },
      { nome: "Efésios", caps: 6 },
      { nome: "Filipenses", caps: 4 },
      { nome: "Colossenses", caps: 4 },
      { nome: "1 Tessalonicenses", caps: 5 },
      { nome: "2 Tessalonicenses", caps: 3 },
      { nome: "1 Timóteo", caps: 6 },
      { nome: "2 Timóteo", caps: 4 },
      { nome: "Tito", caps: 3 },
      { nome: "Filemom", caps: 1 },
      { nome: "Hebreus", caps: 13 },
      { nome: "Tiago", caps: 5 },
      { nome: "1 Pedro", caps: 5 },
      { nome: "2 Pedro", caps: 3 },
      { nome: "1 João", caps: 5 },
      { nome: "2 João", caps: 1 },
      { nome: "3 João", caps: 1 },
      { nome: "Judas", caps: 1 },
      { nome: "Apocalipse", caps: 22 }
    ];

    const now = new Date();
    const dayKey = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/New_York",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(now);

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
      referencia = ${livro.nome} ${capitulo}:${versiculo};
      // referencia = "Provérbios 3:5"; // <- test line if you want

      // IMPORTANT: request minimal format so results are easy to parse
      const url = https://api.biblesupersearch.com/api?bible=almeida_rc&data_format=minimal&reference=${encodeURIComponent(referencia)};

      try {
        const resp = await fetch(url);
        if (!resp.ok) throw new Error(HTTP ${resp.status});

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
      referencia = "Erro";
      texto = "Erro";
    }

    return new Response(JSON.stringify({ data: dayKey, referencia, texto }), {
      headers: { "Content-Type": "application/json" }
    });
  }
};
