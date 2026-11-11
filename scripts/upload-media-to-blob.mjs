#!/usr/bin/env node
/**
 * Upload heavy portfolio media to Vercel Blob with stable pathnames.
 *
 * Requires: BLOB_READ_WRITE_TOKEN
 * Optional: MEDIA_PREFIX (default "") — prepended to blob pathnames
 *
 * Usage:
 *   BLOB_READ_WRITE_TOKEN=... node scripts/upload-media-to-blob.mjs
 *   BLOB_READ_WRITE_TOKEN=... node scripts/upload-media-to-blob.mjs --dry-run
 */
import { put, list } from "@vercel/blob";
import { createReadStream, statSync } from "node:fs";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dryRun = process.argv.includes("--dry-run");
const force = process.argv.includes("--force");

const MEDIA_DIRS = [
  "public/calligrapics",
  "public/muse-editions",
  "public/daily",
  "public/posters",
  "public/meditations",
];

// Also include a few root public stills used by the catalog
const EXTRA_FILES = [
  "public/wheelgen/poster.png",
  "public/srclensx.jpg",
  "public/srclensz.jpg",
  "public/source.jpg",
  "public/evolution.jpg",
  "public/phoenix.gif",
  "public/muse-patron.gif",
  "public/muse-pass.png",
];

const SKIP_NAMES = new Set([".DS_Store"]);

if (!process.env.BLOB_READ_WRITE_TOKEN && !dryRun) {
  console.error("Missing BLOB_READ_WRITE_TOKEN");
  process.exit(1);
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (SKIP_NAMES.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else files.push(full);
  }
  return files;
}

function pathnameFor(absPath) {
  const rel = path.relative(path.join(root, "public"), absPath).replaceAll("\\", "/");
  return rel; // e.g. calligrapics/c1.png — no leading slash in Blob pathname
}

async function existingPathnames() {
  const found = new Set();
  let cursor;
  do {
    const page = await list({ cursor, limit: 1000 });
    for (const blob of page.blobs) found.add(blob.pathname);
    cursor = page.cursor;
  } while (cursor);
  return found;
}

async function main() {
  const files = [];
  for (const dir of MEDIA_DIRS) {
    const abs = path.join(root, dir);
    try {
      files.push(...(await walk(abs)));
    } catch {
      console.warn("skip missing dir", dir);
    }
  }
  for (const rel of EXTRA_FILES) {
    const abs = path.join(root, rel);
    try {
      statSync(abs);
      files.push(abs);
    } catch {
      /* optional */
    }
  }

  // de-dupe
  const unique = [...new Set(files)];
  console.log(`Found ${unique.length} media files`);

  let existing = new Set();
  if (!dryRun && !force) {
    console.log("Listing existing blobs…");
    existing = await existingPathnames();
    console.log(`Store already has ${existing.size} objects`);
  }

  let uploaded = 0;
  let skipped = 0;
  let bytes = 0;
  let baseUrl = null;

  for (const abs of unique) {
    const pathname = pathnameFor(abs);
    if (!pathname || pathname.startsWith("..")) continue;
    const size = statSync(abs).size;
    if (existing.has(pathname) && !force) {
      skipped++;
      continue;
    }
    if (dryRun) {
      console.log("dry-run", pathname, size);
      uploaded++;
      bytes += size;
      continue;
    }
    const blob = await put(pathname, createReadStream(abs), {
      access: "public",
      addRandomSuffix: false,
      multipart: size > 4 * 1024 * 1024,
      allowOverwrite: force,
    });
    uploaded++;
    bytes += size;
    if (!baseUrl) {
      // https://xxx.public.blob.vercel-storage.com/calligrapics/c1.png → origin
      const url = new URL(blob.url);
      // pathname on blob.url includes /calligrapics/... — origin is the media base
      baseUrl = url.origin;
    }
    if (uploaded % 10 === 0) {
      console.log(`uploaded ${uploaded}/${unique.length} (+${skipped} skipped)`);
    }
  }

  console.log(
    JSON.stringify(
      {
        uploaded,
        skipped,
        bytes,
        mediaBaseUrl: baseUrl,
        hint: baseUrl
          ? `Set NEXT_PUBLIC_MEDIA_BASE_URL=${baseUrl} (and MEDIA_BASE_URL for scripts)`
          : "No uploads performed",
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
