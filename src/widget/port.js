import React, { useState } from 'react';
import { Text, CustomPIXIComponent, usePixiTicker } from 'react-pixi-fiber';
import * as PIXI from 'pixi.js';

import * as mathlib from '@/lib/math';
import { DEFAULT_AIRPORT_OPTIONS, TEXT_FONT_FAMILY } from '@/constants';

const { int } = mathlib;

const portTextStyle = {
  align: 'right',
  fontFamily: TEXT_FONT_FAMILY,
  fontSize: 14,
  fontWeight: 400,
  fill: DEFAULT_AIRPORT_OPTIONS.text_color,
};

export const PortText = ({
  text,
  x,
  y,
  approachingCount,
  portRadius,
  port_capacity,
  text_color_full,
  text_color_norm,
}) => {
  const style = new PIXI.TextStyle(portTextStyle);
  style.fontSize = int(portRadius * 1.2);
  style.fill =
    approachingCount > port_capacity ? text_color_full : text_color_norm;
  // [0.5, 2.1] ---> fontSize: 1.1
  // [0.5, 2.0] ---> fontSize: 1.2
  // [0.5, 1.8] ---> fontSize: 1.4
  return <Text text={text} x={x} y={y} anchor={[0.5, 2]} style={style} />;
};

export const PortGraphics = CustomPIXIComponent(
  {
    customDisplayObject: props => new PIXI.Graphics(),
    customApplyProps: function (g, oldProps, newProps) {
      const {
        et,
        x,
        y,
        portRadius,
        approachingCount,
        colorIndex,
        port_capacity,
        port_color_full,
        port_color_norm,
      } = newProps;
      // const alpha = 0.35 + Math.sin(et / 20) * 0.2;

      if (typeof oldProps !== 'undefined') {
        g.clear();
      }
      g.lineStyle(
        1,
        approachingCount > port_capacity ? port_color_full : port_color_norm,
        1
      );
      g.drawCircle(x, y, portRadius);
      g.endFill();
    },
  },
  'PortGraphics'
);

const generatePos = (min = 0, max = 1) => ({
  x: mathlib.rand(min, max),
  y: mathlib.rand(min, max),
});

const enoughSpace = ({ minDist, x, y, ch, ports }) => {
  let stopper = 0;
  let ok = true;
  let i = ports.length;
  while (i--) {
    stopper++;
    if (stopper > 100) {
      throw new Error('Reached the max iteration (enoughSpace)');
    }
    const dist = mathlib.distance(ports[i], { x, y });
    if (dist < minDist) {
      ok = false;
      break;
    }
  }
  return ok;
};

export const usePorts = () => {
  const [ports, setPorts] = useState([]);

  const resetPorts = ({ cw, ch, portSpacingDist, options, num_of_ports }) => {
    setPorts([]);

    if (cw && ch) {
      console.log('[Airport/port] ++++ resetPorts()');
      console.log(`[Airport/port] portSpacingDist: ${int(portSpacingDist)}`);

      const _ports = [];

      const generate = () => {
        let x = 0;
        let y = 0;

        if (cw && ch) {
          let stopper = 0;
          const min = cw * 0.1;
          const maxY = ch * 0.92;
          let max = cw * 0.9;

          // TODO: Limits the X max...
          if (max > maxY) {
            max = maxY;
          }

          ({ x, y } = generatePos(min, max));
          while (
            !enoughSpace({ x, y, minDist: portSpacingDist, ch, ports: _ports })
          ) {
            stopper++;
            if (stopper > 70) {
              throw new Error('Reached the max iteration');
              x = 10;
              y = 10;
              break;
            }
            ({ x, y } = generatePos(min, max));
          }
        }

        return {
          x,
          y,
          approachingCount: 0,
          colorIndex: 0,
        };
      };

      // console.log('[Airport/port] ports:');
      for (let i = 0; i < num_of_ports; i++) {
        const p = generate();
        // console.log(`[Airport/port] port[${i}] (${int(p.x)}, ${int(p.y)})`);
        _ports.push(p);
      }

      setPorts(_ports);
    }
  };
  // END OF: resetPorts()

  const updatePorts = ({ planes = [], num_of_ports }) => {
    const _ports = ports.slice();

    if (_ports.length && planes.length) {
      for (let i = 0; i < num_of_ports; i++) {
        let j = planes.length;
        let c = 0;
        while (j--) {
          const { destIndex, approaching = false } = planes[j] || {};
          if (destIndex == i && approaching) {
            c++;
          }
        }
        _ports[i].approachingCount = c;
      }
      setPorts(_ports);
    }
  };
  // END OF: updatePorts()

  return {
    ports,
    resetPorts,
    updatePorts,
  };
};
