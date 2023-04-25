import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export type AttributeKey = string;
export type AttributeValue = { 'int' : bigint } |
  { 'float' : number } |
  { 'tuple' : Array<AttributeValuePrimitive> } |
  { 'blob' : Uint8Array | number[] } |
  { 'bool' : boolean } |
  { 'text' : string } |
  { 'tree' : Tree } |
  { 'arrayBool' : Array<boolean> } |
  { 'arrayText' : Array<string> } |
  { 'arrayInt' : Array<bigint> } |
  { 'arrayFloat' : Array<number> };
export type AttributeValuePrimitive = { 'int' : bigint } |
  { 'float' : number } |
  { 'bool' : boolean } |
  { 'text' : string };
export type AttributeValueRBTreeValue = { 'int' : bigint } |
  { 'float' : number } |
  { 'tuple' : Array<AttributeValuePrimitive> } |
  { 'blob' : Uint8Array | number[] } |
  { 'bool' : boolean } |
  { 'text' : string } |
  { 'arrayBool' : Array<boolean> } |
  { 'arrayText' : Array<string> } |
  { 'arrayInt' : Array<bigint> } |
  { 'arrayFloat' : Array<number> };
export type Color = { 'B' : null } |
  { 'R' : null };
export interface ConsumableEntity {
  'sk' : SK,
  'attributes' : Array<[AttributeKey, AttributeValue]>,
}
export type SK = string;
export type Tree = { 'leaf' : null } |
  { 'node' : [Color, Tree, [string, [] | [AttributeValueRBTreeValue]], Tree] };
export interface _SERVICE {
  'batchPut' : ActorMethod<[Array<ConsumableEntity>], bigint>,
  'delete' : ActorMethod<[SK], bigint>,
  'get' : ActorMethod<[SK], undefined>,
  'put' : ActorMethod<[ConsumableEntity], bigint>,
  'scale' : ActorMethod<[string], string>,
  'scan' : ActorMethod<[SK, bigint, SK, SK], undefined>,
  'size' : ActorMethod<[], bigint>,
  'stats' : ActorMethod<[], [bigint, bigint]>,
}
