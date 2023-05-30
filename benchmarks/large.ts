import { createActor } from "../src/declarations/simple";
import { AttributeKey, AttributeValue } from "../src/declarations/simple/simple.did";
import canisterIds from "../.dfx/local/canister_ids.json";
import { Watcher, Writer, createEntities, createEntity, createSK } from "./utils";

const size = 3, scanSize = 2n;
const attributes: [AttributeKey, AttributeValue][] = [["name", { "blob": new Uint8Array(500 * 1024) }]];

export async function lib() {
    const simple = createActor(canisterIds.lib.local, { agentOptions: { host: "http://127.0.0.1:8000" } });
    const watcher = new Watcher(simple);
    const writerI = new Writer("./out/lib.csv");
    const writerIQ = new Writer("./out/lib_q.csv", true);
    const writerIS = new Writer("./out/lib_s.csv", true);
    if (writerI.fileExists()) {
        console.log(`Skipped Insertion Benchmark (Large) (Batch).`);
        return;
    }
    writerI.writeHeader(); writerIQ.writeHeader(); writerIS.writeHeader();
    console.log(`Started Insertion Benchmark (Large) (Batch).`);

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
        if (i != 0 && i % 10 == 0) console.log(`lib: ${i}/* ${await simple.size()}`);
        i++;
    }
    console.log(`Finished Insertion Benchmark (Large) (Batch).`);
}

export async function libQ() {
    const simple = createActor(canisterIds.lib.local, { agentOptions: { host: "http://127.0.0.1:8000" } });
    const watcher = new Watcher(simple);
    const writerIQ = new Writer("./out/lib_q.csv", true);
    const writerIS = new Writer("./out/lib_s.csv", true);
    if (writerIQ.fileExists()) {
        console.log(`Skipped Insertion Benchmark Query (Large) (Batch).`);
        return;
    }
    writerIQ.writeHeader(); writerIS.writeHeader();
    console.log(`Started Insertion Benchmark Query (Large) (Batch).`);

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
        if (i != 0 && i % 10 == 0) console.log(`lib_q: ${i}/* ${await simple.size()}`);
        i++;
    }
    console.log(`Finished Insertion Benchmark Query (Large) (Batch).`);
}

export async function ld1() {
    const simple = createActor(canisterIds.ld1.local, { agentOptions: { host: "http://127.0.0.1:8000" } });
    const watcher = new Watcher(simple);
    const writerD = new Writer("./out/ld1.csv");
    if (writerD.fileExists()) {
        console.log(`Skipped Delete Benchmark (Large) (1): ${writerD.path}`);
        return;
    }
    writerD.writeHeader();
    console.log(`Started Delete Benchmark (Large) (1): ${writerD.path}`);

    let i = 0, instructionLimit = false;
    while (!instructionLimit) {
        const entities = createEntities(i, size, attributes)
        try {
            await simple.batchPut(entities);

            watcher.startTimer();
            const cD = await simple.delete(entities[0].sk);
            const sD = await watcher.stopTimer();
            writerD.writeLine((i + 1) * (size - 1) + 1, sD, cD);
        } catch (e) {
            console.log(`Error: ${e}`);
            instructionLimit = true;
        }
        if (i != 0 && i % 10 == 0) console.log(`ld1: ${i}/* ${await simple.size()}`);
        i++;
    }
    console.log(`Finished Delete Benchmark (Large) (1): ${writerD.path}`);
}

export async function li1() {
    const simple = createActor(canisterIds.li1.local, { agentOptions: { host: "http://127.0.0.1:8000" } });
    const watcher = new Watcher(simple);
    const writerI = new Writer("./out/li1.csv");
    if (writerI.fileExists()) {
        console.log(`Skipped Insertion Benchmark (Large) (1): ${writerI.path}`);
        return;
    }
    writerI.writeHeader();
    console.log(`Started Insertion Benchmark (Large) (1): ${writerI.path}`);

    let i = 0, instructionLimit = false;
    while (!instructionLimit) {
        const entity = createEntity(i, attributes)
        try {
            watcher.startTimer();
            const cI = await simple.put(entity);
            const sI = await watcher.stopTimer();
            writerI.writeLine(i + 1, sI, cI);
        } catch (e) {
            console.log(`Error: ${e}`);
            instructionLimit = true;
        }
        if (i != 0 && i % 10 == 0) console.log(`li1: ${i}/* ${await simple.size()}`);
        i++;
    }
    console.log(`Finished Insertion Benchmark (Large) (1): ${writerI.path}`);
}
