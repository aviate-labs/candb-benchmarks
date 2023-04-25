import { readFileSync, writeFileSync } from "fs";

const f = readFileSync("out/mi1.csv");
const lines = f.toString().split("\n");

let mi = [lines[0]];
let md = [lines[0]];
for (let i = 1; i < lines.length; i++) {
  if (i % 2 === 1) {
    mi.push(lines[i]);
  } else {
    md.push(lines[i]);
  }
}

writeFileSync("out/mi1_.csv", mi.join("\n"));
writeFileSync("out/md1_.csv", md.join("\n"));
