"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var t=require("t-matrix");function e(e){const r=(e=[...e]).length;let[o,a]=t.grid(e,e);o=t.reshape(o,r*r,1),a=t.reshape(a,r*r,1);const s=t.zeros(r*r,1).set(e[0]),n=t.zeros(r*r,1).set(e[r-1]),p=t.mcat([[s,o,a],[a,s,o],[o,a,s],[n,a,o],[o,n,a],[a,o,n]]),f=t.zeros(12*(r-1)*(r-1),3);let l=0;for(let t=0;t<6;t++)for(let e=0;e<r-1;e++)for(let o=0;o<r-1;o++){let a=r*r*t+r*e+o;f.set([l,l+1],":",[[a,a+r,a+1],[a+r,a+r+1,a+1]]),l+=2}return[f,p]}function r(e,r){const o=t.from([...t.rows(e)].map(([t,e])=>[t/e,1,(1-t-e)/e]));return r?product(o,r):o}function o(e){const r={},o=function*(t){if(null!=t){"string"!=typeof t&&"function"==typeof t[Symbol.iterator]||(t=[t]);for(let e of t)if("string"==typeof e)for(let t of e.match(/[^\r\n]+/g))yield t.split("#")[0]}}(e)[Symbol.iterator]();let a,s,n,p,f;const l=()=>(a=o.next()).done;for(;!l();){const[e,...o]=a.value.split(/\s+/);if(/^CGATS/.test(e))r.version=e;else switch(e){case"BEGIN_DATA_FORMAT":for(n=[];!l()&&"END_DATA_FORMAT"!==a.value;)n.push(...a.value.toUpperCase().split(/\s+/));break;case"NUMBER_OF_SETS":s=Number.parseInt(o[0]);break;case"BEGIN_DATA":if(!s||!n)throw new Error("readCGATS: NUMBER_OF_SETS and *_DATA_FORMAT required before BEGIN_DATA");p=t.zeros(s,n.length),f=0;let m=n.indexOf("SAMPLEID");for(-1===m&&(m=n.indexOf("SAMPLE_ID")),-1===m&&(m=n.indexOf("SAMPLE_NO"));!l()&&"END_DATA"!==a.value;){const t=a.value.split(/\s+/).map(Number.parseFloat);if(m>=0){if(f=t[m],f<1||f>s)throw new Error("readCGATS: SampleID outside the range 1..NUMBER_OF_SETS");p.set(f-1,":",[t])}else p.set(f++-1,":",[t])}if(f!==s)throw new Error("readCGATS: data rows does not match NUMBER_OF_SETS");r.format={};for(let t=0;t<n.length;t++)r.format[n[t]]=t;r.data=p;break;default:r[e]=o.join(" ")}}return r}function a(t){t.gsv=[...new Set(t.RGB)].sort((t,e)=>t-e);const[r,o]=e(t.gsv),a=function(t,e,r){const o=new Map(r.map((t,e)=>[t,e])),a=r.length,s=([t,e,r])=>o.get(t)+a*(o.get(e)+a*o.get(r)),n=new Map(e.toJSON().map((t,e)=>[s(t),e]));return t.toJSON().map(t=>n.get(s(t)))}(o,t.RGB,t.gsv);if(a.indexOf(void 0)>=0)throw new Error("GAMUT:: Missing RGB data");return t.TRI=r.map(t=>a[t]),s(t)}function s(e){return e.RGBmax=e.gsv[e.gsv.length-1],e.XYZn=e.XYZ.get([...t.min(e.RGB,null,2)].indexOf(e.RGBmax),":"),e.caXYZn||(e.caXYZn=t.from([[.9642957,1,.8251046]])),e.caXYZ=function(e,r,o){const a=t.from([[.8951,.2664,-.1614],[-.7502,1.7135,.0367],[.0389,-.0685,1.0296]]).t,s=t.mult(r,a),n=t.mult(o,a),p=t.diag(t.mapMany(n,s,(t,e)=>t/e).t),f=t.div(t.mult(a,p),a);return t.mult(e,f)}(e.XYZ,e.XYZn,e.caXYZn),e.LAB=function(e,r){const o=t.mapMany(e,r,(t,e)=>t/e).map(t=>t<=216/24389?t*(24389/3132)+16/116:Math.pow(t,1/3));return t.from([...t.rows(o)].map(([t,e,r])=>[116*e-16,500*(t-e),200*(e-r)]))}(e.caXYZ,e.caXYZn),n(e)}function n(t){t.Lsteps||(t.Lsteps=100),t.hsteps||(t.hsteps=360);const{TRI:e,LAB:r,Lsteps:o,hsteps:a}=t,s=new Uint32Array(e),n=new Float64Array(r),f=s.length/3,l=new Float64Array(f),m=new Float64Array(f);for(let t=0,e=0;e<f;e++){const r=n[3*s[t++]],o=n[3*s[t++]],a=n[3*s[t++]];r>o?o>a?(m[e]=a,l[e]=r):(m[e]=o,l[e]=r>a?r:a):o>a?(m[e]=r>a?a:r,l[e]=o):(m[e]=r,l[e]=a),l[e]=Math.max(r,o,a),m[e]=Math.min(r,o,a)}const i=2*Math.PI/a,c=new Array(o);for(let t=0;t<o;t++){const e=100*(t+.5)/o,r=[];for(let t=0;t<f;t++)m[t]<=e&&e<l[t]&&r.push(t);const u=r.length,g=new Float64Array(2*u),h=new Float64Array(2*u),d=new Float64Array(2*u),w=new Float64Array(u);for(let t=0,o=0;t<u;t++,o+=2){const a=3*r[t],p=3*s[a],f=3*s[a+1],l=3*s[a+2],m=n[p],i=n[p+1],c=n[p+2],u=n[f]-m,y=n[f+1]-i,M=n[f+2]-c,A=n[l]-m,R=n[l+1]-i,B=n[l+2]-c,G=e-m,_=-i,x=-c;g[o]=B*u-A*M,g[o+1]=y*A-R*u,h[o]=B*G-A*x,h[o+1]=_*A-R*G,d[o]=x*u-G*M,d[o+1]=y*G-_*u,w[t]=R*d[o]+B*d[o+1]+A*(_*M-y*x)}c[t]=p(g,h,d,w,a,i)}return t.cylmap=c,t}function p(t,e,r,o,a,s){const n=o.length,p=new Array(a);for(let f=0;f<a;f++){const a=[],l=(f+.5)*s,m=Math.sin(l),i=Math.cos(l);let c,u,g,h;for(let s=0,p=0;s<n;s++,p+=2)c=1/(m*t[p]+i*t[p+1]),(h=c*o[s])>0&&(u=c*(m*e[p]+i*e[p+1]))>=0&&(g=c*(m*r[p]+i*r[p+1]))>=0&&u+g<=1&&a.push([Math.sign(c),h]);p[f]=a}return p}const f={d50:[.3457,.3585],d55:[.3324,.3474],d60:[.32168,.33767],d65:[.3127,.329],d75:[.299,.3149]},l={default:{driveMapping:t=>t,gamma:2.4,black:null,blackRatio:0,steps:10,white:"d65",RGBxy:[[.64,.33],[.3,.6],[.15,.06]]},srgb:{white:"d65",RGBxy:[[.64,.33],[.3,.6],[.15,.06]],gamma:t=>t>.04045?Math.pow((200*t+11)/211,2.4):25*t/323},"bt.2020":{white:"d65",RGBxy:[[.708,.292],[.17,.797],[.131,.046]],gamma:2.4},"dci-p3":{white:[.314,.351],RGBxy:[[.68,.32],[.265,.69],[.15,.06]],gamma:2.4},"d65-p3":{white:"d65",RGBxy:[[.68,.32],[.265,.69],[.15,.06]],gamma:2.4},"d50-p3":{white:"d50",RGBxy:[[.68,.32],[.265,.69],[.15,.06]],gamma:2.4}};exports._fromTRILAB=function(e){e.Lsteps||(e.Lsteps=100),e.hsteps||(e.hsteps=360);const{TRI:r,LAB:o,Lsteps:a,hsteps:s}=e,n=o.get(":",[1,2,0]),f=t.max(n.get([...r.get(":",0)],2),n.get([...r.get(":",1)],2),n.get([...r.get(":",2)],2)),l=t.min(n.get([...r.get(":",0)],2),n.get([...r.get(":",1)],2),n.get([...r.get(":",2)],2)),m=2*Math.PI/s,i=new Array(a);for(let e=0;e<a;e++){let o=100*(e+.5)/a,u=t.from([[0,0,o]]),g=(c=t.mapMany(l,f,(t,e)=>t<=o&&o<e),[...c].map((t,e)=>[t,e]).filter(t=>t[0]).map(t=>t[1])),h=n.get([...r.get(g,0)],":"),d=n.get([...r.get(g,1)],":"),w=n.get([...r.get(g,2)],":"),y=t.mapMany(d,h,(t,e)=>t-e),M=t.mapMany(w,h,(t,e)=>t-e),A=t.mapMany(u,h,(t,e)=>t-e),R=t.cross(M,y,2),B=t.cross(M,A,2),G=t.cross(A,y,2);i[e]=p([...R.get(":",[0,1])],[...B.get(":",[0,1])],[...G.get(":",[0,1])],[...t.sum(t.product(M,G),null,2)],s,m)}var c;return e.cylmap=i,e},exports.fromCgats=function(t,e){const r=o(t),s=["RGB_R","RGB_G","RGB_B"],n=["XYZ_X","XYZ_Y","XYZ_Z"];for(let t of[...s,...n])if(!r.format.hasOwnProperty(t))throw new Error("GAMUT:: Cgats file must have the following data - "+PROPS.join(", "));return r.RGB=r.data.get(":",s.map(t=>r.format[t])),r.XYZ=r.data.get(":",n.map(t=>r.format[t])),Object.assign(r,e),a(r)},exports.fromTRILAB=n,exports.fromTRIXYZ=s,exports.fromXYZ=a,exports.gamutVolume=function(t){let e=2*Math.PI/t.hsteps,r=100/t.Lsteps,o=0;for(let e=0;e<t.Lsteps;e++)for(let r=0;r<t.hsteps;r++){const a=t.cylmap[e][r];for(let t=0;t<a.length;t++)o+=a[t][0]*a[t][1]*a[t][1]}return o*r*e/2},exports.makeSynthetic=function(o,s){s="string"==typeof o?Object.assign({},l.default,l[o.toLowerCase()],s):Object.assign({},l.default,o);let{white:n,RGBxy:p,gamma:m,black:i,blackRatio:c,steps:u,colorantXYZ:g,driveMapping:h}=s,d="function"==typeof m?m:t=>Math.pow(t,m),w=t.from([h([1,1,1])]);if(g)g=t.from(g);else{for(;"string"==typeof n;)n=f[n]||l[n].white;n=t.from([n]);let e=r(n),o=r(t.from(p)),a=t.div(e,o);g=t.product(o,a.t),w.length>3&&(g=t.vcat([g,e]))}let y=t.mult(w,g),M=t.zeros(1,3);if(c){if(i)for(;"string"==typeof i;)i=f[i]||l[i].white;else i=n;M=r(i,y.get(0,1)/(1/c-1))}let A=e(t.from([0,":",u]))[1];const R=u+1;A=t.from([...new Map([...t.rows(A)].map(([t,e,r])=>[t+R*(e+R*r),[t,e,r]])).values()]),A=A.map(t=>t/u);let B=A.map(d),G=t.from([...t.rows(B)].map(h));return a({RGB:A,XYZ:t.sum(t.mult(G,g),M)})},exports.rings=function(e,r){const o=2*Math.PI/e.hsteps,a=100/e.Lsteps*o/2,s=t.from(e.cylmap.map(t=>t.map(t=>{let e=0;for(let r of t)e+=r[0]*r[1]*r[1]*a;return e}))),n=t.vcat(t.zeros(1,e.hsteps),t.cumsum(s).map(t=>Math.pow(2*t/o,.5))),p=t.gridInterp1(n,r),f=t.from([[o/2,"::",o,2*Math.PI]]);return[t.product(f.map(Math.sin),p),t.product(f.map(Math.cos),p),p,t.sum(s)]};
