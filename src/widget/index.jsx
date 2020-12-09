import React, { useState, useEffect } from 'react';
import { Stage } from 'react-pixi-fiber';

import { int } from '@/lib/math';
import { pound_hex_to_dec } from '@/lib/color';
import {
  DEFAULT_SIZE,
  DEFAULT_AIRPORT_OPTIONS,
  DEFAULT_STAGE_OPTIONS,
  makeAirportOptions,
} from '@/lib/constants';

import { AirportContent as Content } from './content';

export const Widget = ({ config = {} }) => {
  const [worker, setWorker] = useState();
  const [stageOptions, setStageOptions] = useState(DEFAULT_STAGE_OPTIONS);
  const [airportOptions, setAirportOptions] = useState(DEFAULT_AIRPORT_OPTIONS);

  useEffect(() => {
    console.log('[Airport] __webpack_hash__: ', __webpack_hash__);
    setWorker(new SharedWorker(`./airport.worker.js?${__webpack_hash__}`));
    setAirportOptions(makeAirportOptions(config));
    setStageOptions({
      width: window.innerWidth * 0.65,
      height: window.innerHeight * 0.65,
    });
    return () => {
      instance.terminate();
    };
  }, []);

  useEffect(() => {
    if (worker && worker.port) {
      worker.port.onmessage = (event = {}) => {
        console.log(`[Airport] ++++ worker.port.onmessage`);
        const { data = {} } = event;
        const { action, payload } = data;
        if (action && action === 'resize' && payload) {
          console.log(`[Airport] Message received: resize`);
          const { width, height } = payload;
          if (width && height) {
            console.log(`[Airport] ${int(width)}x${int(height)}`);
            setStageOptions({
              width,
              height,
            });
          }
        }
      };
    }
  }, [worker]);

  return (
    <Stage id="airport-stage" options={stageOptions}>
      <Content
        id="airport-content"
        cw={stageOptions.width}
        ch={stageOptions.height}
        options={airportOptions}
      />
    </Stage>
  );
};
