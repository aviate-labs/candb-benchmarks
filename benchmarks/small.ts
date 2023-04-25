import { createActor } from "../src/declarations/simple";
import { AttributeKey, AttributeValue } from "../src/declarations/simple/simple.did";
import canisterIds from "../.dfx/local/canister_ids.json";
import { Watcher, Writer, createEntities } from "./utils";

const size = 5_000;
const attributes: [AttributeKey, AttributeValue][] = [["name", { "bool": true }]];

// Insert 5k entities in a single update call, repeat until instruction limit is reached.
export async function sid() {
    const simple = createActor(canisterIds.sib.local, { agentOptions: { host: "http://127.0.0.1:8000" } });
    const watcher = new Watcher(simple), writer = new Writer("./out/sib.csv");
    if (writer.fileExists()) {
        console.log(`Skipped Insertion Benchmark (Small) (Batch): ${writer.path}`);
        return;
    }
    writer.writeHeader();
    console.log(`Started Insertion Benchmark (Small) (Batch): ${writer.path}`);

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
        if (i != 0 && i % 10 == 0) console.log(`sid: ${i}/* ${await simple.size()}`);
        i++;
    }
    console.log(`Finished Insertion Benchmark (Small) (Batch): ${writer.path}`);
}

// Start at 0. At each batch insertion “checkpoint” (0, 5k, 10k, etc.) insert 1 more item, then remaining 4_999.
export async function siud1() {
    const simple = createActor(canisterIds.siud1.local, { agentOptions: { host: "http://127.0.0.1:8000" } });
    const watcher = new Watcher(simple);
    const writerI = new Writer("./out/si1.csv");
    const writerU = new Writer("./out/su1.csv");
    const writerD = new Writer("./out/sd1.csv");
    if (writerI.fileExists() && writerU.fileExists() && writerD.fileExists()) {
        console.log(`Skipped Insertion/Update/Delete Benchmark (Small) (1): ${writerI.path} ${writerU.path} ${writerD.path}`);
        return;
    }
    writerI.writeHeader(); writerU.writeHeader(); writerD.writeHeader();
    console.log(`Started Insertion/Update Benchmark (Small) (1): ${writerI.path} ${writerU.path} ${writerD.path}`);

    let i = 0, instructionLimit = false;
    while (!instructionLimit) {
        const entities = createEntities(i, size, attributes);
        try {
            watcher.startTimer();
            const cI = await simple.put(entities[0]);
            const sI = await watcher.stopTimer();
            writerI.writeLine(i * size + 1, sI, cI);

            watcher.startTimer();
            const cU = await simple.put(entities[0]);
            const sU = await watcher.stopTimer();
            writerU.writeLine(i * size + 1, sU, cU);

            watcher.startTimer();
            const cD = await simple.delete(entities[0].sk);
            const sD = await watcher.stopTimer();
            writerU.writeLine(i * size + 1, sD, cD);

            await simple.batchPut(entities);
        } catch (e) {
            instructionLimit = true;
        }
        if (i != 0 && i % 10 == 0) console.log(`siud1: ${i}/* ${await simple.size()}`);
        i++;
    }
    console.log(`Finished Insertion/Update Benchmark (Small) (1): ${writerI.path} ${writerU.path} ${writerD.path}`);
}

// Start at 0. At each batch insertion “checkpoint” (0, 5k, 10k, etc.) make 100 calls in parallel
// (using Promise.all()) where each call inserts a single entity to CanDB, then remaining 4_900.
// Start at 0. At each batch insertion “checkpoint” (0, 5k, 10k, etc.) insert 1 more item, then remaining 4_999.
export async function sip() {
    const simple = createActor(canisterIds.sip.local, { agentOptions: { host: "http://127.0.0.1:8000" } });
    const watcher = new Watcher(simple), writer = new Writer("./out/sip.csv");
    if (writer.fileExists()) {
        console.log(`Skipped Insertion Benchmark (Small) (Parallel): ${writer.path}`);
        return;
    }
    writer.writeHeader();
    console.log(`Started Insertion Benchmark (Small) (Parallel): ${writer.path}`);

    let i = 0, instructionLimit = false;
    while (!instructionLimit) {
        const entities = createEntities(i, size, attributes);
        try {
            watcher.startTimer();
            const cs = await Promise.all(entities.slice(0, 100).map(async (entity) => await simple.put(entity)));
            const s = await watcher.stopTimer();
            // NOTE: c is the average number of instructions per call.
            const c = cs.reduce((a, b) => a + b, 0n) / BigInt(cs.length);
            writer.writeLine(i * size + 1, s, c);

            await simple.batchPut(entities.slice(100));
        } catch (e) {
            instructionLimit = true;
        }
        if (i != 0 && i % 10 == 0) console.log(`sip: ${i}/* ${await simple.size()}`);
        i++;
    }
    console.log(`Finished Insertion Benchmark (Small) (Parallel): ${writer.path}`);
}
