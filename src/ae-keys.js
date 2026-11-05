// After Effects keyframe interpolation, so the code plays AE's own keys
// instead of an approximation of them.
//
// A segment between two keys is a cubic bezier in (time, value) space. Its
// handles come from the keys' temporal ease: the outgoing key's speed and
// influence give P1, the incoming key's give P2 —
//   P1 = (t0 + dt·inf0, v0 + speed0·dt·inf0)
//   P2 = (t1 − dt·inf1, v1 − speed1·dt·inf1)
// — and the value at time t is the curve's y where its x is t. Linear and
// hold segments are what they say. Multi-dimensional non-spatial values
// (Scale) carry one ease per dimension; spatial ones (Position) carry one
// ease for the distance along the path, which is a straight line here
// because every spatial tangent in the comp is zero.

const LIN_INF = 100 / 3;

function bezierY(x0, y0, x1, y1, x2, y2, x3, y3, x) {
  // x(u) is monotonic when influences stay within the segment, so bisect.
  let lo = 0, hi = 1, u = 0.5;
  for (let i = 0; i < 40; i++) {
    u = (lo + hi) / 2;
    const m = 1 - u;
    const xu = m * m * m * x0 + 3 * m * m * u * x1 + 3 * m * u * u * x2 + u * u * u * x3;
    if (xu < x) lo = u; else hi = u;
  }
  const m = 1 - u;
  return m * m * m * y0 + 3 * m * m * u * y1 + 3 * m * u * u * y2 + u * u * u * y3;
}

function segment(k0, k1, t, v0, v1, d) {
  if (k0.o === 'H') return v0;
  const dt = k1.t - k0.t;
  if (k0.o === 'L' && k1.i === 'L') return v0 + (v1 - v0) * (t - k0.t) / dt;
  const slope = (v1 - v0) / dt;
  const [s0, i0] = k0.o === 'L' ? [slope, LIN_INF] : (k0.oe[d] || k0.oe[0]);
  const [s1, i1] = k1.i === 'L' ? [slope, LIN_INF] : (k1.ie[d] || k1.ie[0]);
  const a = dt * i0 / 100, b = dt * i1 / 100;
  return bezierY(k0.t, v0, k0.t + a, v0 + s0 * a, k1.t - b, v1 - s1 * b, k1.t, v1, t);
}

/** Value of an exported AE property at time t (seconds, master clock). */
export function valueAt(prop, t) {
  if (!prop.k) return prop.v;
  const K = prop.k;
  if (t <= K[0].t) return K[0].v;
  if (t >= K[K.length - 1].t) return K[K.length - 1].v;
  let j = 0;
  while (t >= K[j + 1].t) j++;
  const k0 = K[j], k1 = K[j + 1];
  if (!Array.isArray(k0.v)) return segment(k0, k1, t, k0.v, k1.v, 0);
  const spatial = (k0.oe && k0.oe.length === 1) || (k1.ie && k1.ie.length === 1);
  if (spatial) {
    // One ease for the whole vector: interpolate the distance travelled.
    const len = Math.hypot(...k1.v.map((v, i) => v - k0.v[i]));
    if (len === 0) return k0.v;
    const p = segment(k0, k1, t, 0, len, 0) / len;
    return k0.v.map((v, i) => v + (k1.v[i] - v) * p);
  }
  return k0.v.map((v, d) => segment(k0, k1, t, v, k1.v[d], d));
}
