/* eslint camelcase: [0] */
/* eslint no-unused-vars: [1] */

export const int = Math.trunc;

export const rad_to_deg = (rad = 0) => (rad * 180) / Math.PI;
export const deg_to_rad = (deg = 0) => (deg * Math.PI) / 180;

/* alias */ export const radToDeg = rad_to_deg;
/* alias */ export const degToRad = deg_to_rad;

// export const rand = (min, max) => Math.random() * (max - min) + min;

export const rand = (min, max) => {
  if (max === undefined) {
    max = min;
    min = 0;
  }
  return min + Math.random() * (max - min);
};

// export const rand_int = range => Math.floor(Math.random() * range);
// /* alias */ export const randInt = rand_int;

export const randInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * Get the norm for `val` between `min` and `max`.
 * Ex. norm(75, 0, 100) ---> 0.75
 */
export const norm = (val, min, max) => (val - min) / (max - min);

/**
 * Apply `norm` (the linear interpolate value) to the range
 * between `min` and `max` (usually between `0` and `1`).
 * Ex. lerp(0.5, 0, 100) ---> 50
 */
export const lerp = (norm, min, max) => min + (max - min) * norm;

/**
 * For `val` in the range between `smin` and `smax`,
 * find out the new value if it were mapped
 * to the range between `dmin` and `dmax`.
 * (currently, not used in the main program)
 * Ex. mapNorm(50, 0, 100, 0, 10000) ---> 5000
 */
export const mapNorm = (val, smin, smax, dmin, dmax) =>
  lerp(norm(val, smin, smax), dmin, dmax);

/**
 * Limit the value to a certain range.
 * Ex. clamp(5000, 0, 100) ---> 100
 */
export const clamp = (val, min, max) =>
  Math.min(Math.max(val, Math.min(min, max)), Math.max(min, max));

/**
 * Get a distance between two points.
 */
export const distance = (p1, p2) => {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
};

export const deg = angle => angle * (180 / Math.PI);
export const rad = angle => angle * (Math.PI / 180);

/**
 * Find the radian from `p2` to `p1`.
 * Ex. deg(angle({ x: 10, y: 10 }, { x: 0, y: 0 })) ---> 45
 */
export const angle = (p1, p2) => Math.atan2(p1.y - p2.y, p1.x - p2.x);

/**
 * See if the value falls within the given range.
 * export const inRange = (val, min, max) => (
 *   val >= Math.min(min, max) && val <= Math.max(min, max)
 * );
 */
export const inRange = (val, min, max) => val >= min && val <= max;

/**
 * See if `x` and `y` falls into the bounds made by `rect`.
 */
export const pointInRect = (x, y, rect) =>
  inRange(x, rect.x, rect.x + rect.width) &&
  inRange(y, rect.y, rect.y + rect.height);

/**
 * See if the given point falls within the arc's radius.
 */
export const pointInArc = (p, a) => distance(p, a) <= a.radius;

/**
 * Merge `props` into `obj`.
 */
export const setProps = (obj, props) => {
  for (let k in props) {
    obj[k] = props[k];
  }
};

export const multicurve = (points, ctx) => {
  let p0, p1, midx, midy;
  // For the first in `points`.
  ctx.moveTo(points[0].x, points[0].y);
  // For all except for the first and the last.
  const size = points.length;
  for (let i = 1; i < size - 2; i += 1) {
    p0 = points[i];
    p1 = points[i + 1];
    midx = (p0.x + p1.x) / 2;
    midy = (p0.y + p1.y) / 2;
    ctx.quadraticCurveTo(p0.x, p0.y, midx, midy);
  }
  // For the last in `points`.
  p0 = points[size - 2];
  p1 = points[size - 1];
  ctx.quadraticCurveTo(p0.x, p0.y, p1.x, p1.y);
};

export default {
  rand,
  randInt,
  norm,
  lerp,
  mapNorm,
  clamp,
  distance,
  deg,
  rad,
  angle,
  inRange,
  pointInRect,
  pointInArc,
  setProps,
  multicurve,
};
