# react-widget-airport

A React widget (UMD library) for Airport animations with flight departures/arrivals.

[1. About](#1-about)  
[2. How It Works](#2-how-it-works)  
&nbsp; &nbsp; [2-1. UMD Library](#2-1-umd-library)  
&nbsp; &nbsp; [2-2. APIPlugin - Using Webpack Hash](#2-2-apiplugin---using-webpack-hash)  
&nbsp; &nbsp; [2-3. Using Pixi Legacy](#2-3-using-pixi-legacy)  
&nbsp; &nbsp; [2-4. App Structure](#2-4-app-structure)  
&nbsp; &nbsp; &nbsp; &nbsp; [(a) Basic Entry](#a-basic-entry)  
&nbsp; &nbsp; &nbsp; &nbsp; [(b) `react-pixi-fiber`](#b-react-pixi-fiber)  
&nbsp; &nbsp; &nbsp; &nbsp; [(c) Calling from Other React Apps](#c-calling-from-other-react-apps)  
[3. What I Did](#3-what-i-did)  
&nbsp; &nbsp; [3-1. Installed NPM Packages All](#3-1-installed-npm-packages-all)  
&nbsp; &nbsp; [3-2. Babel](#3-2-babal)  
&nbsp; &nbsp; [3-3. Webpack](#3-3-webpack)  
&nbsp; &nbsp; [3-4. Loaders](#3-4-loaders)  
&nbsp; &nbsp; [3-5. Other Build Tools](#3-5-other-build-tools)  
&nbsp; &nbsp; [3-6. Emotion](#3-6-emotion)  
&nbsp; &nbsp; [3-7. Other Dependencies](#3-7-other-dependencies)  
[4. Dev + Build](#4-dev--build)  
[5. Notes](#5-notes)  
&nbsp; &nbsp; [5-1. Issues: webpack-dev-server](#5-1-issues-webpack-dev-server)  
&nbsp; &nbsp; [5-2. Issues: Tailwind](#5-2-issues-tailwind)  
&nbsp; &nbsp; [5-3. Using Preact - Minimize App Size](#5-3-using-preact---minimize-app-size)  
[6. LICENSE](#6-license)

![screenshot](screenshot.png)

[View Demo](http://tokyo800.jp/mina/react-widget-airport/)  
(may not work in some browsers: e.g. Facebook browsers)

<a id="about"></a>

## 1. About

**ALTERNATIVE:**
**If you would like a simpler implementation, **
**check out [react-widget-setup-2021](https://github.com/minagawah/react-widget-setup-2021).**

#### Embedded React Widget

This is an attempt to show how you can bundle your React app into a widget (UMD library).  
Instead of being _"installed"_, this app is to be _"embedded"_ in other apps.  
(or, you can totally call it from another React apps.
_[See Example](#b-calling-from-other-react-apps)_)

It exposes the widget globally (in our case `Airport`).  
So, this is how embedding is done:

```html
<script
  crossorigin
  src="https://unpkg.com/react@17/umd/react.production.min.js"
></script>
<script
  crossorigin
  src="https://unpkg.com/react-dom@17/umd/react-dom.production.min.js"
></script>

<script type="text/javascript" src="./airport.app.js"></script>

<script type="text/javascript">
  Airport.app.init();
</script>
```

#### React Pixi Fiber

It also demonstrates implementing a canvas animation using
[reac-pixi-fiber](https://github.com/michalochman/react-pixi-fiber).  
Compared to [izzimach/react-pixi](https://github.com/Izzimach/react-pixi),
it is a bit tricky to implement, and I hope it helps someone as well.

Note #1: Another option is to use
[inlet/react-pixi](https://github.com/inlet/react-pixi),
but I had never tried.
See _[the problem](https://github.com/inlet/react-pixi/issues/5)_ they have.  
Note #2: Note that `reac-pixi-fiber` does _not_ work with `preact`
(See: _[Why](#3-6-react)_ or _[5-5. Using Preact](#5-5-using-preact---minimize-app-size)_).

#### SharedWorker

As you can see, it outputs 2 bundle files (you can output 1).
For this app, one of the files is for
_[SharedWorker](https://developer.mozilla.org/en-US/docs/Web/API/SharedWorker),_
and it allows the caller of the widget to send messages to the widget.  
Here is how a caller can send messages to its widget:

```js
const worker = new SharedWorker('./airport.worker.js');

worker.port.postMessage({
  action: 'resize',
  payload: {
    width: window.innerWidth,
    height: window.innerHeight,
  },
});
```

&nbsp;

### # Issues

Yeah. I have some issues. We all fail, right?

- `webpack-dev-server` fails ([see "5-2. Issues: webpack-dev-server"](#5-2-issues-webpack-dev-server))
- `twin.macro` (Tailwind macro) fails at runtime ([see notes](#5-3-issues-tailwind)).
- Externalizing `pixi`, `react-pixi`, or `react-pixi-fiber` fails.
- Currently, `react-pixi-fiber` works ONLY when `process.env.NODE_ENV === 'production'`. Looks like other packages which utilizes `react-reconciler` are also not working (see [issue](https://github.com/diegomura/react-pdf/issues/565#issuecomment-781471807). Emits `TypeError: Cannot set property 'getCurrentStack' of undefined`.

&nbsp;

## 2. How It Works

### 2-1. UMD Library

Building an UMD library is relatively easy.  
It's just that we frequently bump into problems when working with `babel`...

`webpack.base.js`

```js
  entry: {
    app: './src/index.jsx',
    worker: './src/worker.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'airport.[name].js?[hash]',
    library: ['Airport', '[name]'],
    libraryTarget: 'umd',
  },
```

I have 2 entries in the above, but you can totally have only 1.  
I have 2 because one of them is for `SharedWorker`,
and it has to be an independent file.

To output only 1, you would do:

```js
  entry: './src/index.jsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'airport.js?[hash]',
    library: 'Airport',
    libraryTarget: 'umd',
  },
```

`[hash]` isn't needed either.  
I am adding `[hash]` so that I don't have to hard reload browsers when making changes.

Now, back to UMD library.

The entry for the library look like this:

`src/index.jsx`

```jsx
export const init = config => {
  ReactDOM.render(
    <Widget config={config} />,
    document.getElementById('airport')
  );
};
```

As you can see, it exports `init`.  
If you want to use `export default`,
then _[you need a special setup for babel](#5-1-issues-module-exportss)_.

The module is now exposed globally as `Airport`.

When people want to use the widget,
they would download files from `dist` directory,
and embed them in their HTML pages:

- [airport.app.js](dist/airport.app.js) (722 KB)
- [airport.worker.js](dist/airport.worker.js) (15 KB)

For this project, I use `html-webpack-plugin` for a static page
so that I can test the widget.  
As far as creating a widget, you don't need this,
but for this time, this is for a testing purpose.

`src/index.html`

```html
<!DOCTYPE html>
<html>
  <body>
    <div id="airport"></div>

    <script
      crossorigin
      src="https://unpkg.com/react@17/umd/react.production.min.js"
    ></script>
    <script
      crossorigin
      src="https://unpkg.com/react-dom@17/umd/react-dom.production.min.js"
    ></script>

    <script
      type="text/javascript"
      src="<%= htmlWebpackPlugin.files.js[0] %>"
    ></script>

    <script type="text/javascript">
      Airport.app.init({
        WHATEVER_PARAMS_YOU_WANT,
      });
    </script>
  </body>
</html>
```

Notice in the above that

```html
<%= htmlWebpackPlugin.files.js[0] %>
```

is replaced with:

```html
/airport.app.js?[WHATEVER_THE_HASH_GENERATED]
```

Once again, having HTML is only for testing reason.
Also, I didn't have to use `html-webpack-plugin` to generate the HTML page
but I could simply serve the HTML page statically.
I use `html-webpack-plugin` only because
I wanted to append a _"hash"_ to the resources
so that I don't have to worry about browser cache when developing.

&nbsp;

### 2-2. APIPlugin - Using Webpack Hash

Alright. This has nothing to do with UMD library.
This is about sharing _"hash"_ generated between two files.
I told you in the previous that I use _"hash"_.
For the same _"hash"_ that is appended to `airport.app.js`,
I want the same for `airport.worker.js`.
Instead of having this:

```js
const worker = new SharedWorker('./my_worker.js');
```

we want something like this:

```js
const worker = new SharedWorker('./my_worker.js?4e066ad15f78a871e174');
```

This is where `APIPlugin` of Webpack's comes in.
`APIPlugin` exposes the hash generated by Webpack
as a special global variable `__webpack_hash__`,
and you can use the hash at runtime in your application.

`webpack.base.js`

```js
const APIPlugin = require('webpack/lib/APIPlugin');

module.exports = {
  ...
  ...
  plugins: [
    new APIPlugin(),
  ],
};
```

and it allows you to use the hash:

```js
const worker = new SharedWorker(`./my_worker.js?{__webpack_hash__}`);
```

&nbsp;

### 2-3. Using Pixi Legacy

Some browsers do not support WebGL the way Pixi v5 wants,
and must fallback to canvas rendering.
There, we need `pixi.js-legacy` instead.  
There are several ways to handle this,
but I found
[a neat solution](https://github.com/inlet/react-pixi/issues/126#issuecomment-514184770),
and this is what I do in this project.  
The idea is to export both `pixi.js` and `pixi.js-legacy` in the codebase,
and use aliases to internally handle names.  
Whenever looking up `pixi.js`, it refers to `src/lib/pixi.js`:

**# webpack.base.js**

```js
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      'pixi.js': path.resolve(__dirname, 'src/lib/pixi.js'),
      'pixi.js-stable': path.resolve(__dirname, 'node_modules/pixi.js'),
      'react-pixi$': 'react-pixi-fiber/react-pixi-alias',
      '@': path.join(__dirname, 'src'),
    },
  },
```

**# src/lib/pixi.js**

```js
export * from 'pixi.js-stable';
export * from 'pixi.js-legacy';
```

where `pixi.js-stable` is a newly defined alias to the original `pixi.js`.

&nbsp;

### 2-4. App Structure

It is probably worth describing how the app work.  
If you are only interested in UMD library, you may stop reading.

#### (a) Basic Entry

So, the app starts when it renders React app into a designated DOM:

`src/index.html`

```html
<div id="airport"></div>

<script
  crossorigin
  src="https://unpkg.com/react@17/umd/react.production.min.js"
></script>
<script
  crossorigin
  src="https://unpkg.com/react-dom@17/umd/react-dom.production.min.js"
></script>
<script type="text/javascript" src="./airport.app.js"></script>
```

`src/index.jsx`

```jsx
import { Widget } from './widget';

export const init = config => {
  ReactDOM.render(
    <Widget config={config} />,
    document.getElementById('airport')
  );
};
```

Here, the prop `config` is _static_, and it is given from whoever passes.  
By saying _static_, it means, React will **_not_** pick up the changes
even when the starter change the content of the prop.

#### (b) `react-pixi-fiber`

Now, it is the `Widget` component which renders the actual content:

`src/widget/index.jsx`

```jsx
import { AirportContent as Content } from './content';
...
...
...
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
        const { data = {} } = event;
        const { action, payload } = data;

        if (action && action === 'resize' && payload) {
          const { width, height } = payload;
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

  // Just showing you can use 'emotion' for styles.
  return (
    <Stage
      id="airport-stage"
      options={stageOptions}
      css={css`
        background-color: #f00;
      `}
    >
      <Content
        id="airport-content"
        cw={stageOptions.width}
        ch={stageOptions.height}
        options={airportOptions}
      />
    </Stage>
  );
};
```

in the above, `<Stage>` is a component provided by `react-pixi-fiber`
which does _NOT_ render something that we are familiar with,
but it actually renders a `canvas` element.
All the components within `<Stage>` are graphical elements of HTML5 Canvas.

In `Widget` component, the app uses `useState` to set the followings:

- `stageOptions`
- `airportOptions`

`stageOptions` is passed to `<Stage>` so that `reac-pixi-fiber` can decide
the size for the canvas element.

`airportOptions` is for the airport animations only.
When we `init` the widget from the HTML, we _statically_ pass `config`.
In `config` prop, we have a bunch fo parameters which define the app behavior.

Also, `Widget` refers to `airport.worker.js`.

```jsx
setWorker(new SharedWorker('./airport.worker.js'));
```

You can now use this worker to update the size of the widget
from the page you embed the widget
(and I already described how).

&nbsp;

#### (c) Calling from Other React Apps

So, instead of embedding the widget in HTML pages,
you want to call it from other React apps?  
Here is an example from one of my working apps:

```jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import tw, { css } from 'twin.macro';

import { useDeviceSize } from '@/hooks/device';
import { useDebounce } from '@/hooks/debounce';
import { Layout } from '@/components/layout';

const MIN_WIDTH = 580;
const DEBOUNCE_MSEC = 1000;
const WORKER_FILE_PATH = '/assets/airport.worker.js';

const layoutStyles = {
  header: tw`bg-black text-white`,
  content: tw`bg-black text-white`,
};

const contentStyle = css`
  min-height: 30vh;
  ${tw`p-4 flex flex-col justify-start items-start`}
`;

export const AirportDemo = () => {
  const { width: dw, height: dh } = useDeviceSize(null);
  const { t } = useTranslation();
  const [worker, setWorker] = useState();

  const dwDelay = useDebounce(dw, DEBOUNCE_MSEC);
  const dhDelay = useDebounce(dh, DEBOUNCE_MSEC);

  const resize = () => {
    let w = dw * 0.75;
    if (w < MIN_WIDTH) {
      w = MIN_WIDTH;
    }
    if (worker) {
      worker.port.postMessage({
        action: 'resize',
        payload: {
          width: w,
          height: w * 0.85,
        },
      });
    }
  };

  useEffect(() => {
    Airport.app.init({ worker_file_path: WORKER_FILE_PATH });

    if (!worker) {
      // Set it only when don't have the worker to prevent from
      // another port being created when it is already mounted.
      setWorker(new SharedWorker(WORKER_FILE_PATH));
    }
  }, []);

  useEffect(() => {
    if (worker && worker.port) {
      resize();
    }
  }, [dwDelay, dhDelay, worker]);

  return (
    <Layout styles={layoutStyles}>
      <div id="content" css={contentStyle}>
        <div id="airport"></div>
      </div>
    </Layout>
  );
};
```

&nbsp;

## 3. What I Did

### 3-1. Installed NPM Packages All

```
yarn add @emotion/react pixi.js pixi.js-legacy react-pixi-fiber@1.0.0-beta.4 ramda

yarn add --dev @babel/core @babel/preset-env @babel/preset-react @babel/cli core-js@3 @babel/runtime-corejs3 babel-plugin-macros babel-loader file-loader style-loader css-loader postcss-loader webpack webpack-cli webpack-merge clean-webpack-plugin html-webpack-plugin license-webpack-plugin @emotion/babel-plugin-jsx-pragmatic autoprefixer prettier http-server
```

### 3-2. Babel

For `@babel/polyfill` has been deprecated, we use `core-js`.

- @babel/core
- @babel/preset-env
- @babel/cli
- core-js@3
- @babel/runtime-corejs3
- @babel/preset-react

```
yarn add --dev @babel/core @babel/preset-env @babel/cli core-js@3 @babel/runtime-corejs3 @babel/preset-react
```

### 3-3. Webpack

- webpack
- webpack-cli

```
yarn add --dev webpack webpack-cli
```

### 3-4. Loaders

- babel-loader
- file-loader
- style-loader
- css-loader
- postcss-loader

```
yarn add --dev babel-loader file-loader style-loader css-loader postcss-loader
```

### 3-5. Other Build Tools

- webpack-merge
- clean-webpack-plugin
- html-webpack-plugin (only for testing)
- license-webpack-plugin
- autoprefixer
- prettier

```
yarn add --dev webpack-merge clean-webpack-plugin html-webpack-plugin license-webpack-plugin autoprefixer prettier
```

See [issues with "webpack-dev-server"](#5-2-issues-webpack-dev-server).

&nbsp;

### 3-6. Emotion

- babel-plugin-macros
- @emotion/babel-plugin-jsx-pragmatic
- @emotion/react (for `dependencies`)

```
yarn add --dev babel-plugin-macros @emotion/babel-plugin-jsx-pragmatic

yarn add @emotion/react
```

&nbsp;

### 3-7. Other Dependencies

- ramda
- pixi.js
- pixi.js-legacy
- react-pixi-fiber@1.0.0-beta.5
  - See [issue](https://github.com/michalochman/react-pixi-fiber/issues/156#issuecomment-578214553)
  - `^1.0.0-beta.5` works, but seems like it has a positioning bug...
  - `^1.0.0-beta.6` are totally not working at all...
- http-server

```
yarn add ramda pixi.js pixi.js-legacy react-pixi-fiber@1.0.0-beta.4

yarn add --dev http-server
```

Check out a neat trick when using `pixi.js-legacy` (see _[2-3. Using Pixi Legacy](#2-3-using-pixi-legacy)_)

&nbsp;

## 4. Dev + Build

Note: `chrome://inspect/#workers` to inspect running workers.

### Build for DEV

```
yarn start
```

### Build for PROD

```
yarn build
```

### Serve the built files

```
yarn serve
```

&nbsp;

## 5. Notes

### 5-1. Issues: webpack-dev-server

As [mentioned](#1-about), `webpack-dev-server` does not work,
and it is due to Webpack v5 release on 10/10/2020.
I had mainly 2 issues.
The first issue was that the bundled library exporting an empty object when using `webpack-dev-server`.
For this project, specifically, `Airport.app` became `{}`.
It was a bug, and a
[solution](https://github.com/webpack/webpack-dev-server/issues/2484#issuecomment-749497713)
was to use `webpack-dev-server@4.0.0-beta.0`.
The second issue is associated with _SharedWorker_, and `window` becomes undefined.
For this, I still have no solutions.

&nbsp;

### 5-2. Issues: Tailwind

Attempt to use `twin.macro` (Tailwind macro, or Twin) fails.  
There are 2 reasons:  
(1) `twin.macro` uses CommonJS style libraries internally,
and Webpack 5 does not like that.  
(2) Runtime error for `__cssprop`

For (1) is not an issue with Webpack 4, and I will talk about it later.  
For (2), it has to do with the recent release of Twin v2 which supports:

- tailwind@2 ([released on Nov. 19, 2020](https://github.com/ben-rogerson/twin.macro/releases/tag/2.0.0))
- emotion@11 ([released on Nov. 12, 2020](https://emotion.sh/docs/emotion-11))

They give a bit of migration tips in the release note,
but it seems to fail for UMD libraries.
It builds fine, but I get the following runtime error:

```
index.jsx:13 Uncaught ReferenceError: __cssprop is not defined
```

Let's talk about (1).  
So, with Webpack 5, I get the error at build time:

```
BREAKING CHANGE: webpack < 5 used to include polyfills for node.js core modules by default.
This is no longer the case. Verify if you need this module and configure a polyfill for it.
```

This is because Webpack 5 no longer supports automatic polyfill for Node.js modules,
and you have to manually resolve the modules in use (one by one).

Here is how you polyfill by yourself, but remember, it still fails at runtime...
If anyone figured out a solution for using `twin.macro` in UMD library,
please, let me know!

```
yarn add --dev util path-browserify url os-browserify process imports-loader
```

`webpack.base.js`

```
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      '@': path.join(__dirname, 'src'),
    },
    fallback: {
      util: require.resolve('util/'),
      path: require.resolve('path-browserify'),
      url: require.resolve('url/'),
      os: require.resolve('os-browserify/browser'),
      fs: false,
      module: false,
    },
  },
  ...
  ...
  module: {
    rules: [
      ...
      ...
      {
        test: /node_modules\/resolve\/lib\/core\.js$/,
        use: [{
          loader: 'imports-loader',
          options: {
            type: 'commonjs',
            imports: ['single process/browser process'],
          },
        }],
      },
```

This
[issue](https://github.com/vfile/vfile/issues/38#issuecomment-640479137)
describes the problem in depth, and here is another
[issue](https://github.com/vfile/vfile/issues/38#issuecomment-683198538).

In case you solved the issue, remember that you also need
to configure `babel-plugin-macros.config.js` to use Tailwind:

`babel-plugin-macros.config.js`

```
module.exports = {
  twin: {
    styled: {
      import: 'default',
      from: '@emotion/styled',
    },
    css: {
      import: 'css',
      from: '@emotion/react',
    },
    global: {
      import: 'Global',
      from: '@emotion/react',
    },
    config: './src/tailwind.config.js', // <-- HERE
    dataTwProp: true, // <-- HERE
    debugPlugins: false,
    debug: false,
  },
};
```

&nbsp;

### 5-3. Using Preact - Minimize App Size

If you want to use
[preact](https://github.com/preactjs/preact),
here are the steps.

**# Step (1): Using Preact**

For every JSX files, you need to import "h" from `preact`:

```js
import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
```

**# Step (2): babel-plugin-transform-react-jsx**

You need to handle "h" pragma with `babel-plugin-transform-react-jsx`.

```
yarn add --dev babel-plugin-transform-react-jsx
```

`.babelrc`

```
  plugins: [
    ['@babel/transform-react-jsx', { pragma: 'h' }]
  ]
```

**# Step (3): React + ReactDOM**

While it works perfectly fine with (1) and (2) only,
but your external React libraries
are importing `react` and `react-dom`,
and you need resolutions for the name.

`webpack.base.js`

```js
  resolve: {
    ...
    alias: {
      ...
      ...
      'react': 'preact/compat',
      'react-dom': 'preact/compat',
    }
  }
```

&nbsp;

## 6. License

Dual-licensed under either of the followings.  
Choose at your option.

- The UNLICENSE ([LICENSE.UNLICENSE](LICENSE.UNLICENSE))
- MIT license ([LICENSE.MIT](LICENSE.MIT))
