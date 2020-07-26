import fs from 'fs';
import {fromCgats} from "./gamut";
import {rings, ringsSVG} from "./rings";
import {expect} from 'chai'

describe('rings',function(){
  it('reads in a cgats file',function(){
    this.timeout(60000);
    const file = fs.readFileSync('./samples/sRGB.txt','utf-8');
    const g = fromCgats(file);
    const [a,b,C,v] = rings(g,[10,'::',10,100]);
    expect(Math.floor(v)).to.equal(830732);
  })
})