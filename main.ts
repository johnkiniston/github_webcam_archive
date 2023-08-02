#!/usr/bin/env -S deno run --allow-env --allow-net --allow-read --allow-write --unstable

import * as path from "https://deno.land/std@0.194.0/path/mod.ts";
import { format } from "https://deno.land/std@0.91.0/datetime/mod.ts";

const env = Deno.env.toObject();
const dir = env.DIR;
const linkName = env.LINKNAME;
const url = env.URL;
const dateFormat = env.DATEFORMAT;
const dateFile = format(new Date(),dateFormat).concat('.jpg'); // Filename format and suffiz 
const latestDateFile = path.join(dir, dateFile);
const latestFile = path.join(dir, linkName);

async function read(url: string) {
  const res = await fetch(`${url}`);
  const { ok, status, statusText } = res;

  if (ok) return new Uint8Array(await res.arrayBuffer());

  throw new Error(
    `Read failure: HTTP ${status} - ${statusText ?? "Unknown error"}`,
  );
}

async function compare(data: Uint8Array): Promise<void> {
  const newSize = data.byteLength;
  try {
    var linkSize  = await Deno.statSync(latestFile).size;
  
    }catch (error) {
        if (error instanceof Deno.errors.NotFound) {
            var linkSize = 0; // Report a 0 size file for a missing file
            } else {
            // otherwise re-throw
            throw error;
      }
    }

  if (newSize != linkSize) {
    await write(data);
    await linkfile();
  }
}

async function linkfile(): Promise<void> {
  try {
    await Deno.symlink(dateFile, latestFile);
    console.log(`Linked ${dateFile} to ${latestFile}`);
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      await Deno.mkdir(dir, { recursive: true });
      return await linkfile(); // try again
    }
    if (error instanceof Deno.errors.AlreadyExists) {
      await Deno.removeSync(latestFile);
      return await linkfile(); // try again
    } 
    else throw error;
  }

}
async function write(data: Uint8Array): Promise<void> {
  const fmt = new Intl.NumberFormat("en", {
    unitDisplay: "narrow",
    unit: "byte",
    notation: "compact",
    signDisplay: "exceptZero",
    style: "unit",
  });
  var newSize = data.byteLength;
  try { await Deno.writeFile(latestDateFile, data);
    console.log(
      `🆕 Created ${latestDateFile} \x1b[92m(${fmt.format(newSize)})\x1b[0m`,
    );

  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
     await Deno.mkdir(dir, { recursive: true });
     return await write(data); // try again
    } else throw error;
  }
    
}

if (import.meta.main) await read(url).then(compare);
