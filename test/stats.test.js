import test from 'node:test';
import assert from 'node:assert/strict';
import {calculate} from '../public/stats.js';
test('empty and single readings do not invent capability or limits',()=>{assert.equal(calculate([],0,10).mean,null);const s=calculate([5],0,10);assert.equal(s.mean,5);assert.equal(s.ucl,null);assert.equal(s.cpk,null);});
test('I-MR estimates and specification decisions match known data',()=>{const s=calculate([2,4,6],0,8);assert.equal(s.mean,4);assert.equal(s.mr,2);assert.equal(s.ucl,9.32);assert.ok(Math.abs(s.cpk-.752)<1e-10);assert.equal(s.out,0);assert.equal(calculate([-1,0,8,9],0,8).out,2);});
test('constant series has no finite capability estimate',()=>{assert.equal(calculate([5,5,5],0,10).cpk,null);});
test('isolated large deviation is detected by individual chart',()=>{const s=calculate([...Array(30).fill(10),20],0,30);assert.equal(s.signals,1);});
