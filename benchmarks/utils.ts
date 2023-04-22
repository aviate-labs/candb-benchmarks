import { ActorSubclass } from "@dfinity/agent";
import { balance } from "../src/cycles";
import { cyclesPerICP, priceICPInUSD } from "./setup.bm";

export function formatCycles(cycles: bigint): string {
    // Format cycles as a string with underscores every 3 digits.
    return cycles.toString()
        .split("").reverse().join("")
        .match(/.{1,3}/g)
        .map(x => x.split("").reverse().join(""))
        .reverse().join("_"); // 🤫
}

export function formatCyclesShort(cycles: bigint): string {
    if (cycles < 10e6) {
        return `${cycles / 1_000n}K`;
    }
    return `${formatCycles(cycles / 1_000_000n)}M`;
}

export function priceInUSD(cycles: bigint) : number {
    return Number(cycles) / cyclesPerICP * priceICPInUSD;
}

// This is the type of the stats returned by the Watcher class.
export type Stats = {
    // Time in nanoseconds.
    time: bigint,
    // Cycles used.
    cycles: bigint,
};

// This class is used to measure the time and cycles used by a function.
export class Watcher {
    private actor: ActorSubclass<balance>;
    private startTime: bigint;
    private startCycles: bigint;

    constructor(actor : ActorSubclass<balance>) {
        this.startTime = 0n;
        this.startCycles = 0n;
        this.actor = actor;
    }

    public async startTimer() {
        this.startCycles = await this.actor.balance();
        this.startTime = process.hrtime.bigint();
    }

    public async stopTimer() : Promise<Stats> {
        const time = process.hrtime.bigint() - this.startTime;
        const cycles = this.startCycles - await this.actor.balance();
        return { time, cycles };
    };
}
