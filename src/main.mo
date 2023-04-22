import Prim "mo:⛔";
import { countInstructions = count } = "mo:base/ExperimentalInternetComputer";

import CanDB "mo:candb/CanDB";
import Entity "mo:candb/Entity";

actor {
  public shared func scale(t : Text) : async Text { t };
  private let initArgs : CanDB.DBInitOptions = {
    pk = "nat";
    scalingOptions = {
      autoScalingHook = scale;
      sizeLimit = #count(999_000_000_000);
    };
    btreeOrder = null;
  };

  stable var db = CanDB.init(initArgs);

  type ConsumableEntity = {
    pk : Entity.PK;
    sk : Entity.SK;
    attributes : [(Entity.AttributeKey, Entity.AttributeValue)];
  };

  private func _create(entity : ConsumableEntity) {
    func createAttributesIfEntityDoesNotExist(attributeMap : ?Entity.AttributeMap) : Entity.AttributeMap {
      switch (attributeMap) {
        case null Entity.createAttributeMapFromKVPairs(entity.attributes);
        case (?map) { map };
      };
    };

    ignore CanDB.update(
      db,
      {
        pk = entity.pk;
        sk = entity.sk;
        updateAttributeMapFunction = createAttributesIfEntityDoesNotExist;
      },
    );
  };

  public shared func clear() : async () {
    db := CanDB.init(initArgs);
  };

  public func create(entity : ConsumableEntity) : async Nat64 {
    count(func() = _create(entity));
  };

  public func createAll(entities : [ConsumableEntity]) : async Nat64 {
    count(func() = for (entity in entities.vals()) _create(entity));
  };

  public query func balance() : async Nat {
    Prim.cyclesBalance();
  };

};
