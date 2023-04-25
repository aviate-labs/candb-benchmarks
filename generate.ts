import { execSync } from "child_process";
import canisterIds from "./.dfx/local/canister_ids.json";
import { readFileSync, writeFileSync } from "fs";

const stdio = process.env.DEBUG ? "inherit" : "ignore";

console.log("Starting local network... (this may take a while)");
execSync(`dfx start --artificial-delay=0 --background --clean`, { stdio });
console.log("Deploying canisters...");
execSync(`dfx deploy`, { stdio });
console.log("Generating declarations...");
execSync(`dfx generate`, { stdio });

for (const k of Object.keys(canisterIds)) {
    if (k.startsWith("__")) continue;
    const filePath = "src/declarations/" + k + "/index.js";
    const index = readFileSync(filePath, "utf-8").split("\n");
    writeFileSync(filePath, index.slice(0, -2).join("\n"))
};
console.log("Done!");

execSync(`dfx stop`, { stdio: "ignore" });

