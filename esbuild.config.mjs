import * as esbuild from "esbuild";
import { readFileSync } from "fs";

const watch = process.argv.includes("--watch");
const { version } = JSON.parse(readFileSync("package.json", "utf8"));

const ctx = await esbuild.context({
    entryPoints: ["src/hikvision-doorbell-card.ts"],
    bundle: true,
    format: "esm",
    outfile: "custom_components/hikvision_sip_doorbell/www/hikvision-doorbell-card.js",
    minify: !watch,
    sourcemap: watch ? "inline" : false,
    external: [],
    define: {
        __CARD_VERSION__: JSON.stringify(version),
    },
});

if (watch) {
    await ctx.watch();
    console.log("Watching for changes...");
} else {
    await ctx.rebuild();
    await ctx.dispose();
    console.log("Build complete.");
}
