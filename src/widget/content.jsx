import { Container, usePixiTicker } from 'react-pixi-fiber';
import * as PIXI from 'pixi.js';

const { Fragment, useEffect, useState } = React;

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
  const { portsUID, ports, resetPorts, updatePorts } = usePorts(null);
  const { planes, resetPlanes, updatePlanes } = usePlanes(null);

  const cw_debounce = useDebounce(cw, DEBOUNCE_MSEC);
  const ch_debounce = useDebounce(ch, DEBOUNCE_MSEC);
  const ports_uid_debounce = useDebounce(portsUID, DEBOUNCE_MSEC);

  const { num_of_ports, num_of_planes, port_capacity } = options;

  useEffect(() => {
    const avg = (cw + ch) / 2;
    const portSpacingDist = (avg / num_of_ports) * 1.1;
    const approachingDist = portSpacingDist * 0.33;
    const portRadius = getPortRadius(portSpacingDist);

    console.log('(widget) [content] RESET RESET RESET !!!!!');
    console.log(`(widget) [content] ${int(cw)}x${int(ch)}`);

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

    /*
     * [vars] 'tick', 'portSpacingDist'
     * [options] 'num_of_ports'
     */
    resetPorts({ cw, ch, vars, options });
  }, [cw_debounce, ch_debounce]);

  useEffect(() => {
    /*
     * [option] 'num_of_planes'
     */
    resetPlanes({ ports, options });
  }, [portsUID]);

  usePixiTicker(() => {
    let { lt, et, tick } = vars;
    const now = Date.now();
    const dt = mathlib.clamp((now - lt) / (1000 / 60), 0.001, 10);

    lt = now;
    et += dt;
    tick++;

    setVars({ ...vars, lt, dt, et, tick });

    /*
     * [vars] 'tick'
     * [options] 'num_of_ports'
     */
    updatePorts({ vars, planes, options });

    /*
     * vars: 'cw', 'ch', 'tick', 'dt', 'approachingDist'
     * options:
     *   'num_of_planes',
     *   'plane_path_modular_segment',
     *   'plane_path_max',
     *   'plane_holding_distance',
     */
    updatePlanes({ vars, ports, options });
  });

  return (
    <>
      <Container>
        {ports.length > 0 &&
          ports.map((port, i) => (
            <Fragment key={`port-${i}`}>
              {/*
               * [vars] 'et', 'tick', 'portRadius'
               * [options]
               *   'port_capacity',
               *   'port_color_full',
               *   'port_color_norm'
               */}
              <PortGraphics
                key={`port-graphics-${i}`}
                uid={port.uid}
                vars={vars}
                port={port}
                options={options}
              />

              {/*
               * [vars] 'tick', 'portRadius'
               * [port] 'x', 'y', 'approachingCount'
               * [options]
               *   'port_capacity',
               *   'text_color_full',
               *   'text_color_norm'
               */}
              <PortText
                key={`port-text-${i}`}
                uid={port.uid}
                vars={vars}
                port={port}
                options={options}
              />
            </Fragment>
          ))}
      </Container>

      <Container>
        {planes.length > 0 &&
          planes.map((plane, i) => {
            /*
             * [vars] 'tick'
             * [options]
             *   'plane_unique_color',
             *   'plane_holding_color',
             *   'plane_flight_color',
             *   'plane_path_color',
             */
            return (
              <PlaneGraphics
                key={`plane-graphics-${i}`}
                index={i}
                vars={vars}
                plane={plane}
                options={options}
              />
            );
          })}
      </Container>
    </>
  );
};
