# CanDB Benchmarks

```shell
npm run benchmark
```

**NOTE**: Skips any tests for which the benchmark file already exists!

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

**NOTE**: Minimal requirement `0.14.0-beta.0`!

```shell
DFX_VERSION=0.14.0-beta.0 sh -ci "$(curl -sSL https://internetcomputer.org/install.sh)"
```
