import React from 'react';
import ReactDOM from 'react-dom';

import { Widget } from './widget';

export const init = config => {
  ReactDOM.render(
    <Widget config={config} />,
    document.getElementById('airport')
  );
};
