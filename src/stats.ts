export interface stats {
    stats: () => Promise<[bigint, bigint]>;
}
