import { ActorSubclass } from "@dfinity/agent";
import { ConsumableEntity, _SERVICE } from "../../src/declarations/simple/simple.did";
import { createActor } from "../../src/declarations/simple";
import canisterIds from "../../.dfx/local/canister_ids.json";
import { Stats, Watcher, formatCyclesShort, priceInUSD } from "../utils";
import { mkdirSync, writeFileSync } from "fs";

describe('simple.create.bm', () => {
    let simple: ActorSubclass<_SERVICE>;
    let watcher: Watcher;

    before(() => {
        simple = createActor(canisterIds.simple.local, {
            agentOptions: {
                host: "http://127.0.0.1:8000",
            }
        });
        watcher = new Watcher(simple);
    })

    afterEach(async () => {
        await simple.clear();
    });

    describe("sm", async () => {
        let sizes = [100, 1_000, 10_000]; // 100_000 will be too big.
        let times = 100;

        for (let size of sizes) {
            it(`${size}x${times}`, async () => {
                let stats: (Stats & { count: bigint })[] = [];
                for (let i = 0; i < times; i++) {
                    const entities: ConsumableEntity[] = [...new Array(size)].map((_, j) => ({
                        pk: "nat", sk: `nat#${i == 0 ? "" : i}${j}`,
                        attributes: [["name", { "int": 0n }]]
                    }));
                    watcher.startTimer();
                    const c = await simple.createAll(entities);
                    const s = await watcher.stopTimer();
                    stats.push({ ...s, count: c });

                    if (i != 0 && i % 10 == 0) console.log(`sm${size}x${times}: ${i}/100`);
                }

                let minTime = stats.reduce((min, s) => s.time < min ? s.time : min, Number.MAX_SAFE_INTEGER);
                let avgTime = stats.reduce((sum, s) => sum + s.time, 0n) / BigInt(stats.length);
                let maxTime = stats.reduce((max, s) => s.time > max ? s.time : max, Number.MIN_SAFE_INTEGER);
                console.log(`Time: ${minTime} - ${avgTime} - ${maxTime}`);

                let minCycles = stats.reduce((min, s) => s.cycles < min ? s.cycles : min, Number.MAX_SAFE_INTEGER);
                let avgCycles = stats.reduce((sum, s) => sum + s.cycles, 0n) / BigInt(stats.length);
                let maxCycles = stats.reduce((max, s) => s.cycles > max ? s.cycles : max, Number.MIN_SAFE_INTEGER);
                console.log(`Cycles: ${minCycles} - ${avgCycles} - ${maxCycles}`);

                let minCount = stats.reduce((min, s) => s.count < min ? s.count : min, Number.MAX_SAFE_INTEGER);
                let avgCount = stats.reduce((sum, s) => sum + s.count, 0n) / BigInt(stats.length);
                let maxCount = stats.reduce((max, s) => s.count > max ? s.count : max, Number.MIN_SAFE_INTEGER);
                console.log(`Instructions: ${minCount} - ${avgCount} - ${maxCount}`);

                let csv = "Size,Time,Cycles,Instructions\n";
                stats.forEach((s, i) => {
                    csv += `${(i + 1) * size},${s.time},${s.cycles},${s.count}\n`;
                });
                writeFileSync(`./out/simple.create.sm${size}x${times}.csv`, csv);
            });
        }
    });

});
