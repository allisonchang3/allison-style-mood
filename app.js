/**
 * Allison style mood — render Daily Look Log
 * Prefers embedded looks-data.js (works with file://); falls back to looks.json via fetch.
 */

(function () {
  "use strict";

  const root = document.getElementById("looks-root");
  if (!root) return;

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatDisplayDate(iso) {
    if (!iso) return "";
    const parts = iso.split("-").map(Number);
    if (parts.length !== 3) return escapeHtml(iso);
    const [y, m, d] = parts;
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    const month = months[m - 1] || "";
    return `${month} ${d}, ${y}`;
  }

  function weatherBits(w) {
    if (!w) return "";
    const bits = [];
    if (w.summary) {
      bits.push(
        `<span><span class="wx-label">Sky</span> ${escapeHtml(w.summary)}</span>`
      );
    }
    if (w.temp) {
      bits.push(
        `<span><span class="wx-label">Temp</span> ${escapeHtml(w.temp)}</span>`
      );
    }
    if (w.rain) {
      bits.push(
        `<span><span class="wx-label">Rain</span> ${escapeHtml(w.rain)}</span>`
      );
    }
    return bits.join("");
  }

  function field(label, value, spanFull) {
    if (!value) return "";
    const cls = spanFull ? "look-field span-full" : "look-field";
    return `
      <div class="${cls}">
        <dl>
          <dt>${escapeHtml(label)}</dt>
          <dd>${escapeHtml(value)}</dd>
        </dl>
      </div>`;
  }

  function renderVisuals(look) {
    const refs = Array.isArray(look.celebrityRefs) ? look.celebrityRefs : [];
    if (refs.length === 0) return "";

    const items = refs
      .filter((r) => r && r.src)
      .map((r) => {
        const name = r.name ? escapeHtml(r.name) : "Reference";
        const why = r.caption ? escapeHtml(r.caption) : "";
        return `
            <li>
              <figure class="celeb-item">
                <img src="${escapeHtml(r.src)}" alt="${name}" loading="lazy" />
                <figcaption>
                  <span class="celeb-name">${name}</span>
                  ${why}
                </figcaption>
              </figure>
            </li>`;
      })
      .join("");

    return `
      <div class="look-visuals">
        <div class="look-visual-block">
          <h4>Celebrity references</h4>
          <ul class="celeb-grid">${items}</ul>
        </div>
      </div>`;
  }

  function renderLook(look) {
    const dateLabel = formatDisplayDate(look.date);
    const weekday = look.weekday ? escapeHtml(look.weekday) : "";
    const occasion = look.occasion ? escapeHtml(look.occasion) : "";

    return `
      <li class="look-card">
        <div class="look-card-top">
          <p class="look-date">
            ${dateLabel}
            ${weekday ? `<span class="look-weekday">${weekday}</span>` : ""}
          </p>
          ${occasion ? `<span class="look-occasion">${occasion}</span>` : ""}
        </div>
        ${
          look.weather
            ? `<div class="look-weather">${weatherBits(look.weather)}</div>`
            : ""
        }
        ${renderVisuals(look)}
        <div class="look-body">
          ${field("Clothes", look.clothes, true)}
          ${field("Jewelry", look.jewelry)}
          ${field("Shoes", look.shoes)}
          ${field("Hair", look.hair, true)}
        </div>
        ${
          look.note
            ? `<p class="look-note">${escapeHtml(look.note)}</p>`
            : ""
        }
      </li>`;
  }

  function sortNewestFirst(looks) {
    return looks.slice().sort((a, b) => {
      const da = a.date || "";
      const db = b.date || "";
      return db.localeCompare(da);
    });
  }

  function showEmpty(message) {
    root.innerHTML = `<li class="empty-state">${escapeHtml(message)}</li>`;
  }

  function render(looks) {
    if (!Array.isArray(looks) || looks.length === 0) {
      showEmpty("No looks yet — add an entry to looks-data.js (and looks.json).");
      return;
    }
    const ordered = sortNewestFirst(looks);
    root.innerHTML = ordered.map(renderLook).join("");
  }

  function loadLooks() {
    if (Array.isArray(window.ALLISON_LOOKS) && window.ALLISON_LOOKS.length) {
      render(window.ALLISON_LOOKS);
      return;
    }

    fetch("looks.json", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("Could not load looks.json");
        return res.json();
      })
      .then(render)
      .catch(() => {
        showEmpty(
          "Could not load looks. Make sure looks-data.js is in the same folder as index.html."
        );
      });
  }

  loadLooks();
})();
