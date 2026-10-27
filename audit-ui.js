import { client } from "./sdk.js";
import {
  EXAMPLE_REF,
  EXAMPLE_VIEWER,
  readSnapshot,
  buildAudit,
  createReport,
  verifyReport,
  reverifyReport,
} from "./audit.js";
export function mountAudit(
  root,
  {
    reader = () => client(),
    fetcher = (...args) => fetch(...args),
    download = save,
  } = {},
) {
  let snapshot = null,
    imported = null,
    provenance = "",
    generation = 0,
    busy = false;
  root.innerHTML = `<div class="audit-heading"><div><span class="eyebrow">V0.4 / CONSENT AUDIT</span><h2>Trace every change.<br>Find where consent expired.</h2></div><p>Inspect any version interval and any wallet. Every intermediate assessment counts, even when the final wording returns to the original.</p></div>
  <div class="audit-inputs"><label>Proposal reference<input id="audit-ref" aria-label="Audit proposal reference"></label><label>Viewer address · no wallet required<input id="audit-viewer" aria-label="Audit viewer address"></label></div>
  <div class="audit-actions"><button id="audit-live" class="primary">Read & verify chain history ↗</button><button id="audit-archive">Explore archived chain example</button></div>
  <p id="audit-status" role="status" aria-live="polite">Choose a live read or an explicitly archived example. No transactions are sent.</p>
  <div class="audit-actions"><label>From<select id="audit-from" aria-label="From version"></select></label><label>To<select id="audit-to" aria-label="To version"></select></label><button id="audit-export" disabled>Export audit JSON ↓</button><label class="audit-file">Open audit report<input id="audit-file" type="file" accept="application/json,.json"></label><button id="audit-reverify" disabled>Re-verify report against chain ↗</button></div>
  <div id="audit-results"></div><p class="notice">Reports describe version order, not acknowledgement timestamps. A hash proves internal consistency only. A fresh chain read verifies stored history and source; it does not certify legal consent, voting power, finality or AI accuracy.</p>`;
  const $ = (id) => root.querySelector("#audit-" + id);
  $("ref").value = EXAMPLE_REF;
  $("viewer").value = EXAMPLE_VIEWER;
  const message = (value) => {
    $("status").textContent = value;
  };
  const node = (tag, value) => {
    const n = document.createElement(tag);
    n.textContent = value;
    return n;
  };
  async function render() {
    const ticket = ++generation;
    $("results").replaceChildren();
    $("export").disabled = true;
    if (!snapshot) return;
    const a = await buildAudit(
      snapshot,
      Number($("from").value),
      Number($("to").value),
    );
    if (ticket !== generation) return;
    const box = $("results");
    box.append(
      node("p", provenance),
      node(
        "h3",
        `V${a.from} → V${a.to} · ${a.epoch_breaks.length} consent epoch break(s)`,
      ),
    );
    if (a.endpoint_text_equal)
      box.append(
        node(
          "p",
          "Endpoint texts are identical. Intermediate epoch breaks still invalidate earlier acknowledgements.",
        ),
      );
    const table = document.createElement("table");
    const header = document.createElement("tr");
    for (const t of [
      "Version",
      "Epoch",
      "Latest acknowledgement by version",
      "Applicability",
      "First invalidated",
    ])
      header.append(node("th", t));
    const thead = document.createElement("thead");
    thead.append(header);
    table.append(thead);
    const body = document.createElement("tbody");
    for (const row of a.timeline) {
      const tr = document.createElement("tr");
      for (const value of [
        row.version,
        row.epoch,
        row.acknowledged_version ?? "None",
        row.status,
        row.invalidated_at ?? "—",
      ])
        tr.append(node("td", String(value)));
      body.append(tr);
    }
    table.append(body);
    const scroll = document.createElement("div");
    scroll.className = "audit-table";
    scroll.append(table);
    box.append(scroll);
    for (const step of a.steps) {
      const detail = document.createElement("details");
      detail.open = step.action !== "CARRY";
      detail.append(
        node(
          "summary",
          `V${step.from} → V${step.to} / ${step.action} / epoch ${step.epoch}`,
        ),
      );
      for (const d of step.dimensions) {
        detail.append(
          node("h4", `${d.dimension} · ${d.label}`),
          node("p", d.reason),
          node(
            "blockquote",
            `Before: ${d.before_quote || "(no excerpt)"}\nAfter: ${d.after_quote || "(no excerpt)"}`,
          ),
        );
      }
      box.append(detail);
    }
    $("export").disabled = false;
  }
  async function setSnapshot(value, label, range) {
    snapshot = value;
    provenance = label;
    for (const id of ["from", "to"]) {
      $(id).replaceChildren();
      for (const v of value.record.trail) {
        const o = node("option", "V" + v.version);
        o.value = v.version;
        $(id).append(o);
      }
    }
    $("from").value = range?.from ?? 1;
    $("to").value = range?.to ?? value.record.trail.length;
    await render();
  }
  async function run(fn) {
    if (busy) return;
    busy = true;
    for (const id of [
      "live",
      "archive",
      "reverify",
      "export",
      "file",
      "from",
      "to",
    ])
      $(id).disabled = true;
    try {
      await fn();
    } catch (e) {
      message(e.message);
      snapshot = null;
      imported = null;
      generation++;
      $("results").replaceChildren();
    } finally {
      busy = false;
      for (const id of ["live", "archive", "file", "from", "to"])
        $(id).disabled = false;
      $("export").disabled = !snapshot;
      $("reverify").disabled = !imported;
    }
  }
  $("live").onclick = () =>
    run(async () => {
      imported = null;
      message("Reading canonical source and complete history…");
      await setSnapshot(
        await readSnapshot(
          reader(),
          $("ref").value.trim(),
          $("viewer").value.trim(),
        ),
        "Fresh source-verified chain read · " + new Date().toISOString(),
      );
      message("Chain history verified. Select an interval to inspect.");
    });
  $("archive").onclick = () =>
    run(async () => {
      imported = null;
      const res = await fetcher("audit-example.json");
      if (!res.ok) throw Error("Archived example unavailable.");
      const s = await res.json();
      await setSnapshot(
        s,
        "ARCHIVED CHAIN EVIDENCE · not a fresh network verification",
      );
      message(
        "Archived example loaded. V1 confirmation expires at V3; V4 has a new exact confirmation.",
      );
    });
  $("from").onchange = $("to").onchange = () => run(render);
  $("export").onclick = () =>
    run(async () => {
      if (!snapshot) throw Error("Load a history first.");
      const report = await createReport(
        snapshot,
        Number($("from").value),
        Number($("to").value),
      );
      download(JSON.stringify(report, null, 2), "ballotseal-audit.json");
      message(
        "Audit exported. Reopen and re-verify against chain for current provenance.",
      );
    });
  $("file").onchange = () =>
    run(async () => {
      const file = $("file").files[0];
      if (!file) return;
      if (file.size > 2000000) throw Error("Audit file exceeds 2 MB.");
      const report = JSON.parse(await file.text());
      await verifyReport(report);
      imported = report;
      $("ref").value = report.snapshot.reference;
      $("viewer").value = report.snapshot.viewer;
      await setSnapshot(
        report.snapshot,
        "IMPORTED REPORT · internal integrity checked; chain provenance unverified",
        report.analysis,
      );
      message(
        "Report integrity verified. Use Re-verify report against chain to check provenance.",
      );
    });
  $("reverify").onclick = () =>
    run(async () => {
      if (!imported) throw Error("Open an audit report first.");
      const report = imported;
      message("Re-reading canonical chain history…");
      const result = await reverifyReport(reader(), report);
      await setSnapshot(
        result.snapshot,
        "REPORT MATCHES FRESH CHAIN READ · " + new Date().toISOString(),
        report.analysis,
      );
      message(
        `Report matches stored chain history. ${result.additional_versions} later version(s) found.`,
      );
    });
  return { render };
}
function save(content, name) {
  const url = URL.createObjectURL(
    new Blob([content], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
