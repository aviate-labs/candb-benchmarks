import Prim "mo:⛔";
import { countInstructions = count } = "mo:base/ExperimentalInternetComputer";

import CanDB "mo:candb/SingleCanisterCanDB";
import Entity "mo:candb/Entity";

actor {
  stable let db = CanDB.init();

  type ConsumableEntity = {
    pk : Entity.PK;
    sk : Entity.SK;
    attributes : [(Entity.AttributeKey, Entity.AttributeValue)];
  };

  public func create(entity : ConsumableEntity) : async Nat64 {
    count(
      func() {
        func createAttributesIfEntityDoesNotExist(attributeMap : ?Entity.AttributeMap) : Entity.AttributeMap {
          switch (attributeMap) {
            case null Entity.createAttributeMapFromKVPairs(entity.attributes);
            case (?map) { map };
          };
        };

        ignore switch (
          CanDB.update(
            db,
            {
              pk = entity.pk;
              sk = entity.sk;
              updateAttributeMapFunction = createAttributesIfEntityDoesNotExist;
            },
          )
        ) {
          case null {
            ?{
              pk = entity.pk;
              sk = entity.sk;
              attributes = entity.attributes;
            };
          };
          case (?entity) { null };
        };
      }
    );
  };

  public query func balance() : async Nat {
    Prim.cyclesBalance();
  };

};
