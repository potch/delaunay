const DPR = window.devicePixelRatio;
c.width = 512 * DPR;
c.height = 512 * DPR;
c.style.width = "512px";
let ctx = c.getContext('2d');
ctx.lineWidth = 1 / DPR;
ctx.scale(DPR,DPR);


function dot([x, y], s) {
  ctx.fillRect(x-s/2,y-s/2,s,s);
}

function poly(...pts) {
  ctx.moveTo(...pts[0]);
  pts.slice(1).forEach(p => ctx.lineTo(...p));
  ctx.lineTo(...pts[0]);
}

function drawLine(a, b) {
  ctx.moveTo(...a);
  ctx.lineTo(...b);
}

function drawGuide(a, b) {
  drawLine(linePoint(a, b, -50), linePoint(a, b, 50));
}

let rand = n => Math.random() * n|0;

let invert = a => [a[1], a[0]];
let perp = a => [-a[1], a[0]];
let add = (a, b) => [
  a[0] + b[0],
  a[1] + b[1]
];
let sub = (a, b) => [
  a[0] - b[0],
  a[1] - b[1]
];
let distance = (a, b) => Math.hypot(...sub(a, b));
let linePoint = ([x1, y1], [x2, y2], t) => [
  x1 + t * (x2 - x1),
  y1 + t * (y2 - y1)
];
let findT = (a, b, c, d) => (
  ((a[0] - c[0]) * (c[1] - d[1]) - (a[1] - c[1]) * (c[0] - d[0])) /
  ((a[0] - b[0]) * (c[1] - d[1]) - (a[1] - b[1]) * (c[0] - d[0]))
);
let findU = (a, b, c, d) => (
  ((a[0] - b[0]) * (a[1] - c[1]) - (a[1] - b[1]) * (a[0] - c[0])) /
  ((a[0] - b[0]) * (c[1] - d[1]) - (a[1] - b[1]) * (c[0] - d[0]))
);
let intersection = (a, b, c, d) => linePoint(a, b, findT(a, b, c, d));
let intersects = ([x1,y1], [x2,y2], [x3,y3], [x4,y4]) => {
  let t = findT(a, b, c, d);
  let u = findU(a, b, c, d);
  if (t < 0 || t > 1 || u < 0 || u > 1) {
    return null;
  }
  return linePoint(a, b, 1, t);
}
let circumcenter = (a, b, c) => {
  let mp1 = linePoint(a, b, .5);
  let mp2 = linePoint(b, c, .5);
  return intersection(
    mp1,
    add(mp1, perp(sub(b, a))),
    mp2,
    add(mp2, perp(sub(c, b)))
  );
};
let contains = (a, b, c, d) => {
  let cc = circumcenter(a, b, c);
  return Math.hypot(...sub(d, cc)) < Math.hypot(...sub(a, cc));
}
let pointSort = (a, b) => {
  if (
    a[1] < b[1] ||
    (a[1] === b[1] && a[0] < b[0])
  ) {
    return -1;
  }
  return 1;
}
 
function point(x, y) {
  let p = [x, y];
  p.edges = new Set();
  p.triangles = new Set();
  return p;
}
function edge(a, b, t) {
  let e = [a, b].sort(pointSort);
  e.triangles = new Set();
  return e;
}
function triangle(a, b, c) {
  let t = [a, b, c].sort(pointSort);
  a.triangles.add(t);
  b.triangles.add(t);
  c.triangles.add(t);
  t.edges = [
    edge(a, b),
    edge(b, c),
    edge(c, a)
  ];
  return t;
}
function deleteTriangle(t) {
  t.forEach(p => p.triangles.delete(t));
  t.edges.forEach(e => {
    e.triangles.delete(t);
  });
}

let pts = [];
for (let i=0; i<20; i++) {
  pts.push(point(rand(512), rand(512)));
}

let triangles = new Set();
triangles.add(triangle(...pts.slice(0, 3)));
let toPlace = pts.slice(3);

function delaunay() {
  let d = toPlace.pop();
  
  let hits = [...triangles].filter(t => contains(...t, d));
  if (hits.length) {
    
  } else {
    let closest = pts.filter(
      p => p.triangles.size
    ).sort((a, b) => distance(a, d) - distance(b, d));
    triangles.add(triangle(d, closest[0], closest[1]));
  }
  
  update(d, hits);
  if (toPlace.length) {
    setTimeout(delaunay, 100);
  }
}

function update(current, rings=[]) {
  ctx.clearRect(0,0,512,512);
  ctx.fillStyle = 'black';
  ctx.strokeStyle = 'black';

  pts.forEach(p => dot(p,4));
  ctx.beginPath();
  for (let t of triangles) {
    poly(...t);
  }
  ctx.stroke();

  ctx.fillStyle = 'red';
  ctx.strokeStyle = 'red';
  for (let t of rings) {
    ctx.beginPath();
    let cp = circumcenter(...t);
    ctx.arc(
      cp[0], cp[1],
      Math.hypot(...sub(cp, pts[0])), 
      0, 6.28
    );
    ctx.stroke();
  }
  
  ctx.fillStyle = '#0f0';
  dot(current, 4);
}

delaunay();
