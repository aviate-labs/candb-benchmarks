let upstream = https://github.com/dfinity/vessel-package-set/releases/download/mo-0.8.7-20230406/package-set.dhall sha256:cb4ea443519a950c08db572738173a30d37fb096e32bc98f35b78436bae1cd17
let Package = { name : Text, version : Text, repo : Text, dependencies : List Text }

let packages = [
  { name = "btree"
  , repo = "https://github.com/canscale/StableHeapBTreeMap"
  , version = "v0.3.1"
  , dependencies = [ "base" ]
  },
  { name = "stable-rbtree"
  , repo = "https://github.com/canscale/StableRBTree"
  , version = "v0.6.1"
  , dependencies = [ "base" ]
  },
  { name = "stable-buffer"
  , repo = "https://github.com/canscale/StableBuffer"
  , version = "v1.2.0"
  , dependencies = [ "base" ]
  },
  { name = "candb"
  , repo = "git@github.com:canscale/CanDB.git"
  , version = "7035f0a90fced70fe84c845f48c96b1cb378e141"
  , dependencies = [ "base" ]
  }
]

in  upstream # packages
