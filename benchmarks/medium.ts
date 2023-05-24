import { createActor } from "../src/declarations/simple";
import { AttributeKey, AttributeValue } from "../src/declarations/simple/simple.did";
import canisterIds from "../.dfx/local/canister_ids.json";
import { Watcher, Writer, createEntities, createSK } from "./utils";

const size = 500, scanSize = 200n;
const attributes: [AttributeKey, AttributeValue][] = [["name", { "blob": new Uint8Array(1024) }]];

// Insert 50 entities in a single update call, repeat until instruction limit is reached.
export async function mib() {
    const simple = createActor(canisterIds.mib.local, { agentOptions: { host: "http://127.0.0.1:4943" } });
    const watcher = new Watcher(simple);
    const writerI = new Writer("./out/mib.csv");
    const writerIQ = new Writer("./out/mib_q.csv", true);
    const writerIS = new Writer("./out/mib_s.csv", true);
    if (writerI.fileExists()) {
        console.log(`Skipped Insertion Benchmark (Medium) (Batch).`);
        return;
    }
    writerI.writeHeader(); writerIQ.writeHeader(); writerIS.writeHeader();
    console.log(`Started Insertion Benchmark (Medium) (Batch).`);

    let i = 0, instructionLimit = false;
    while (!instructionLimit) {
        const entities = createEntities(i, size, attributes);
        try {
            watcher.startTimer();
            const c = await simple.batchPut(entities);
            const s = await watcher.stopTimer();
            writerI.writeLine((i + 1) * size, s, c);

            watcher.startTimer();
            const cQ = await simple.get(entities[0].sk);
            const sQ = await watcher.stopTimer();
            writerIQ.writeLine((i + 1) * size, sQ, cQ);

            watcher.startTimer();
            const cS = await simple.scan(entities[0].sk, scanSize, createSK(i, 0), createSK(i, size - 1));
            const sS = await watcher.stopTimer();
            writerIS.writeLine((i + 1) * size, sS, cS);
        } catch (e) {
            console.log(`Error: ${e}`);
            instructionLimit = true;
        }
        if (i != 0 && i % 10 == 0) console.log(`mib: ${i}/* ${await simple.size()}`);
        i++;
    }
    console.log(`Finished Insertion Benchmark (Medium) (Batch).`);
}

export async function mibQ() {
    const simple = createActor(canisterIds.mib.local, { agentOptions: { host: "http://127.0.0.1:4943" } });
    const watcher = new Watcher(simple);
    const writerIQ = new Writer("./out/mib_q.csv", true);
    const writerIS = new Writer("./out/mib_s.csv", true);
    if (writerIQ.fileExists()) {
        console.log(`Skipped Insertion Benchmark Query (Medium) (Batch).`);
        return;
    }
    writerIQ.writeHeader(); writerIS.writeHeader();
    console.log(`Started Insertion Benchmark Query (Medium) (Batch).`);

    let i = 0, instructionLimit = false;
    while (!instructionLimit) {
        const entities = createEntities(i, size, attributes);
        try {
            await simple.batchPut(entities);

            watcher.startTimer();
            const cQ = await simple.get(entities[0].sk);
            const sQ = await watcher.stopTimer();
            writerIQ.writeLine((i + 1) * size, sQ, cQ);

            watcher.startTimer();
            const cS = await simple.scan(entities[0].sk, scanSize, createSK(i, 0), createSK(i, size - 1));
            const sS = await watcher.stopTimer();
            writerIS.writeLine((i + 1) * size, sS, cS);
        } catch (e) {
            console.log(`Error: ${e}`);
            instructionLimit = true;
        }
        if (i != 0 && i % 10 == 0) console.log(`mib_q: ${i}/* ${await simple.size()}`);
        i++;
    }
    console.log(`Finished Insertion Benchmark Query (Medium) (Batch).`);
}

// Start at 0. At each batch insertion “checkpoint” insert 1 more item, then remaining `size - 1`.
export async function mid1() {
    const simple = createActor(canisterIds.mid1.local, { agentOptions: { host: "http://127.0.0.1:4943" } });
    const watcher = new Watcher(simple);
    const writerI = new Writer("./out/mi1.csv");
    const writerD = new Writer("./out/md1.csv");
    if (writerI.fileExists() && writerD.fileExists()) {
        console.log(`Skipped Insertion Benchmark (Medium) (1): ${writerI.path}, ${writerD.path}`);
        return;
    }
    writerI.writeHeader(); writerD.writeHeader();
    console.log(`Started Insertion Benchmark (Medium) (1): ${writerI.path}, ${writerD.path}`);

    let i = 0, instructionLimit = false;
    while (!instructionLimit) {
        const entities = createEntities(i, size, attributes);
        try {
            watcher.startTimer();
            const cI = await simple.put(entities[0]);
            const sI = await watcher.stopTimer();
            writerI.writeLine(i * size + 1, sI, cI);

            watcher.startTimer();
            const cD = await simple.delete(entities[0].sk);
            const sD = await watcher.stopTimer();
            writerD.writeLine(i * size + 1, sD, cD);

            await simple.batchPut(entities);
        } catch (e) {
            console.log(`Error: ${e}`);
            instructionLimit = true;
        }
        if (i != 0 && i % 10 == 0) console.log(`mid1: ${i}/* ${await simple.size()}`);
        i++;
    }
    console.log(`Finished Insertion Benchmark (Medium) (1): ${writerI.path} ${writerD.path}`);
}
