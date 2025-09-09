import sharp from "sharp";
import { readFile } from "fs/promises";

const iconSvg = await readFile("public/virtualtrig-icon.svg");
const socialSvg = await readFile("public/social-card.svg");

await sharp(iconSvg).resize(512, 512).png().toFile("public/icon-512.png");
await sharp(iconSvg).resize(192, 192).png().toFile("public/icon-192.png");
await sharp(iconSvg).resize(180, 180).png().toFile("public/apple-touch-icon.png");
await sharp(iconSvg).resize(32, 32).png().toFile("public/favicon-32.png");

// social preview (PNG recommended for OG)
await sharp(socialSvg).resize(1200, 630).png().toFile("public/social-card.png");

console.log("✅ Exported PNGs: 512, 192, 180, 32, and social 1200x630");
