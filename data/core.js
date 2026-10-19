// Registro de escenas, artistas y movimientos del techno según Techno Rebels de Dan Sicko. Cada fichero de capítulo (data/NN-*.js,
// escritos a mano leyendo el libro) llama a TECHNO.chapter({...}) y TECHNO.add([...], n).
// Los datos se fusionan por id: los arrays se unen y cada capítulo puede añadir
// discos, citas (refs) y una nota propia sobre una escena ya definida en otro.
window.TECHNO = (function () {
  const genres = new Map();
  const chapters = [];

  const FAMILIES = {
    raices:      { name: 'Raíces: Kraftwerk, electro, funk, italo y new wave', color: '#a78bfa' },
    fiestas:     { name: 'Detroit antes del techno: clubes sociales y fiestas de instituto', color: '#d97706' },
    radio:       { name: 'Radio, clubes y DJs: Mojo, Ken Collier, The Wizard, Music Institute', color: '#facc15' },
    pioneros:    { name: 'Los pioneros: Atkins, May, Saunderson y la primera ola', color: '#ef4444' },
    house:       { name: 'House: Chicago, Nueva York y el garaje', color: '#ec4899' },
    europa:      { name: 'Europa: rave británico, Bélgica, Berlín, Países Bajos', color: '#38bdf8' },
    underground: { name: 'Segunda ola de Detroit: UR, Plus 8, Carl Craig', color: '#16a34a' },
    electro:     { name: 'Electro de Detroit, Drexciya y ghettotech', color: '#2dd4bf' },
    futuro:      { name: 'Después: minimal, jazz, Ghostly, el festival de Detroit', color: '#a3e635' },
    industria:   { name: 'Industria, prensa y «electronica»', color: '#e5e7eb' },
  };

  const key = (t) => (t.a + '|' + t.t).toLowerCase();

  function mergeArr(a = [], b = [], k = (x) => (typeof x === 'string' ? x.toLowerCase() : JSON.stringify(x))) {
    const seen = new Set(a.map(k));
    const out = a.slice();
    for (const x of b) if (!seen.has(k(x))) { seen.add(k(x)); out.push(x); }
    return out;
  }

  // Anota en cada disco los capítulos que lo citan.
  function cite(tracks, t, ch) {
    const m = tracks.find((x) => key(x) === key(t));
    if (m && ch != null) m.chs = mergeArr(m.chs, [ch]);
  }

  function add(list, chapter) {
    for (const g of list) {
      let cur = genres.get(g.id);
      if (!cur) {
        cur = { id: g.id, aka: [], influences: [], artists: [], tracks: [], labels: [], refs: [], notes: [], chapters: [] };
        genres.set(g.id, cur);
      }
      for (const f of ['aka', 'influences', 'artists', 'labels']) cur[f] = mergeArr(cur[f], g[f]);
      cur.tracks = mergeArr(cur.tracks, (g.tracks || []).map((t) => ({ ...t })), key);
      for (const t of g.tracks || []) {
        if (t.ess) { const m = cur.tracks.find((x) => key(x) === key(t)); if (m) m.ess = 1; }
        cite(cur.tracks, t, chapter);
      }
      cur.refs = mergeArr(cur.refs, (g.refs || []).map((r) => ({ ch: chapter, ...r })), (r) => r.q);
      for (const f of ['name', 'family', 'start', 'end', 'place', 'desc']) if (g[f] != null && cur[f] == null) cur[f] = g[f];
      if (g.desc != null) cur.descCh = cur.descCh ?? chapter;
      if (g.note) cur.notes.push({ ch: chapter, text: g.note });
      if (chapter != null && !cur.chapters.includes(chapter)) cur.chapters.push(chapter);
    }
  }

  return {
    FAMILIES,
    chapters,
    genres,
    chapter(meta) { chapters.push(meta); },
    add,
  };
})();
