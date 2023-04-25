import { createActor } from "../src/declarations/simple";
import { AttributeKey, AttributeValue } from "../src/declarations/simple/simple.did";
import canisterIds from "../.dfx/local/canister_ids.json";
import { Watcher, Writer, createEntities, createEntity } from "./utils";

const size = 3;
const attributes: [AttributeKey, AttributeValue][] = [["name", { "blob": new Uint8Array(500 * 1024) }]];

export async function lib() {
    const simple = createActor(canisterIds.lib.local, { agentOptions: { host: "http://127.0.0.1:8000" } });
    const watcher = new Watcher(simple);
    const writer = new Writer("./out/lib.csv");
    if (writer.fileExists()) {
        console.log(`Skipped Insertion Benchmark (Large) (Batch): ${writer.path}`);
        return;
    }
    writer.writeHeader();
    console.log(`Started Insertion Benchmark (Large) (Batch): ${writer.path}`);

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
        if (i != 0 && i % 10 == 0) console.log(`lib: ${i}/* ${await simple.size()}`);
        i++;
    }
    console.log(`Finished Insertion Benchmark (Large) (Batch): ${writer.path}`);
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
            writerD.writeLine(i * size + 1, sD, cD);
        } catch (e) {
            instructionLimit = true;
        }
        if (i != 0 && i % 10 == 0) console.log(`lid1: ${i}/* ${await simple.size()}`);
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
            writerI.writeLine(i * size + 1, sI, cI);
        } catch (e) {
            instructionLimit = true;
        }
        if (i != 0 && i % 10 == 0) console.log(`lid1: ${i}/* ${await simple.size()}`);
        i++;
    }
    console.log(`Finished Insertion Benchmark (Large) (1): ${writerI.path}`);
}
