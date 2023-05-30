# CanDB Benchmarks

To see the requirements that produced these benchmarks, see [./BENCHMARKING.md](./BENCHMARKING.md).

## Run

### Graphs

```shell
npm run dev
```

### Benchmarks

```shell
npm run benchmarks
```

**NOTE**: Skips any tests for which the benchmark file already exists!

## Files
See [./BENCHMARKING.md](./BENCHMARKING.md) to match each csv file and plot with its respective benchmark requirement.

| Name | Filename | Update/Query/Scan |
|------|----------|-----|
| Small Insertion Batch | [sib](./out/sib.csv) | U |
| Small Retrieval Batch | [sib_q](./out/sib_q.csv) | Q |
| Small Retrieval S Batch | [sib_s](./out/sib_s.csv) | S |
| Small Insertion 1 | [si1](./out/si1.csv) | U |
| Small Update 1 | [su1](./out/su1.csv) | U |
| Small Deletion 1 | [sd1](./out/sd1.csv) | U |
| Small Insertion Parallel | [sip](./out/sip.csv) | U |
| Medium Insertion Batch | [mib](./out/mib.csv) | U |
| Medium Retrieval Batch | [mib_q](./out/mib_q.csv) | Q |
| Medium Retrieval S Batch | [mib_s](./out/mib_s.csv) | S |
| Medium Insertion 1 | [mi1](./out/mi1.csv) | U |
| Medium Deletion 1 | [md1](./out/md1.csv) | U |
| Large Insertion Batch | [lib](./out/lib.csv) | U |
| Large Retrieval Batch | [lib_q](./out/lib_s.csv) | Q |
| Large Retrieval S Batch | [lib_s](./out/lib_s.csv) | S |
| Large Insertion 1 | [li1](./out/li1.csv) | U |
| Large Deletion 1 | [ld1](./out/ld1.csv) | U |

## Set Up

### No Artificial Delay

**NOTE**: The artificial delay has been set to zero, which means the actual response times might differ.

### `~/.config/dfx/networks.json`

```json
{
  "local": {
    "bind": "127.0.0.1:8000",
    "type": "ephemeral"
  }
}
```

### Install a Specific DFX Version

**NOTE**: Minimal requirement `0.14.0`!

```shell
DFX_VERSION=0.14.0 sh -ci "$(curl -sSL https://internetcomputer.org/install.sh)"
```
