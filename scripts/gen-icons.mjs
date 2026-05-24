// scripts/gen-icons.mjs
// Gera icon-192.png a partir do icon-512.png usando sharp
import sharp from "sharp";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(__dirname, "../public/icons/icon-512.png");
const out192 = path.join(__dirname, "../public/icons/icon-192.png");

await sharp(src).resize(192, 192).toFile(out192);
console.log("✓ icon-192.png gerado");
