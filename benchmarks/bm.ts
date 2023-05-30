import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { XDR } from "../src/xdr";
import { sib, sibQ, sip, siud1 } from "./small";
import { mid1, mib, mibQ } from "./medium";
import { li1, ld1, lib, libQ } from "./large";

const stdio = process.env.DEBUG ? "inherit" : "ignore";

export const SDR = 1.35;
export var cyclesPerICP = 0;
export var priceICPInUSD = 0;

(async () => {
    const { data } = await XDR.get_icp_xdr_conversion_rate();
    cyclesPerICP = Number(data.xdr_permyriad_per_icp) * 1_000_000_000_000_000;
    const cyclesPerICPInT = parseFloat(data.xdr_permyriad_per_icp.toString()) / 10_000;
    console.log(`XDR: ${cyclesPerICPInT}T Cycles/ICP.`);

    priceICPInUSD = cyclesPerICPInT * SDR;
    console.log(`ICP: ${priceICPInUSD} USD.`);

    execSync(`dfx stop`, { stdio: "ignore" });
    console.log("Starting local network... (this may take a while)");
    execSync(`dfx start --artificial-delay=0 --background --clean`, { stdio });
    console.log("Deploying canisters...");
    execSync(`DFX_MOC_PATH="$(vessel bin)/moc" dfx deploy`, { stdio });
    console.log("Generating declarations...");
    execSync(`DFX_MOC_PATH="$(vessel bin)/moc" dfx generate`, { stdio });

    const canisterIds = JSON.parse(readFileSync(".dfx/local/canister_ids.json", "utf-8"));

    // Remove the last line of each index.js file.
    for (const k of Object.keys(canisterIds)) {
        if (k.startsWith("__")) continue;
        const filePath = "src/declarations/" + k + "/index.js";
        const index = readFileSync(filePath, "utf-8").split("\n");
        writeFileSync(filePath, index.slice(0, -2).join("\n"))
    };
    console.log("Done!");

    if (process.env.QUERY) {
        console.log("Running query benchmarks...");
        await Promise.all([sibQ(), mibQ(), libQ()]);
    } else {
        console.log("Running update benchmarks...");
        await Promise.all([sib(), siud1(), sip()]);
        await Promise.all([mib(), mid1()]);
        await Promise.all([lib(), ld1(), li1()]);
    }

    console.log("Stopping local network...");
    execSync(`dfx stop`, { stdio: "ignore" });
})()
