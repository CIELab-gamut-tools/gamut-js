import {gamutVolume} from "./gamut";
import {expect} from 'chai'
import {makeSynthetic} from "./synthetic";

describe('makeSynthetic',function(){
  it('makes an sRGB gamut with the correct volume',function(){
    const g = makeSynthetic('srgb');
    expect(Math.floor(gamutVolume(g))).to.equal(830766);
  })
  it('makes a BT2020 gamut with the correct volume',function(){
    const g = makeSynthetic('bt.2020');
    expect(Math.floor(gamutVolume(g))).to.equal(1853164);
  })
})