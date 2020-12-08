// See: https://github.com/babel/babel/issues/9853#issuecomment-619587386
import 'core-js';

import React from 'react';
import ReactDOM from 'react-dom';

import { Widget } from './widget';

export const init = config => {
  ReactDOM.render(
    <Widget config={config} />,
    document.getElementById('airport')
  );
};
