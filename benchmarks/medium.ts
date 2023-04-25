import { createActor } from "../src/declarations/simple";
import { AttributeKey, AttributeValue } from "../src/declarations/simple/simple.did";
import canisterIds from "../.dfx/local/canister_ids.json";
import { Watcher, Writer, createEntities } from "./utils";

const size = 50;
const attributes: [AttributeKey, AttributeValue][] = [["name", { "blob": new Uint8Array(1024) }]];

// Insert 50 entities in a single update call, repeat until instruction limit is reached.
export async function mib() {
    const simple = createActor(canisterIds.mib.local, { agentOptions: { host: "http://127.0.0.1:8000" } });
    const watcher = new Watcher(simple);
    const writer = new Writer("./out/mib.csv");
    if (writer.fileExists()) {
        console.log(`Skipped Insertion Benchmark (Medium) (Batch): ${writer.path}`);
        return;
    }
    writer.writeHeader();
    console.log(`Started Insertion Benchmark (Medium) (Batch): ${writer.path}`);

    let i = 0, instructionLimit = false;
    while (!instructionLimit) {
        const entities = createEntities(i, size, attributes);
        try {
            watcher.startTimer();
            const c = await simple.batchPut(entities);
            const s = await watcher.stopTimer();
            writer.writeLine((i + 1) * size, s, c);
        } catch (e) {
            instructionLimit = true;
        }
        if (i != 0 && i % 10 == 0) console.log(`mid: ${i}/* ${await simple.size()}`);
        i++;
    }
    console.log(`Finished Insertion Benchmark (Medium) (Batch): ${writer.path}`);
}

// Start at 0. At each batch insertion “checkpoint” insert 1 more item, then remaining 49.
export async function mi1() {
    const simple = createActor(canisterIds.mi1.local, { agentOptions: { host: "http://127.0.0.1:8000" } });
    const watcher = new Watcher(simple);
    const writer = new Writer("./out/mi1.csv")
    if (writer.fileExists()) {
        console.log(`Skipped Insertion Benchmark (Medium) (1): ${writer.path}`);
        return;
    }
    writer.writeHeader();
    console.log(`Started Insertion Benchmark (Medium) (1): ${writer.path}`);

    let i = 0, instructionLimit = false;
    while (!instructionLimit) {
        const entities = createEntities(i, size, attributes);
        try {
            watcher.startTimer();
            const cI = await simple.put(entities[0]);
            const sI = await watcher.stopTimer();
            writer.writeLine(i * size + 1, sI, cI);

            await simple.batchPut(entities.slice(1));
        } catch (e) {
            instructionLimit = true;
        }
        if (i != 0 && i % 10 == 0) console.log(`mi1: ${i}/* ${await simple.size()}`);
        i++;
    }
    console.log(`Finished Insertion Benchmark (Medium) (1): ${writer.path}`);
}
