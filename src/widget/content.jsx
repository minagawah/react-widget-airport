import React, { Fragment, useEffect, useState } from 'react';
import { Container, usePixiTicker } from 'react-pixi-fiber';
import * as PIXI from 'pixi.js';
import { pick } from 'ramda';

import * as mathlib from '@/lib/math';
import { useDebounce } from '@/hooks/debounce';
import { pound_hex_to_dec } from '@/lib/color';

import { usePorts, PortText, PortGraphics } from './port';
import { usePlanes, PlaneGraphics } from './plane';

const { int } = mathlib;

const initialVars = {
  cw: 0,
  ch: 0,
  lt: null,
  dt: 1,
  et: 0,
  tick: 0,
  portRadius: 1,
  portSpacingDist: 1,
  approachingDist: 1,
};

const getPortRadius = range => {
  const min = 15;
  const max = 18;
  let radius = range * 0.16;
  if (radius < min) {
    radius = min;
  }
  if (radius > max) {
    radius = max;
  }
  return int(radius);
};

export const AirportContent = ({ cw, ch, options }) => {
  const [vars, setVars] = useState(initialVars);
  const { ports, resetPorts, updatePorts } = usePorts(null);
  const { planes, resetPlanes, updatePlanes } = usePlanes(null);

  const cwDelay = useDebounce(cw, 400);
  const chDelay = useDebounce(ch, 400);

  const { num_of_ports, num_of_planes, port_capacity } = options;

  const reset = () => {
    console.log('[Airport] ==============================');
    console.log('[Airport] RESET RESET RESET RESET RESET');
    console.log('[Airport] ==============================');

    const avg = (cw + ch) / 2;
    const portSpacingDist = (avg / num_of_ports) * 1.1;
    const approachingDist = portSpacingDist * 0.33;
    const portRadius = getPortRadius(portSpacingDist);

    console.log(`[Airport] num_of_ports: ${num_of_ports}`);
    console.log(`[Airport] num_of_planes: ${num_of_planes}`);
    console.log(`[Airport] port_capacity: ${port_capacity}`);
    console.log(`[Airport] canvas: ${int(cw)} x ${int(ch)}`);
    console.log(`[Airport] portSpacingDist: ${int(portSpacingDist)}`);
    console.log(`[Airport] approachingDist: ${int(approachingDist)}`);
    console.log(`[Airport] portRadius: ${portRadius}`);

    setVars({
      ...vars,
      cw,
      ch,
      lt: Date.now(),
      dt: 1,
      et: 0,
      tick: 0,
      portRadius,
      portSpacingDist,
      approachingDist,
    });
  };

  const update = (delta = 0) => {
    let { lt, et, tick } = vars;
    const now = Date.now();
    const dt = mathlib.clamp((now - lt) / (1000 / 60), 0.001, 10);
    lt = now;
    et += dt;
    tick++;

    setVars({
      ...vars,
      lt,
      dt,
      et,
      tick,
    });
  };

  useEffect(() => {
    reset();
    resetPorts({
      cw,
      ch,
      ...pick(['portSpacingDist'], vars),
      ...pick(['num_of_ports'], options),
    });
    resetPlanes({ ports, ...pick(['num_of_planes'], options) });
  }, [cwDelay, chDelay]);

  usePixiTicker(() => {
    updatePorts({ planes, ...pick(['num_of_ports'], options) });
    updatePlanes({
      ...pick(['cw', 'ch', 'tick', 'dt', 'approachingDist'], vars),
      ports,
      ...pick(
        [
          'num_of_planes',
          'plane_path_spacing',
          'plane_path_max',
          'plane_holding_distance',
        ],
        options
      ),
    });
  });

  return (
    <>
      <Container>
        {ports.length > 0 &&
          ports.map((port, i) => (
            <Fragment key={`port-${i}`}>
              <PortGraphics
                key={`port-graphics-${i}`}
                {...pick(['cw', 'ch', 'et', 'portRadius'], vars)}
                {...port}
                {...pick(
                  ['port_capacity', 'port_color_full', 'port_color_norm'],
                  options
                )}
              />

              <PortText
                key={`port-text-${i}`}
                text={`${port.approachingCount}`}
                x={port.x}
                y={port.y}
                approachingCount={port.approachingCount}
                portRadius={`${vars.portRadius}`}
                {...pick(
                  ['port_capacity', 'text_color_full', 'text_color_norm'],
                  options
                )}
              />
            </Fragment>
          ))}
      </Container>

      <Container>
        {planes.length > 0 &&
          planes.map((plane, i) => (
            <PlaneGraphics
              key={`plane-graphics-${i}`}
              {...pick(['cw', 'ch', 'tick'], vars)}
              {...plane}
              {...pick(
                [
                  'plane_unique_color',
                  'plane_holding_color',
                  'plane_flight_color',
                  'plane_path_color',
                ],
                options
              )}
            />
          ))}
      </Container>
    </>
  );
};
