import { ConsumableEntity, _SERVICE } from "../../src/declarations/simple/simple.did";
import { createActor } from "../../src/declarations/simple";
import canisterIds from "../../.dfx/local/canister_ids.json";
import { Watcher, priceInUSD, pad, shuffle } from "../utils";
import { appendFileSync, existsSync, writeFileSync } from "fs";

describe("Smallest Attribute (single Bool Attribute Value, 5k count intervals)", () => {

    // Insert 5k entities in a single update call, repeat until instruction limit is reached.
    it("Insert Batch", async () => {
        const simple = createActor(canisterIds.sib.local, { agentOptions: { host: "http://127.0.0.1:8000" } })
        const watcher = new Watcher(simple), path = `./out/sib.csv`;
        if (existsSync(path)) {
            console.log(`Skipped Insertion Benchmark (Small) (Batch): ${path}`);
            return;
        }
        writeFileSync(path, "Size,Time,Cycles,Price,Instructions,HeapSize,TotalHeapSize\n");
        console.log(`Started Insertion Benchmark (Small) (Batch): ${path}`);

        const size = 5_000;
        let i = 0, instructionLimit = false;
        while (!instructionLimit) {
            const entities: ConsumableEntity[] = shuffle([...new Array(size)].map((_, j) => ({
                sk: `pk#${i == 0 ? "" : i}${pad(j, 4)}`,
                attributes: [["name", { "bool": true }]]
            })));
            try {
                watcher.startTimer();
                const c = await simple.batchPut(entities);
                const s = await watcher.stopTimer();
                appendFileSync(path, `${(i + 1) * size},${s.time},${s.cycles},${priceInUSD(s.cycles)},${c},${s.heapSize},${s.totalHeapSize}\n`)
            } catch (e) {
                instructionLimit = true;
            }
            if (i != 0 && i % 10 == 0) console.log(`sid: ${i}/* ${await simple.size()}`);
            i++;
        }
    });

    // Start at 0. At each batch insertion “checkpoint” (0, 5k, 10k, etc.) insert 1 more item, then remaining 4_999.
    it("Insert/Update 1", async () => {
        const simple = createActor(canisterIds.siu1.local, { agentOptions: { host: "http://127.0.0.1:8000" } });
        const watcher = new Watcher(simple), pathI = `./out/si1.csv`, pathU = `./out/su1.csv`;
        if (existsSync(pathI) && existsSync(pathU)) {
            console.log(`Skipped Insertion/Update Benchmark (Small) (1): ${pathI} ${pathU}`);
            return;
        }
        writeFileSync(pathI, "Size,Time,Cycles,Price,Instructions,HeapSize,TotalHeapSize\n");
        writeFileSync(pathU, "Size,Time,Cycles,Price,Instructions,HeapSize,TotalHeapSize\n");
        console.log(`Started Insertion/Update Benchmark (Small) (1): ${pathI} ${pathU}`);

        const size = 5_000;
        let i = 0, instructionLimit = false;
        while (!instructionLimit) {
            const entities: ConsumableEntity[] = shuffle([...new Array(size)].map((_, j) => ({
                sk: `pk#${i == 0 ? "" : i}${pad(j, 4)}`,
                attributes: [["name", { "bool": true }]]
            })));
            try {
                watcher.startTimer();
                const cI = await simple.put(entities[0]);
                const sI = await watcher.stopTimer();
                appendFileSync(pathI, `${i * size + 1},${sI.time},${sI.cycles},${priceInUSD(sI.cycles)},${cI},${sI.heapSize},${sI.totalHeapSize}\n`);

                watcher.startTimer();
                const cU = await simple.put(entities[0]);
                const sU = await watcher.stopTimer();
                appendFileSync(pathU, `${i * size + 1},${sU.time},${sU.cycles},${priceInUSD(sU.cycles)},${cU},${sU.heapSize},${sU.totalHeapSize}\n`);

                await simple.batchPut(entities.slice(1));
            } catch (e) {
                instructionLimit = true;
            }
            if (i != 0 && i % 10 == 0) console.log(`siu1: ${i}/* ${await simple.size()}`);
            i++;
        }
    });

    // Start at 0. At each batch insertion “checkpoint” (0, 5k, 10k, etc.) make 100 calls in parallel
    // (using Promise.all()) where each call inserts a single entity to CanDB, then remaining 4_900.
    // Start at 0. At each batch insertion “checkpoint” (0, 5k, 10k, etc.) insert 1 more item, then remaining 4_999.
    it("Insert Parallel", async () => {
        const simple = createActor(canisterIds.sip.local, { agentOptions: { host: "http://127.0.0.1:8000" } });
        const watcher = new Watcher(simple), path = `./out/sip.csv`;
        if (existsSync(path)) {
            console.log(`Skipped Insertion Benchmark (Small) (Parallel): ${path}`);
            return;
        }
        writeFileSync(path, "Size,Time,Cycles,Price,Instructions,HeapSize,TotalHeapSize\n");
        console.log(`Skipped Insertion Benchmark (Small) (Parallel): ${path}`);

        const size = 5_000;
        let i = 0, instructionLimit = false;
        while (!instructionLimit) {
            const entities: ConsumableEntity[] = shuffle([...new Array(size)].map((_, j) => ({
                sk: `pk#${i == 0 ? "" : i}${pad(j, 4)}`,
                attributes: [["name", { "bool": true }]]
            })));
            try {
                watcher.startTimer();
                const cs = await Promise.all(entities.slice(0, 100).map(async (entity) => await simple.put(entity)));
                const s = await watcher.stopTimer();
                // NOTE: c is the average number of instructions per call.
                const c = cs.reduce((a, b) => a + b, 0n) / BigInt(cs.length);
                appendFileSync(path, `${i * size + 1},${s.time},${s.cycles},${priceInUSD(s.cycles)},${c},${s.heapSize},${s.totalHeapSize}\n`);

                await simple.batchPut(entities.slice(100));
            } catch (e) {
                instructionLimit = true;
            }
            if (i != 0 && i % 10 == 0) console.log(`sip: ${i}/* ${await simple.size()}`);
            i++;
        }
    });

})
