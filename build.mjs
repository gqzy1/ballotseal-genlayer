import { build } from "esbuild";
import { mkdir, copyFile, writeFile, readFile, rm } from "node:fs/promises";
import { createHash } from "node:crypto";
await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });
await build({
  entryPoints: ["app.js"],
  bundle: true,
  outfile: "dist/app.js",
  format: "esm",
  platform: "browser",
  target: "es2022",
  minify: true,
});
for (const file of ["index.html", "style.css", "brand.svg", "audit-example.json"])
  await copyFile(file, "dist/" + file);
const bytes = await readFile("contracts/ballot_seal.py");
await copyFile("contracts/ballot_seal.py", "dist/ballot_seal.py");
await writeFile(
  "dist/release.json",
  JSON.stringify(
    {
      protocol: "ballotseal-0.3",
      contract_sha256: createHash("sha256").update(bytes).digest("hex"),
      deployment: JSON.parse(await readFile("deployments/studionet.json", "utf8")),
      chain_id: 61999,
    },
    null,
    2,
  ) + "\n",
);
await writeFile("dist/.nojekyll", "");

