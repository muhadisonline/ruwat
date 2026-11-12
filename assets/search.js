
(function () {
  var box = document.getElementById("q");
  var out = document.getElementById("out");
  if (!box || !out) return;
  var rows = null;
  function fold(s) {
    return String(s).replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g, "")
      .replace(/[أإآٱ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه")
      .replace(/[^\u0621-\u064A\s]/g, " ").replace(/\s+/g, " ").trim();
  }
  function kind(g) { return g === "s" ? "صحابي" : g === "t" ? "تابعي" : ""; }
  var BASE = "/ruwat";
  function show(list) {
    out.replaceChildren();
    list.forEach(function (row) {
      var link = document.createElement("a");
      link.className = "entry";
      link.href = BASE + "/" + row[0] + "/";
      var name = document.createElement("span");
      name.className = "ttl";
      name.textContent = row[1];
      var meta = document.createElement("span");
      meta.className = "meta";
      meta.textContent = kind(row[2]);
      link.append(name, meta);
      out.append(link);
    });
  }
  box.addEventListener("input", function () {
    var q = fold(box.value);
    if (q.length < 2) { out.innerHTML = ""; return; }
    if (!rows) {
      out.innerHTML = '<p class="note">...</p>';
      fetch("/ruwat" + "/assets/names.json").then(function (r) { return r.json(); }).then(function (data) {
        rows = data;
        box.dispatchEvent(new Event("input"));
      });
      return;
    }
    var found = [];
    for (var i = 0; i < rows.length && found.length < 40; i++) {
      if (fold(rows[i][1]).indexOf(q) !== -1) found.push(rows[i]);
    }
    show(found);
  });
})();
