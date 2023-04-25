export const idlFactory = ({ IDL }) => {
  const Tree = IDL.Rec();
  const SK = IDL.Text;
  const AttributeKey = IDL.Text;
  const AttributeValuePrimitive = IDL.Variant({
    'int' : IDL.Int,
    'float' : IDL.Float64,
    'bool' : IDL.Bool,
    'text' : IDL.Text,
  });
  const Color = IDL.Variant({ 'B' : IDL.Null, 'R' : IDL.Null });
  const AttributeValueRBTreeValue = IDL.Variant({
    'int' : IDL.Int,
    'float' : IDL.Float64,
    'tuple' : IDL.Vec(AttributeValuePrimitive),
    'blob' : IDL.Vec(IDL.Nat8),
    'bool' : IDL.Bool,
    'text' : IDL.Text,
    'arrayBool' : IDL.Vec(IDL.Bool),
    'arrayText' : IDL.Vec(IDL.Text),
    'arrayInt' : IDL.Vec(IDL.Int),
    'arrayFloat' : IDL.Vec(IDL.Float64),
  });
  Tree.fill(
    IDL.Variant({
      'leaf' : IDL.Null,
      'node' : IDL.Tuple(
        Color,
        Tree,
        IDL.Tuple(IDL.Text, IDL.Opt(AttributeValueRBTreeValue)),
        Tree,
      ),
    })
  );
  const AttributeValue = IDL.Variant({
    'int' : IDL.Int,
    'float' : IDL.Float64,
    'tuple' : IDL.Vec(AttributeValuePrimitive),
    'blob' : IDL.Vec(IDL.Nat8),
    'bool' : IDL.Bool,
    'text' : IDL.Text,
    'tree' : Tree,
    'arrayBool' : IDL.Vec(IDL.Bool),
    'arrayText' : IDL.Vec(IDL.Text),
    'arrayInt' : IDL.Vec(IDL.Int),
    'arrayFloat' : IDL.Vec(IDL.Float64),
  });
  const ConsumableEntity = IDL.Record({
    'sk' : SK,
    'attributes' : IDL.Vec(IDL.Tuple(AttributeKey, AttributeValue)),
  });
  return IDL.Service({
    'batchPut' : IDL.Func([IDL.Vec(ConsumableEntity)], [IDL.Nat64], []),
    'delete' : IDL.Func([SK], [IDL.Nat64], []),
    'get' : IDL.Func([SK], [], ['query']),
    'put' : IDL.Func([ConsumableEntity], [IDL.Nat64], []),
    'scale' : IDL.Func([IDL.Text], [IDL.Text], []),
    'scan' : IDL.Func([SK, IDL.Nat, SK, SK], [], ['query']),
    'size' : IDL.Func([], [IDL.Nat], ['query']),
    'stats' : IDL.Func([], [IDL.Nat, IDL.Nat], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
