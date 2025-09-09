
(function(){
  function esc(s){ return (s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;"); }

  function buildEvents(days){
    const evts = [];
    for (const d of days){
      const sp = d.species || [];
      const ph = d.photos  || [];

      // Build shared full-detail HTML once (used by every event for this day)
      const spHtml = sp.length
        ? `<div><b>New species (${sp.length}):</b> ` + sp.map(it=>{
            const sci = it.sci ? ` <span class="small">(<i>${esc(it.sci)}</i>)</span>` : "";
            return `<a href="${it.href}">${esc(it.name)}</a>${sci}`;
          }).join(", ") + `</div>`
        : "";

      const photoTotal = ph.reduce((a,b)=> a + (b.count||0), 0);
      const phHtml = ph.length
        ? `<div><b>Photos (${photoTotal}):</b> ` + ph.map(it=>{
            return `<a href="${it.href}">${esc(it.name)}</a> <span class="badge">${it.count}</span>`;
          }).join(", ") + `</div>`
        : "";

      const fullHtml = spHtml + phHtml;

      // One event per *new species*
      for (const it of sp){
        evts.push({
          title: `New species: ${it.name}`,
          start: d.date,
          allDay: true,
          extendedProps: { html: fullHtml, kind: "species" }
        });
      }

      // One event per *species with photos* (include the per-species count)
      for (const it of ph){
        evts.push({
          title: `Photos: ${it.name} ${it.count}`,
          start: d.date,
          allDay: true,
          extendedProps: { html: fullHtml, kind: "photos" }
        });
      }
    }
    return evts;
  }

  function renderCalendar(){
    const calEl   = document.getElementById("changelog-calendar");
    const details = document.getElementById("cal-details");
    const data    = (window.CHANGELOG_DATA && window.CHANGELOG_DATA.days) || [];
    if(!calEl) return;

    if (!window.FullCalendar){
      calEl.innerHTML = "<div class='small'>FullCalendar not loaded.</div>";
      return;
    }

    const calendar = new FullCalendar.Calendar(calEl, {
      initialView: 'dayGridMonth',
      height: 'auto',
      fixedWeekCount: false,
      showNonCurrentDates: false,
      dayMaxEventRows: 4,         // show “+more” when crowded
      moreLinkClassNames: ['small'],
      events: buildEvents(data),
      eventOrder: 'title',        // keeps events stable; you can sort by kind if preferred
      eventClassNames: function(info){
        return info.event.extendedProps.kind === 'species' ? ['evt-species'] : ['evt-photos'];
      },
      eventDidMount: function(info){
        // compact pill-like styling
        info.el.style.padding = "0 4px";
        info.el.style.fontSize = "11px";
        info.el.style.borderRadius = "6px";
        info.el.style.borderWidth = "1px";
      },
      eventClick: function(info){
        // Always render full day details
        const dt = info.event.start;
        const y = dt.getFullYear();
        const m = String(dt.getMonth()+1).padStart(2,'0');
        const d = String(dt.getDate()).padStart(2,'0');
        const dateLabel = `${y}-${m}-${d}`;
        const html = (info.event.extendedProps && info.event.extendedProps.html) || "<div class='small'>No entries</div>";
        details.innerHTML = `
          <div class="h1" style="font-size:16px; margin-bottom:8px">${dateLabel}</div>
          ${html}
        `;
        details.style.display = "block";
        details.scrollIntoView({behavior:'smooth', block:'start'});
      }
    });

    calendar.render();
  }

  document.addEventListener("DOMContentLoaded", renderCalendar);
})();
