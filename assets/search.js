(function () {
  var input = document.querySelector(".find-q");
  if (!input) return;
  var drop = document.querySelector(".find-out");
  var pageOut = document.getElementById("out");
  var rows = null;
  function fold(s) {
    return String(s)
      .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, "")
      .replace(/[أإآٱ]/g, "ا")
      .replace(/ى/g, "ي")
      .replace(/ؤ/g, "و")
      .replace(/ئ/g, "ي")
      .replace(/ة/g, "ه")
      .replace(/[^\u0621-\u064A\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
  var SKIP = { "بن": 1, "ابن": 1, "بنت": 1 };
  function bits(s) {
    if (!s) return [];
    return s.split(" ").map(function (w) {
      return w.indexOf("ال") === 0 && w.length > 4 ? w.slice(2) : w;
    }).filter(function (w) { return w && !SKIP[w]; });
  }
  function starts(hay, qws) {
    var hw = bits(hay);
    if (hw.length < qws.length) return false;
    for (var i = 0; i < qws.length; i++) if (hw[i].indexOf(qws[i]) !== 0) return false;
    return true;
  }
  function contains(hay, qws) {
    var hw = bits(hay);
    var i = 0;
    for (var k = 0; k < qws.length; k++) {
      while (i < hw.length && hw[i].indexOf(qws[k]) !== 0) i++;
      if (i >= hw.length) return false;
      i++;
    }
    return true;
  }
  function score(row, qws) {
    if (starts(row[3], qws) || starts(row[4], qws)) return 0;
    if (starts(row[5], qws)) return 1;
    if (contains(row[4], qws)) return 2;
    if (contains(row[3], qws)) return 3;
    if (contains(row[5], qws)) return 4;
    return -1;
  }
  function kind(g) { return g === "s" ? "صحابي" : g === "t" ? "تابعي" : ""; }
  function clip(s) { return s.length > 90 ? s.slice(0, 90) + "…" : s; }
  function render(list, note) {
    var target = pageOut || drop;
    if (!target) return;
    if (drop && target !== drop) drop.hidden = true;
    target.hidden = false;
    target.replaceChildren();
    if (note) {
      var p = document.createElement("p");
      p.className = "note";
      p.textContent = note;
      target.append(p);
      return;
    }
    list.forEach(function (row) {
      var link = document.createElement("a");
      link.className = "entry";
      link.href = "/ruwat/n/" + String(Math.floor(row[0] / 100)).padStart(3, "0") + "/" + row[0] + "/";
      var name = document.createElement("span");
      name.className = "ttl";
      name.textContent = clip(row[1]);
      var meta = document.createElement("span");
      meta.className = "meta";
      meta.textContent = kind(row[2]);
      link.append(name, meta);
      target.append(link);
    });
  }
  function clear() {
    if (pageOut) pageOut.replaceChildren();
    if (drop) { drop.hidden = true; drop.replaceChildren(); }
  }
  function run(q) {
    var qws = bits(q);
    if (qws.length < 1) { clear(); return; }
    var found = [];
    for (var i = 0; i < rows.length; i++) {
      var s = score(rows[i], qws);
      if (s >= 0) found.push([s, starts(rows[i][3], qws) ? 0 : 1, rows[i]]);
    }
    found.sort(function (a, b) {
      return a[0] - b[0] || a[1] - b[1] || (a[2][3] < b[2][3] ? -1 : 1);
    });
    var list = found.slice(0, 24).map(function (item) { return item[2]; });
    if (!found.length) render([], "لا يوجد راو بهذا الاسم");
    else render(list);
  }
  input.addEventListener("input", function () {
    var q = fold(input.value);
    if (q.length < 2) { clear(); return; }
    if (!rows) {
      render([], "…");
      fetch("/ruwat/assets/find.json").then(function (r) { return r.json(); }).then(function (data) {
        rows = data;
        run(fold(input.value));
      }).catch(function () { render([], "تعذر البحث"); });
      return;
    }
    run(q);
  });
  document.addEventListener("click", function (e) {
    if (!drop || drop.hidden) return;
    if (!input.form.contains(e.target)) drop.hidden = true;
  });
})();
