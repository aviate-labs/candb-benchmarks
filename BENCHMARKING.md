# CanDB Benchmarking Deliverable Requirements

# Goal
To provide statistics on heap size, cycles usage/instructions, and cost associated with CanDB CRUD operations.

All measurements were be performed on the origin/remove-insert-and-update-limits-for-testing-purposes branch (similar to beta, but with auto-scaling limits removed to test canister insertion limits with the Motoko GC)
https://github.com/canscale/candb/tree/remove-insert-and-update-limits-for-testing-purposes
(at commit 7035f0a90fced70fe84c845f48c96b1cb378e141)

## Deliverables
For each section and task, produce a CSV that has the following columns
* of entities inserted
* cycles usage
* respective cost in USD
* heap size (if applicable, i.e. do this for insertion/deletion, but not for retrieval)

From this, produce basic charts for:
* Cycles usage of action as a function of # of entities already inserted prior to the action
* (if applicable) Heap size change after the action as a function of the # of entities already inserted prior to the action

## Retrieval Testing
For all retrieval tests, document # of entities inserted, cycles usage, and respective cost in USD of get/scan retrieval.

For each of the tests listed in the Insertion Testing section, after each insertion checkpoint where an insertion measurement is taken, perform:

* [] Get 1: CanDB.get() - retrieve a single item
* [x] Scan (Get multiple): CanDB.scan() - retrieve multiple items
  * [x] Smallest Attribute, Scan 500: For smallest attribute testing, scan and return 500 results (using bounds where you know all items will exist)
  * [x] Medium Attribute, Scan 20: For medium sized attribute testing, scan and return 20 results (using bounds where you know all items will exist)
  * [] Large Attribute, Scan 2: For large sized attribute testing, scan and return 2 results (using bounds where you know all items will exist)


## Insertion Testing

Each of these tests should be run on separate canisters, or before running the next test, the canister should be reinstalled. Each test may take a significant amount of time, so running each of these tests in parallel background processes on independent & separately deployed canisters should speed things up!


For each of these, CanDB.batchPut() will be called for batch entity insertion, and CanDB.put() should be used for single entity insertion.

For each task (denoted by [ ]), repeat the action until a message instruction limit is reached (this is due to GC)

### Smallest Attribute (single Bool Attribute Value, 5k count intervals)
* [x] Insert in Batch: Insert 5k entities in a single update call. After each batch insertion document the # of entities inserted, heap size, cycles usage, and respective cost in USD of batch insertion.
* [x] Insert 1: Start at 0. At each batch insertion “checkpoint” (0, 5k, 10k, etc.) insert 1 more item, and then document the # of entities inserted, heap size, cycles usage, and respective cost in USD of inserting that single item (before & after). Note that After inserting a single item 0 -> 1, the next batch insert should be 4999 items)
* [x] Update 1: Start at 0. At each batch insertion “checkpoint” (0, 5k, 10k, etc.) update a single existing entity with CanDB.put(), and then document the # of entities inserted, heap size, cycles usage, and respective cost in USD of updating the attributes of that single item (before & after). Note that after inserting a single item 0 -> 1, the next batch insert should be 4999 items)
* [x] Insert in parallel: Start at 0. At each batch insertion “checkpoint” (0, 5k, 10k, etc.) make 100 calls in parallel (using Promise.all()) where each call inserts a single entity to CanDB. After the 100 inserts, document the # of entities inserted, heap size, cycles usage, and respective cost in USD of those 100 inserts (before & after). Note that after inserting a single item 0 -> 100, the next batch insert should be 4900 items)

### Medium Sized Attribute (1 KB Blob, 50 count intervals)
* [x] Insert in Batch: Insert 50 entities in a single update call. After each batch insertion document the # of entities inserted, heap size, cycles usage, and respective cost in USD of batch insertion.
* [x] Insert 1: Start at 0. At each batch insertion “checkpoint”, At each batch insertion “checkpoint” (0, 50, 100) insert 1 more item, and then document the # of entities inserted, heap size, cycles usage, and respective cost in USD of inserting that single item (before & after). (Note that after inserting a single item 0 -> 1, the next batch insert should be 49 items)

### Large Attribute (500 KB Blob)
* [x] Insert in Batch: Insert 3 entities at a time (in a single update call). After each batch insertion, document the # of entities inserted, heap size, cycles usage, and respective cost in USD of each batch insertion.
* [x] Insert 1: Insert one entity at a time. After each single entity is inserted document the # of entities inserted, heap size, cycles usage, and respective cost in USD of each insertion.
* [] (Extra, If time permits) Insert in parallel: In 3 simultaneous parallel calls per round, insert a single entity (3 calls, 1 entity per call). After all parallel calls in the round complete, document the # of entities inserted, heap size, cycles usage, and respective cost in USD that all 3 parallel calls incurred.



## Deletion Testing

For each of these tests, to delete an entity use the CanDB.delete() API

For each task (denoted by [ ]), repeat the action until a message instruction limit is reached (this is due to GC)

### Smallest Attribute (single Bool Attribute Value, 5k count intervals)
* [x] Delete 1: Start at 0. At each batch insertion “checkpoint” (0, 5k, 10k, etc.) insert 1 item, then delete a single entity and document the # of entities inserted, heap size, cycles usage, and respective cost of deletion in USD of batch insertion (before & after). After each deletion, batch insert 5k entities in a single update call and repeat.

### Medium Sized Attribute (1 KB Blob, 50 count intervals)
* [x] Delete 1: Start at 0. At each batch insertion “checkpoint” (0, 50, 100, etc.) insert 1 item, then delete a single entity and document the # of entities inserted, heap size, cycles usage, and respective cost of deletion in USD of batch insertion (before & after). After each deletion, batch insert 50 entities in a single update call and repeat.

### Large Attribute (500 KB Blob)
* [x] Delete 1: Start at 0. At each batch insertion “checkpoint” (0, 3, 6, etc.) insert 1 item, then delete a single entity and document the # of entities inserted, heap size, cycles usage, and respective cost of deletion in USD of batch insertion (before & after). After each deletion, batch insert 3 entities in a single update call and repeat.
