import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

const seeders = [
    "seed-lens-types.ts",
    "seed-lens-indices.ts",
    "seed-lens-technologies.ts",
    "lens_options.seed.ts",
    "seed-lens-index-compatibility.ts",
    "seed-lens-technology-index-compatibility.ts",
    "lens-price.seeder.ts",
    "lens-reading-prices.seed.ts",
];

for (const file of seeders) {
    const fullPath = path.join(here, file);
    console.log(`\n> Seeding: ${file}`);
    execFileSync("npx", ["tsx", `"${fullPath}"`], { stdio: "inherit", shell: true });
}

console.log("\nAll seeders finished.");