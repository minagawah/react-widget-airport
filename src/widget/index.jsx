import React, { useState, useEffect } from 'react';
import { Stage } from 'react-pixi-fiber';

import { int } from '@/lib/math';
import {
  DEFAULT_WORKER_FILE_PATH,
  DEFAULT_SIZE,
  DEFAULT_AIRPORT_OPTIONS,
  DEFAULT_STAGE_OPTIONS,
  makeAirportOptions,
} from '@/constants';

import { AirportContent as Content } from './content';

export const Widget = ({ config: given }) => {
  const [worker, setWorker] = useState();
  const [stageOptions, setStageOptions] = useState(DEFAULT_STAGE_OPTIONS);
  const [airportOptions, setAirportOptions] = useState(DEFAULT_AIRPORT_OPTIONS);

  useEffect(() => {
    if (!worker) {
      setWorker(
        new SharedWorker(given.worker_file_path || DEFAULT_WORKER_FILE_PATH)
      );
    }

    setAirportOptions(makeAirportOptions(given));

    setStageOptions({
      width: window.innerWidth * 0.65,
      height: window.innerHeight * 0.65,
    });
  }, []);

  useEffect(() => {
    if (worker && worker.port) {
      worker.port.onmessage = (event = {}) => {
        console.log('(widget) [index] ++++ onmessage()');
        const { data = {} } = event;
        const { action, payload } = data;

        console.log('(widget) [index] action: ', action);

        if (action && action === 'resize' && payload) {
          const { width, height } = payload;

          console.log(`(widget) [index] ${int(width)}x${int(height)}`);

          if (width && height) {
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
