import React, { useState } from 'react';
import { CustomPIXIComponent, usePixiTicker } from 'react-pixi-fiber';
import * as PIXI from 'pixi.js';

import * as mathlib from '@/lib/math';

const { int } = mathlib;

export const PlaneGraphics = CustomPIXIComponent(
  {
    customDisplayObject: props => new PIXI.Graphics(),
    customApplyProps: function (g, oldProps, newProps) {
      const {
        index,
        vars: { tick },
        plane: { x, y, ox, oy, speed, colorIndex, path, approaching },
        options: {
          plane_path_max,
          plane_path_modular_segment,
          plane_unique_color,
          plane_holding_color,
          plane_flight_color,
          plane_path_color,
        },
      } = newProps;

      if (typeof oldProps !== 'undefined') {
        g.clear();
      }

      g.moveTo(x, y);

      const angle = mathlib.angle({ x: ox, y: oy }, { x, y });
      const size = 3;
      const trailSize = 3 + speed * 2;

      let color = plane_unique_color;

      if (index > 3) {
        color = approaching ? plane_holding_color : plane_flight_color;
      }

      g.lineStyle(size, color, 1);
      g.lineTo(
        x - Math.cos(angle) * trailSize,
        y - Math.sin(angle) * trailSize
      );

      if (path.length > 1) {
        g.lineStyle(1, plane_path_color, 0.4);

        const [pth0, pth1] = path;

        let _x = 0;
        let _y = 0;

        if (path.length >= plane_path_max) {
          const segment = plane_path_modular_segment;
          let angle = mathlib.angle(pth1, pth0);
          let dx = pth0.x - pth1.x;
          let dy = pth0.y - pth1.y;
          let dist = Math.sqrt(dx * dx + dy * dy);
          _x = pth0.x + Math.cos(angle) * (dist * ((tick % segment) / segment));
          _y = pth0.y + Math.sin(angle) * (dist * ((tick % segment) / segment));
        } else {
          _x = pth0.x;
          _y = pth0.y;
        }

        g.moveTo(_x, _y);

        // g.moveTo(path[0].x, path[0].y);

        for (let i = 1; i < path.length; i++) {
          let point = path[i];
          g.lineTo(point.x, point.y);
        }
        g.lineTo(x, y);
      }
    },
  },
  'PlaneGraphics'
);

/*
 * Does not have "destIndex" when resetting at initial generation.
 */
const selectNextDestination = ({
  ports = [],
  originIndex = 0,
  origin,
  destIndex,
}) => {
  if (destIndex !== undefined) {
    originIndex = destIndex;
    origin = ports[originIndex];
  }

  const max = ports.length - 1;

  // Choosing "destIndex", but it cannot be
  // the same place where it left off.
  destIndex = mathlib.randInt(0, max);
  while (destIndex === originIndex) {
    destIndex = mathlib.randInt(0, max);
  }

  return {
    originIndex,
    origin,
    dest: ports[destIndex],
    destIndex,
    approaching: false,
    holding: false,
  };
};

export const usePlanes = () => {
  const [planes, setPlanes] = useState([]);

  const resetPlanes = ({ ports = [], num_of_planes }) => {
    console.log('(widget) [plane] RESET --> PLANES');

    // console.log(`(widget) [plane] ports.length: ${ports.length}`);

    setPlanes([]);

    if (ports.length) {
      const _planes = [];

      const generate = index => {
        const originIndex = mathlib.randInt(0, ports.length - 1);
        const origin = ports[originIndex];

        // Determines the curve of the airplane paths.
        const vRange = 0.5;

        return {
          index,
          colorIndex: 0,
          path: [],
          originIndex, // to be overwritten
          origin, // to be overwritten
          x: origin.x,
          y: origin.y,
          ox: 0,
          oy: 0,
          vx: mathlib.rand(-vRange, vRange),
          vy: mathlib.rand(-vRange, vRange),
          vmax: 1,
          speed: 0,
          angle: 0,
          accel: 0.01,
          decel: 0.96,
          // Adds the following:
          // - dest
          // - destIndex
          // - approaching
          // - holding
          // but will NOT overwrite:
          // - originIndex
          // - origin
          ...selectNextDestination({ ports, originIndex, origin }),
        };
      };

      // console.log('(widget) [plane] planes:');
      for (let i = 0; i < num_of_planes; i++) {
        const p = generate(i);
        // if (i < 10) {
        //   console.log(`(widget) [plane] plane[${i}] (${int(p.x)}, ${int(p.y)})`);
        // }
        _planes.push(p);
      }

      // console.log(`(widget) [plane] planes.length: ${_planes.length}`);

      setPlanes(_planes);
    }
  };
  // END OF: resetPlanes()

  const updatePlanes = ({
    vars: { cw, ch, tick, dt, approachingDist },
    ports = [],
    options: {
      num_of_planes,
      plane_path_modular_segment,
      plane_path_max,
      plane_holding_distance,
    },
  }) => {
    const _planes = planes.slice();

    if (_planes.length && ports.length) {
      for (let i = 0; i < num_of_planes; i++) {
        const {
          index,
          colorIndex,
          path,
          originIndex,
          origin,
          x,
          y,
          vx,
          vy,
          vmax,
          decel,
          accel,
          approaching,
          holding,
          dest,
          destIndex,
        } = _planes[i];

        const ox = x; // Save a copy.
        const oy = y; // Save a copy.

        // Make the trailing effect!
        if (tick % plane_path_modular_segment == 0) {
          path.push({ x, y });
        }

        // Cut the trailing path.
        if (path.length > plane_path_max) {
          path.shift();
        }

        if (!mathlib.pointInRect(x, y, { x: 0, y: 0, width: cw, height: ch })) {
          vx *= decel;
          vy *= decel;
        }

        const speed = (Math.abs(vx) + Math.abs(vy)) / 2;
        const dist = mathlib.distance(dest, { x, y });

        // Slow down as it approaches the destination.
        if (speed > 0.1 && dist < approachingDist) {
          vx *= decel;
          vy *= decel;
          approaching = true;
        }

        const overwrite = {};

        if (dist < plane_holding_distance) {
          holding = true;
          // Overwrites the followings:
          // - originIndex --> because it has "destIndex" this time
          // - origin --> because it has "destIndex" this time
          // - dest
          // - destIndex
          // - approaching
          // - holding
          overwrite = selectNextDestination({
            ports,
            originIndex,
            origin,
            destIndex, // This time, we have "destIndex".
          });
        }

        const angle = mathlib.angle(dest, { x, y });

        vx += Math.cos(angle) * accel;
        vy += Math.sin(angle) * accel;

        if (speed > vmax) {
          vx *= decel;
          vy *= decel;
        }

        x += vx * dt;
        y += vy * dt;

        _planes[i] = {
          index,
          colorIndex,
          path,
          originIndex,
          origin,
          x,
          y,
          ox,
          oy,
          vx,
          vy,
          vmax,
          speed,
          angle,
          accel,
          decel,
          approaching,
          holding,
          dest,
          destIndex,
          ...overwrite,
        };
      }
      // END OF: for

      setPlanes(_planes);
    }
  };
  // END OF: updatePlanes()

  return {
    planes,
    resetPlanes,
    updatePlanes,
  };
};
