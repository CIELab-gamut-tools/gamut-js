import {readCgats} from "./cgats";
import {from,min,max,mult,zeros,cross,product,mapMany,hcat,sum} from 't-matrix';
import {camcat_cc, makeTesselation, mapRows, XYZ2Lab, find} from "./util";

export function fromCgats(file, opts) {
  const g = readCgats(file);
  const RGBp = ['RGB_R', 'RGB_G', 'RGB_B'], XYZp = ['XYZ_X', 'XYZ_Y', 'XYZ_Z'];
  for (let prop of [...RGBp, ...XYZp]) {
    if (!g.format.hasOwnProperty(prop)) {
      throw new Error('GAMUT:: Cgats file must have the following data - ' + PROPS.join(', '));
    }
  }
  g.RGB = g.data.get(':', RGBp.map(p => g.format[p]));
  g.XYZ = g.data.get(':', XYZp.map(p => g.format[p]));
  Object.assign(g,opts);
  return fromXYZ(g);
}

export function fromXYZ(g){
  g.gsv =  [...new Set(g.RGB)].sort((a,b)=>a-b);
  const [TRI_ref,RGB_ref] = makeTesselation(g.gsv);
  const map = mapRows(RGB_ref, g.RGB, g.gsv);
  if (map.indexOf(undefined)>=0) throw new Error('GAMUT:: Missing RGB data');
  g.TRI = TRI_ref.map(i=>map[i]);

  return fromTRIXYZ(g);
}

export function fromTRIXYZ(g){
  g.RGBmax = g.gsv[g.gsv.length-1];
  g.XYZn = g.XYZ.get([...min(g.RGB,null,2)].indexOf(g.RGBmax),':');
  // D50 is the default chromatic adaptation
  if (!g.caXYZn) g.caXYZn = from([[0.9642957, 1, 0.8251046]])
  g.caXYZ = camcat_cc(g.XYZ, g.XYZn, g.caXYZn);
  g.LAB = XYZ2Lab(g.caXYZ,g.caXYZn);

  return fromTRILAB(g)
}

export function fromTRILAB(g){
  if (!g.Lsteps) g.Lsteps=100;
  if (!g.hsteps) g.hsteps=360;

  const {TRI, LAB, Lsteps, hsteps} = g;
  const Z = LAB.get(':',[1,2,0]);
  const maxL = max(
    Z.get([...TRI.get(':',0)],2),
    Z.get([...TRI.get(':',1)],2),
    Z.get([...TRI.get(':',2)],2));
  const minL = min(
    Z.get([...TRI.get(':',0)],2),
    Z.get([...TRI.get(':',1)],2),
    Z.get([...TRI.get(':',2)],2));

  const deltaHue = 2*Math.PI/hsteps;

  const cylmap=zeros(Lsteps,hsteps).toJSON();

  for(let p=0; p<Lsteps; p++){
    let
      Lmid = (p+0.5)*100/Lsteps,
      orig=from([[0,0,Lmid]]),
      IX=find(mapMany(minL,maxL,(mn,mx)=>mn<=Lmid && Lmid<mx)),
      vert0=Z.get([...TRI.get(IX,0)],':'),
      vert1=Z.get([...TRI.get(IX,1)],':'),
      vert2=Z.get([...TRI.get(IX,2)],':'),
      edge1 = mapMany(vert1,vert0,(v1,v0)=>v1-v0),
      edge2 = mapMany(vert2,vert0,(v2,v0)=>v2-v0),
      o = mapMany(orig,vert0,(or,v0)=>or-v0),
      e2e1 = cross(edge2, edge1, 2),
      e2o = cross(edge2, o, 2),
      oe1 = cross(o,edge1, 2),
      e2oe1 = sum(product(edge2,oe1),null,2);
    e2e1 = e2e1.get(':',[0,1]);
    e2o = e2o.get(':',[0,1]);
    oe1 = oe1.get(':',[0,1]);

    for(let q=0; q<hsteps; q++){
      let
        Hmid = (q+0.5)*deltaHue,
        dir = from([Math.sin(Hmid),Math.cos(Hmid)]),

        idet = mult(e2e1,dir).map(v=>1/v),
        u = product(mult(e2o,dir),idet),
        v = product(mult(oe1,dir),idet),
        t = product(e2oe1,idet),
        ix = find(mapMany(u,v,t,(u,v,t)=>u>=0 && v>=0 && u+v<=1 && t>=0));
      if (!ix.length){
        ix = find(mapMany(u,v,t,(u,v,t)=>u>=0.001 && v>=0.001 && u+v<=1.001 && t>=0));
      }
      cylmap[p][q]=hcat(idet.get(ix,0).map(v=>Math.sign(v)), t.get(ix,0)).toJSON();
    }
  }
  g.cylmap = cylmap;
  return g;
}

export function gamutVolume(g){
  let
    dH = 2 * Math.PI/g.hsteps,
    dL = 100/g.Lsteps,
    tot=0;
  for (let i=0;i<g.Lsteps; i++)
    for (let j=0;j<g.hsteps; j++){
      const m = g.cylmap[i][j];
      for (let k=0;k<m.length;k++)
        tot+=m[k][0]*m[k][1]*m[k][1];
    }
  return tot*dL*dH/2
}