
(function(){
  function esc(s){ return (s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;"); }

  function renderDay(d){
    const sp = (d.species||[]).map(it=>{
      const sci = it.sci ? ` <span class="small">(<i>${esc(it.sci)}</i>)</span>` : "";
      return `<a href="${it.href}">${esc(it.name)}</a>${sci}`;
    }).join(", ");

    const ph = (d.photos||[]).map(it=>{
      return `<a href="${it.href}">${esc(it.name)}</a> <span class="badge">${it.count}</span>`;
    }).join(", ");

    const lines = [`<div class="h1" style="font-size:16px">${esc(d.date)}</div>`];
    if (sp) lines.push(`<div>New species: ${sp}</div>`);
    if (ph) lines.push(`<div>Photos: ${ph}</div>`);
    if (!sp && !ph) lines.push(`<div class="small">No entries</div>`);

    return `<li><div class="card" style="margin-bottom:10px">${lines.join("")}</div></li>`;
  }

  function render(){
    const root = document.getElementById("changelog-root");
    if(!root) return;
    const data = (window.CHANGELOG_DATA && window.CHANGELOG_DATA.days) || [];
    if(!data.length){
      root.innerHTML = `<div class="card"><div class="small">No dated changes found.</div></div>`;
      return;
    }
    root.innerHTML = `<ol style="padding-left:20px; list-style:decimal">${data.map(renderDay).join("")}</ol>`;
  }

  document.addEventListener("DOMContentLoaded", render);
})();
