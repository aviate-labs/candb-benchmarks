import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE } from "../../src/declarations/simple/simple.did";
import { createActor } from "../../src/declarations/simple";
import canisterIds from "../../.dfx/local/canister_ids.json";
import { Watcher, formatCyclesShort, priceInUSD } from "../utils";

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

    it("should create a simple object", async () => {
        watcher.startTimer();
        const count = await simple.create({
            pk: "nat", sk: "nat#1",
            attributes: [["name", { "int": 0n }]]
        });
        const stats = await watcher.stopTimer();

        console.log(`Performance Counter: ${count} instructions.`);
        console.log(`Time: ${(Number(stats.time) / 1_000_000_000).toFixed(3)} s.`);
        console.log(`Cycle usage: ${formatCyclesShort(stats.cycles)} cycles (${priceInUSD(stats.cycles).toFixed(15)} USD).`);
    });

});
