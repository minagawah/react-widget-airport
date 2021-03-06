import { Text, CustomPIXIComponent, usePixiTicker } from 'react-pixi-fiber';
import * as PIXI from 'pixi.js';

const { useState } = React;

import * as mathlib from '@/lib/math';
import { DEFAULT_AIRPORT_OPTIONS, TEXT_FONT_FAMILY } from '@/constants';

const { int, gen_code4 } = mathlib;

const portTextStyle = {
  align: 'right',
  fontFamily: TEXT_FONT_FAMILY,
  fontSize: 14,
  fontWeight: 400,
  fill: DEFAULT_AIRPORT_OPTIONS.text_color,
};

export const PortGraphics = CustomPIXIComponent(
  {
    customDisplayObject: props => new PIXI.Graphics(),
    customApplyProps: function (g, oldProps, newProps) {
      const {
        uid,
        vars: { et, tick, portRadius },
        port: { x, y, approachingCount, colorIndex },
        options: { port_capacity, port_color_full, port_color_norm },
      } = newProps;

      if (oldProps?.uid !== newProps?.uid) {
        console.log(`(widget) (PortGraphics) ${newProps?.uid} tick: ${tick}`);
        console.log(
          `(widget) (PortGraphics) ${newProps?.uid} (${int(x)}, ${int(y)})`
        );
      }

      // if (tick >= 10 && tick <= 20 && !(tick % 10)) {
      // }

      // const alpha = 0.35 + Math.sin(et / 20) * 0.2;

      g.clear();
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

export const PortText = ({
  vars: { tick, portRadius },
  port: { x, y, approachingCount },
  options: { port_capacity, text_color_full, text_color_norm },
}) => {
  const style = new PIXI.TextStyle(portTextStyle);
  style.fontSize = int(portRadius * 1.2);
  style.fill =
    approachingCount > port_capacity ? text_color_full : text_color_norm;
  // [0.5, 2.1] ---> fontSize: 1.1
  // [0.5, 2.0] ---> fontSize: 1.2
  // [0.5, 1.8] ---> fontSize: 1.4
  return (
    <Text text={approachingCount} x={x} y={y} anchor={[0.5, 2]} style={style} />
  );
};

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
  const [portsUID, setPortsUID] = useState(null);
  const [ports, setPorts] = useState([]);

  const resetPorts = ({ cw, ch, vars, options }) => {
    console.log('(widget) [port] RESET --> PORTS');

    const { tick, portSpacingDist } = vars;
    const { num_of_ports } = options;

    if (cw && ch) {
      const _ports = [];

      const _uid = gen_code4();
      setPortsUID(_uid);

      const generate = index => {
        let x = 0;
        let y = 0;

        if (cw && ch) {
          const min = cw * 0.1;
          const maxY = ch * 0.92;
          let max = cw * 0.9;
          let stopper = 0;

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
          uid: `${_uid}-${index}`,
          x,
          y,
          approachingCount: 0,
          colorIndex: 0,
        };
      };

      // console.log('(widget) [port] ports:');
      for (let i = 0; i < num_of_ports; i++) {
        const p = generate(i);
        // console.log(`(widget) [port]   [${i}] (${int(p.x)}, ${int(p.y)})`);
        _ports.push(p);
      }

      // console.log(`(widget) [port] ports.length: ${_ports.length}`);

      setPorts(_ports);
    }
  };
  // END OF: resetPorts()

  const updatePorts = ({
    vars: { tick },
    planes = [],
    options: { num_of_ports },
  }) => {
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

  return {
    portsUID,
    ports,
    resetPorts,
    updatePorts,
  };
};
