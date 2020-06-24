import {expect} from 'chai';
import Matrix from 't-matrix'
import * as util from './util';
describe('split lines',function(){
  it('iterates a string with one line as itself',function(){
    expect([...util.splitLines('foo')]).to.eql(['foo'])
  });

  it ('iterates a string with multiple lines', function(){
    const str = 'foo\nbar\n\nbaz\n\rfoo\r\nbar';
    const rslt = ['foo','bar','baz','foo','bar'];
    expect([...util.splitLines(str)]).to.eql(rslt);
  })

  it('iterates an array of strings', function(){
    const arr = ['foo\nbar','\n\nbaz\n\r','foo','bar'];
    const rslt = ['foo','bar','baz','foo','bar'];
    expect([...util.splitLines(arr)]).to.eql(rslt);
  })

  it("it iterates it's own result", function(){
    const str = 'foo\nbar\n\nbaz\n\rfoo\r\nbar';
    const rslt = ['foo','bar','baz','foo','bar'];
    expect([...util.splitLines(util.splitLines(str))]).to.eql(rslt);
  })

  it ('ignores comments', function(){
    const str = 'foo\nbar# this is a comment!\n\nbaz\n\rfoo\r\nbar';
    const rslt = ['foo','bar','baz','foo','bar'];
    expect([...util.splitLines(str)]).to.eql(rslt);
  })
})
describe('mapRows',function(){
  it('maps rows correctly to itself',function(){
    const t=Matrix.magic(3);
    const u=[...new Set(t)].sort((a,b)=>a-b);
    expect(util.mapRows(t,t,u)).to.eql([0,1,2]);
  })
  it('maps rows correctly to inverted self',function(){
    const t=Matrix.magic(3);
    const u=[...new Set(t)].sort((a,b)=>a-b);
    expect(util.mapRows(t,t.get([2,1,0],':'),u)).to.eql([2,1,0]);
  })
  it('maps rows correctly to randomised selves',function(){
    const t=Matrix.magic(10).get(':',[1,2,3]).map(v=>v%7);
    const u=[...new Set(t)].sort((a,b)=>a-b);
    const order=[...Matrix.rand(100,1)].map(v=>(v*10)|0);
    expect(util.mapRows(t.get(order,':'),t,u)).to.eql(order);
  })
})
describe('xyz2lab',function(){
  it('converts the ref white to 100,0,0',function(){
    for (let n=0;n<10;n++){
      const XYZn=Matrix.rand(1,3).map(v=>v+0.5);
      expect([...util.XYZ2Lab(XYZn,XYZn)]).to.eql([100,0,0]);
    }
  })
  it('converts samples to expected values',function(){
    const XYZn=Matrix.from([[1,1,1]]);
    const XYZ=Matrix.from([
      [0,0,0],
      [0.125,0.125,0.125],
      [1,1,1]
    ])
    expect(util.XYZ2Lab(XYZ,XYZn).toJSON()).to.eql([
      [0,0,0],
      [42,0,0],
      [100,0,0],
    ]);
  })
})