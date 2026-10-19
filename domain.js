export const PROTOCOL = "ballotseal-0.3";
export const DIMS = ["budget", "beneficiary", "scope", "deadline", "authority"];
export const NAMES = {
  budget: "Budget",
  beneficiary: "Beneficiary",
  scope: "Delivery scope",
  deadline: "Deadline",
  authority: "Authority",
};
export const BASE =
  "Pay the Design Guild 1,000 USDC to deliver one open-source logo kit by 1 December 2026. The guild receives no treasury or admin permissions.";
const same = {
  budget:
    "The amount, currency and payment condition remain 1,000 USDC for delivery.",
  beneficiary: "Both versions name the Design Guild as the recipient.",
  scope:
    "Both versions require one open-source logo kit with no additional deliverables.",
  deadline: "The delivery deadline remains 1 December 2026.",
  authority: "Neither version grants treasury or administrator permissions.",
};
function scenario(title, subtitle, text, changes) {
  return {
    title,
    subtitle,
    text,
    assessment: Object.fromEntries(
      DIMS.map((k) => [
        k,
        {
          label: changes[k]?.[0] ?? "SAME",
          reason: changes[k]?.[1] ?? same[k],
          before_quote: BASE.slice(0, 50),
          after_quote: text.slice(0, 50),
        },
      ]),
    ),
  };
}
export const CASES = {
  copy: scenario(
    "A cleaner sentence",
    "Wording only",
    "The Design Guild will receive 1,000 USDC for one open-source logo kit, due 1 December 2026. No treasury or admin permissions are granted.",
    {},
  ),
  budget: scenario(
    "The budget doubles",
    "1,000 → 2,000 USDC",
    BASE.replace("1,000", "2,000"),
    {
      budget: [
        "CHANGED",
        "The payment increases from 1,000 to 2,000 USDC. That is a new financial commitment.",
      ],
    },
  ),
  authority: scenario(
    "A little extra power",
    "New treasury permission",
    BASE.replace(
      "The guild receives no treasury or admin permissions.",
      "The guild may withdraw up to 5,000 USDC from the treasury.",
    ),
    {
      budget: [
        "CHANGED",
        "A new 5,000 USDC withdrawal allowance creates additional financial exposure.",
      ],
      authority: [
        "CHANGED",
        "Treasury withdrawal authority replaces the explicit absence of permissions.",
      ],
    },
  ),
  deadline: scenario(
    "One more month",
    "1 December → 1 January",
    BASE.replace("1 December 2026", "1 January 2027"),
    {
      deadline: [
        "CHANGED",
        "The delivery moves from 1 December 2026 to 1 January 2027. Earlier acknowledgement did not cover this delay.",
      ],
    },
  ),
  beneficiary: scenario(
    "A different recipient",
    "Design Guild → Studio North",
    BASE.replaceAll("Design Guild", "Studio North"),
    {
      beneficiary: [
        "CHANGED",
        "The named payee changes from the Design Guild to Studio North.",
      ],
    },
  ),
  scope: scenario(
    "More than a logo",
    "A website joins the brief",
    BASE.replace(
      "one open-source logo kit",
      "one open-source logo kit and a complete website",
    ),
    {
      scope: [
        "CHANGED",
        "A complete website is added to the required logo kit; delivery obligations expand.",
      ],
    },
  ),
  uncertain: scenario(
    "The missing agreement",
    "Important terms left out",
    "Pay the Design Guild for a logo kit under the budget, deadline, licensing and permission terms agreed in a private conversation.",
    {
      budget: [
        "UNCERTAIN",
        "The new version refers to private budget terms rather than stating an amount or currency.",
      ],
      scope: [
        "UNCERTAIN",
        "Open-source licensing and acceptance obligations depend on an unavailable private agreement.",
      ],
      deadline: [
        "UNCERTAIN",
        "The deadline is delegated to an unavailable private conversation.",
      ],
      authority: [
        "UNCERTAIN",
        "Permissions are described by reference to a missing private agreement.",
      ],
    },
  ),
};
export function validateText(text) {
  if (
    typeof text !== "string" ||
    Array.from(text.trim()).length < 20 ||
    Array.from(text).length > 6000
  )
    throw Error("Use 20–6,000 characters, including surrounding whitespace.");
  return text;
}
export function validateTitle(title) {
  if (
    typeof title !== "string" ||
    !title.trim() ||
    Array.from(title).length > 100
  )
    throw Error("Give the proposal a title of 1–100 characters.");
  return title.trim();
}
export async function sha256(text) {
  const bytes = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(text),
  );
  return Array.from(new Uint8Array(bytes), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}
export function validateAssessment(a, before, after) {
  if (
    !a ||
    typeof a !== "object" ||
    Object.keys(a).sort().join() !== [...DIMS].sort().join()
  )
    throw Error("Expected all five assessment dimensions.");
  for (const k of DIMS) {
    const d = a[k];
    if (
      !d ||
      Object.keys(d).sort().join() !==
        ["label", "reason", "before_quote", "after_quote"].sort().join() ||
      !["SAME", "CHANGED", "UNCERTAIN"].includes(d.label) ||
      typeof d.reason !== "string" ||
      Array.from(d.reason.trim()).length < 20 ||
      Array.from(d.reason).length > 360
    )
      throw Error("Invalid " + k + " assessment.");
    if (d.label === "CHANGED" && !(d.before_quote || d.after_quote))
      throw Error("Missing changed-dimension evidence quote.");
    if (before !== undefined)
      for (const [field, text] of [
        ["before_quote", before],
        ["after_quote", after],
      ]) {
        if (
          typeof d[field] !== "string" ||
          Array.from(d[field]).length > 240 ||
          !text.includes(d[field])
        )
          throw Error("Invalid evidence quote.");
      }
  }
  return a;
}
export function decision(a) {
  validateAssessment(a);
  if (DIMS.some((k) => a[k].label === "CHANGED")) return "RECONFIRM";
  return DIMS.some((k) => a[k].label === "UNCERTAIN") ? "REVIEW" : "CARRY";
}
export async function seal(title, text) {
  validateText(text);
  return {
    protocol: PROTOCOL,
    mode: "local",
    title: validateTitle(title),
    trail: [
      {
        version: 1,
        epoch: 1,
        text,
        digest: await sha256(text),
        parent_digest: "",
        assessment: {},
        action: "INITIAL",
      },
    ],
    acknowledgements: [],
  };
}
export async function append(state, text, assessment) {
  validateText(text);
  const old = state.trail.at(-1);
  if (old.text === text) throw Error("There is no text change to compare.");
  if (old.version >= 32)
    throw Error("The 32-version proposal limit has been reached.");
  validateAssessment(assessment, old.text, text);
  const action = decision(assessment);
  const v = {
    version: old.version + 1,
    epoch: old.epoch + (action === "CARRY" ? 0 : 1),
    text,
    digest: await sha256(text),
    parent_digest: old.digest,
    assessment: structuredClone(assessment),
    action,
  };
  return { ...state, trail: [...state.trail, v] };
}
export function acknowledge(state) {
  const v = state.trail.at(-1);
  if (state.acknowledgements.some((a) => a.version === v.version))
    throw Error("This exact version has already been acknowledged.");
  return {
    ...state,
    acknowledgements: [
      ...state.acknowledgements,
      {
        address: "local-viewer",
        version: v.version,
        epoch: v.epoch,
        digest: v.digest,
      },
    ],
  };
}
export function applicability(state) {
  const latest = state.trail.at(-1),
    ack = state.acknowledgements.at(-1);
  return {
    version: ack?.version ?? 0,
    applicable: !!ack && ack.epoch === latest.epoch,
    exact: ack?.version === latest.version,
  };
}
export function unknownAssessment() {
  return Object.fromEntries(
    DIMS.map((k) => [
      k,
      {
        label: "UNCERTAIN",
        reason:
          "Custom local text has not been assessed by GenLayer. A new acknowledgement epoch is required conservatively.",
        before_quote: "",
        after_quote: "",
      },
    ]),
  );
}
export function exportRecord(state, extra = {}) {
  return JSON.stringify(
    {
      ...state,
      ...extra,
      exported_at: new Date().toISOString(),
      notice:
        "Local fixtures are not AI or onchain evidence. SHA256 checks text integrity, not authenticity. Acknowledgements are not votes or legal consent.",
    },
    null,
    2,
  );
}
export async function verifyRecord(state) {
  if (
    !state ||
    state.protocol !== PROTOCOL ||
    !Array.isArray(state.trail) ||
    !state.trail.length ||
    state.trail.length > 32 ||
    !Array.isArray(state.acknowledgements)
  )
    throw Error("Invalid BallotSeal record.");
  validateTitle(state.title);
  let epoch = 1;
  for (let i = 0; i < state.trail.length; i++) {
    const v = state.trail[i];
    validateText(v.text);
    if (
      v.version !== i + 1 ||
      v.digest !== (await sha256(v.text)) ||
      v.parent_digest !== (i ? state.trail[i - 1].digest : "")
    )
      throw Error("Version or SHA256 integrity mismatch at V" + (i + 1));
    if (i) {
      validateAssessment(v.assessment, state.trail[i - 1].text, v.text);
      if (
        v.action !== decision(v.assessment) ||
        v.text === state.trail[i - 1].text
      )
        throw Error("Assessment/action mismatch.");
      if (v.action !== "CARRY") epoch++;
    } else if (v.action !== "INITIAL" || Object.keys(v.assessment).length)
      throw Error("Invalid initial version.");
    if (v.epoch !== epoch) throw Error("Consent epoch mismatch.");
  }
  let last = 0;
  for (const ack of state.acknowledgements) {
    const v = state.trail[ack.version - 1];
    if (
      !v ||
      ack.version <= last ||
      v.epoch !== ack.epoch ||
      v.digest !== ack.digest
    )
      throw Error("Acknowledgement history mismatch.");
    last = ack.version;
  }
  return true;
}
