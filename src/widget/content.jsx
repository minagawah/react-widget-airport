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

const DEBOUNCE_MSEC = 400;

const DEFAULT_VARS = {
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
  const [vars, setVars] = useState(DEFAULT_VARS);
  const { ports, resetPorts, updatePorts } = usePorts(null);
  const { planes, resetPlanes, updatePlanes } = usePlanes(null);

  const cwDelay = useDebounce(cw, DEBOUNCE_MSEC);
  const chDelay = useDebounce(ch, DEBOUNCE_MSEC);

  const { num_of_ports, num_of_planes, port_capacity } = options;

  // RESET #1: Setting the canvas size.
  useEffect(() => {
    const avg = (cw + ch) / 2;
    const portSpacingDist = (avg / num_of_ports) * 1.1;
    const approachingDist = portSpacingDist * 0.33;
    const portRadius = getPortRadius(portSpacingDist);

    console.log('(widget) [content] RESET!!!!!!!!!!!!');
    console.log(`(widget) [content] ${int(cw)}x${int(ch)}`);

    // console.log(`(widget) [content] num_of_ports: ${num_of_ports}`);
    // console.log(`(widget) [content] num_of_planes: ${num_of_planes}`);
    // console.log(`(widget) [content] port_capacity: ${port_capacity}`);
    // console.log(`(widget) [content] canvas: ${int(cw)} x ${int(ch)}`);
    // console.log(`(widget) [content] portSpacingDist: ${int(portSpacingDist)}`);
    // console.log(`(widget) [content] approachingDist: ${int(approachingDist)}`);
    // console.log(`(widget) [content] portRadius: ${portRadius}`);

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
  }, [cwDelay, chDelay]);

  // RESET #2: Reset ports when the canvas size was reset.
  useEffect(() => {
    if (vars.portRadius > 1) {
      resetPorts({
        cw,
        ch,
        ...pick(['portSpacingDist'], vars),
        ...pick(['num_of_ports'], options),
      });
    }
  }, [vars.portRadius]);

  // RESET #3: Reset planes when ports were reset.
  useEffect(() => {
    resetPlanes({ ports, ...pick(['num_of_planes'], options) });
  }, [ports.length]);

  usePixiTicker(() => {
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

    updatePorts({
      planes,
      tick: vars.tick,
      ...pick(['num_of_ports'], options),
    });

    updatePlanes({
      ...pick(['cw', 'ch', 'tick', 'dt', 'approachingDist'], vars),
      ports,
      ...pick(
        [
          'num_of_planes',
          'plane_path_modular_segment',
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
                vars={pick(['et', 'tick', 'portRadius'], vars)}
                port={port}
                options={pick(
                  ['port_capacity', 'port_color_full', 'port_color_norm'],
                  options
                )}
              />

              <PortText
                key={`port-text-${i}`}
                vars={pick(['tick', 'portRadius'], vars)}
                port={pick(['x', 'y', 'approachingCount'], port)}
                options={pick(
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
              index={i}
              vars={pick(['tick'], vars)}
              plane={plane}
              options={pick(
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
