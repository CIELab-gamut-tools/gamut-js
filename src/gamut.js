import {readCgats} from "./cgats";
import {from, min, max, mult, zeros, cross, product, mapMany, hcat, sum} from 't-matrix';
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
  Object.assign(g, opts);
  return fromXYZ(g);
}

export function fromXYZ(g) {
  g.gsv = [...new Set(g.RGB)].sort((a, b) => a - b);
  const [TRI_ref, RGB_ref] = makeTesselation(g.gsv);
  const map = mapRows(RGB_ref, g.RGB, g.gsv);
  if (map.indexOf(undefined) >= 0) throw new Error('GAMUT:: Missing RGB data');
  g.TRI = TRI_ref.map(i => map[i]);

  return fromTRIXYZ(g);
}

export function fromTRIXYZ(g) {
  g.RGBmax = g.gsv[g.gsv.length - 1];
  g.XYZn = g.XYZ.get([...min(g.RGB, null, 2)].indexOf(g.RGBmax), ':');
  // D50 is the default chromatic adaptation
  if (!g.caXYZn) g.caXYZn = from([[0.9642957, 1, 0.8251046]])
  g.caXYZ = camcat_cc(g.XYZ, g.XYZn, g.caXYZn);
  g.LAB = XYZ2Lab(g.caXYZ, g.caXYZn);

  return fromTRILAB(g)
}

export function fromTRILAB(g) {
  if (!g.Lsteps) g.Lsteps = 100;
  if (!g.hsteps) g.hsteps = 360;

  const {TRI, LAB, Lsteps, hsteps} = g;
  const Z = LAB.get(':', [1, 2, 0]);
  const maxL = max(
    Z.get([...TRI.get(':', 0)], 2),
    Z.get([...TRI.get(':', 1)], 2),
    Z.get([...TRI.get(':', 2)], 2));
  const minL = min(
    Z.get([...TRI.get(':', 0)], 2),
    Z.get([...TRI.get(':', 1)], 2),
    Z.get([...TRI.get(':', 2)], 2));

  const deltaHue = 2 * Math.PI / hsteps;

  //quick way of building a 2D array.
  const cylmap = zeros(Lsteps, hsteps).toJSON();

  for (let p = 0; p < Lsteps; p++) {
    let
      Lmid = (p + 0.5) * 100 / Lsteps,
      orig = from([[0, 0, Lmid]]),
      IX = find(mapMany(minL, maxL, (mn, mx) => mn <= Lmid && Lmid < mx)),
      vert0 = Z.get([...TRI.get(IX, 0)], ':'),
      vert1 = Z.get([...TRI.get(IX, 1)], ':'),
      vert2 = Z.get([...TRI.get(IX, 2)], ':'),
      edge1 = mapMany(vert1, vert0, (v1, v0) => v1 - v0),
      edge2 = mapMany(vert2, vert0, (v2, v0) => v2 - v0),
      o = mapMany(orig, vert0, (or, v0) => or - v0),
      e2e1 = cross(edge2, edge1, 2),
      e2o = cross(edge2, o, 2),
      oe1 = cross(o, edge1, 2);

    //from here, drop down to plain arrays for speed.
    //these are the arrays to be used in the inner loop
    let e2oe1 = [...sum(product(edge2, oe1), null, 2)];
    e2e1 = [...e2e1.get(':', [0, 1])];
    e2o = [...e2o.get(':', [0, 1])];
    oe1 = [...oe1.get(':', [0, 1])];

    const L = e2oe1.length;

    for (let q = 0; q < hsteps; q++) {
      const dat = [];
      const Hmid = (q + 0.5) * deltaHue,
        ds = Math.sin(Hmid),
        dc = Math.cos(Hmid);
      let idet,u,v,t;
      for (let l = 0, i = 0; l < L; l++, i += 2) {
        idet = 1 / (ds * e2e1[i] + dc * e2e1[i + 1]);
        if ( (t = idet * e2oe1[l]) > 0 &&
          (u = idet * (ds * e2o[i] + dc * e2o[i + 1])) >= 0 &&
          (v = idet * (ds * oe1[i] + dc * oe1[i + 1])) >= 0 &&
          u + v <= 1 ) dat.push([Math.sign(idet), t]);
      }
      cylmap[p][q] = dat;
    }
  }
  g.cylmap = cylmap;
  return g;
}

export function gamutVolume(g) {
  let
    dH = 2 * Math.PI / g.hsteps,
    dL = 100 / g.Lsteps,
    tot = 0;
  for (let i = 0; i < g.Lsteps; i++)
    for (let j = 0; j < g.hsteps; j++) {
      const m = g.cylmap[i][j];
      for (let k = 0; k < m.length; k++)
        tot += m[k][0] * m[k][1] * m[k][1];
    }
  return tot * dL * dH / 2;
}