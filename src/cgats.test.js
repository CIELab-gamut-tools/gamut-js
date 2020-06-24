import {expect} from 'chai';
import {readCgats} from "./cgats";
import fs from 'fs';
import {sum} from 't-matrix';

describe('readCgats',function(){
  it('reads in a cgats file',function(){
    const file = fs.readFileSync('./samples/sRGB.txt','utf-8');
    const cgats = readCgats(file);
    expect(cgats).to.have.keys('version','format','data');
    expect(sum(cgats.data.get(':',cgats.format.SAMPLEID))).to.equal(301*603);
  })
})