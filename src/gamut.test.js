import fs from 'fs';
import {fromCgats, gamutVolume} from "./gamut";
import {expect} from 'chai'

describe('fromFIle',function(){
  it('reads in a cgats file',function(){
    this.timeout(60000);
    const file = fs.readFileSync('./samples/sRGB.txt','utf-8');
    const g = fromCgats(file);
    expect(Math.floor(gamutVolume(g))).to.equal(830732);
  })
})