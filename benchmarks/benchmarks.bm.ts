import { ConsumableEntity, AttributeKey, AttributeValue, _SERVICE } from "../src/declarations/simple/simple.did";
import { createActor } from "../src/declarations/simple";
import canisterIds from "../.dfx/local/canister_ids.json";
import { Watcher, pad, shuffle, Writer } from "./utils";

describe("Benchmarks", () => {

    describe("Smallest Attribute (single Bool Attribute Value, 5k count intervals)", () => {

        const size = 5_000;
        const attributes: [AttributeKey, AttributeValue][] = [["name", { "bool": true }]];

        function createEntities(index: number): ConsumableEntity[] {
            return shuffle([...new Array(size)].map((_, j) => ({
                sk: `pk#${index == 0 ? "" : index}${pad(j, 4)}`, attributes
            })))
        };

        // Insert 5k entities in a single update call, repeat until instruction limit is reached.
        it("Insert Batch", async () => {
            const simple = createActor(canisterIds.sib.local, { agentOptions: { host: "http://127.0.0.1:8000" } });
            const watcher = new Watcher(simple);
            const writer = new Writer("./out/sib.csv");
            if (writer.fileExists()) {
                console.log(`Skipped Insertion Benchmark (Small) (Batch): ${writer.path}`);
                return;
            }
            writer.writeHeader();
            console.log(`Started Insertion Benchmark (Small) (Batch): ${writer.path}`);

            let i = 0, instructionLimit = false;
            while (!instructionLimit) {
                const entities = createEntities(i);
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
        });

        // Start at 0. At each batch insertion “checkpoint” (0, 5k, 10k, etc.) insert 1 more item, then remaining 4_999.
        it("Insert/Update 1", async () => {
            const simple = createActor(canisterIds.siu1.local, { agentOptions: { host: "http://127.0.0.1:8000" } });
            const watcher = new Watcher(simple);
            const writerI = new Writer("./out/si1.csv")
            const writerU = new Writer("./out/su1.csv");
            if (writerI.fileExists() && writerU.fileExists()) {
                console.log(`Skipped Insertion/Update Benchmark (Small) (1): ${writerI.path} ${writerU.path}`);
                return;
            }
            writerI.writeHeader(); writerU.writeHeader();
            console.log(`Started Insertion/Update Benchmark (Small) (1): ${writerI.path} ${writerU.path}`);

            let i = 0, instructionLimit = false;
            while (!instructionLimit) {
                const entities = createEntities(i);
                try {
                    watcher.startTimer();
                    const cI = await simple.put(entities[0]);
                    const sI = await watcher.stopTimer();
                    writerI.writeLine(i * size + 1, sI, cI);

                    watcher.startTimer();
                    const cU = await simple.put(entities[0]);
                    const sU = await watcher.stopTimer();
                    writerU.writeLine(i * size + 1, sU, cU);

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
            const watcher = new Watcher(simple);
            const writer = new Writer("./out/sip.csv");
            if (writer.fileExists()) {
                console.log(`Skipped Insertion Benchmark (Small) (Parallel): ${writer.path}`);
                return;
            }
            writer.writeHeader();
            console.log(`Skipped Insertion Benchmark (Small) (Parallel): ${writer.path}`);

            let i = 0, instructionLimit = false;
            while (!instructionLimit) {
                const entities = createEntities(i);
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
        });

    })

    describe("Medium Sized Attribute (1 KB Blob, 50 count intervals)", () => {

        const size = 50;
        const attributes: [AttributeKey, AttributeValue][] = [["name", { "blob": new Uint8Array(1024) }]];

        function createEntities(index: number): ConsumableEntity[] {
            return shuffle([...new Array(size)].map((_, j) => ({
                sk: `pk#${index == 0 ? "" : index}${pad(j, 4)}`, attributes
            })))
        };

        // Insert 50 entities in a single update call, repeat until instruction limit is reached.
        it("Insert Batch", async () => {
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
                const entities = createEntities(i);
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
        });

        // Start at 0. At each batch insertion “checkpoint” insert 1 more item, then remaining 49.
        it("Insert 1", async () => {
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
                const entities = createEntities(i);
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
        });

    })

    describe("Large Attribute (500 KB Blob)", () => {

        const size = 3;
        const attributes: [AttributeKey, AttributeValue][] = [["name", { "blob": new Uint8Array(500 * 1024) }]];

        function createEntity(index: number): ConsumableEntity {
            return {
                sk: `pk#${pad(index, 4)}`, attributes
            }
        }

        function createEntities(index: number): ConsumableEntity[] {
            return shuffle([...new Array(size)].map((_, j) => ({
                sk: `pk#${index == 0 ? "" : index}${pad(j, 4)}`, attributes
            })))
        };

        // Insert 3 entities in a single update call, repeat until instruction limit is reached.
        it("Insert Batch", async () => {
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
                const entities = createEntities(i);
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
        });

        //  Insert one entity at a time.
        it("Insert 1", async () => {
            const simple = createActor(canisterIds.li1.local, { agentOptions: { host: "http://127.0.0.1:8000" } });
            const watcher = new Watcher(simple);
            const writer = new Writer("./out/li1.csv")
            if (writer.fileExists()) {
                console.log(`Skipped Insertion Benchmark (Large) (1): ${writer.path}`);
                return;
            }
            writer.writeHeader();
            console.log(`Started Insertion Benchmark (Large) (1): ${writer.path}`);

            let i = 0, instructionLimit = false;
            while (!instructionLimit) {
                const entity = createEntity(i)
                try {
                    watcher.startTimer();
                    const cI = await simple.put(entity);
                    const sI = await watcher.stopTimer();
                    writer.writeLine(i * size + 1, sI, cI);
                } catch (e) {
                    instructionLimit = true;
                }
                if (i != 0 && i % 10 == 0) console.log(`li1: ${i}/* ${await simple.size()}`);
                i++;
            }
        });

    })

})
