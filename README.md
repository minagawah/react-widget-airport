# react-widget-airport

A React widget for Airport animations with flight departures/arrivials.

[1. About](#1-about)  
[2. What I Did](#3-what-i-did)  
&nbsp; &nbsp; [2-1. Installed NPM Packages All](#2-1-installed-npm-packages-all)  
&nbsp; &nbsp; [2-2. Babel](#2-2-babal)  
&nbsp; &nbsp; [2-3. Webpack](#2-3-webpack)  
&nbsp; &nbsp; [2-4. Loaders](#2-4-loaders)  
&nbsp; &nbsp; [2-5. Other Build Tools](#2-5-other-build-tools)  
&nbsp; &nbsp; [2-6. React](#2-6-react)  
&nbsp; &nbsp; [2-7. Other Dependencies](#2-8-other-dependencies)  
[3. Build + Serve](#3-build--serve)  
[4. How It Works](#4-how-it-works)  
&nbsp; &nbsp; [4-1. UMD Library](#4-1-umd-library)  
&nbsp; &nbsp; [4-2. App Structure](#4-2-app-structure)  
[5. Notes](#5-notes)  
&nbsp; &nbsp; [5-1. Module Exports Issues](#5-1-module-exports-issues)  
&nbsp; &nbsp; [5-2. `webpack-dev-server`](#5-2-webpack-dev-server)  
&nbsp; &nbsp; [5-3. Emotion & Tailwind](#5-3-emotion--tailwind)  
[6. LICENSE](#6-license)  


![screenshot](screenshot.png)

[View Demo](http://tokyo800.jp/mina/react-widget-airport/)  
(may not work in some browsers: e.g. Facebook browsers)


<a id="about"></a>
## 1. About

#### Embedded React Widget

It attempts to show how you can bundle your React app into a widget (UMD library).
I could have made it installed as a dependency for other repos,
and as a matter of fact, that would be rather a popular approach,
or has more demands when component *reuse* is the concern.
So, I would say the demand is very limited,
nonetheless, it should help someone out there.

Instead of being *"installed"*, this one is to be *"embedded"* in other apps.  
(or, you can totally call it from another React apps)

It exposes the widget *globally* (in our case `Airport`).  
So, this is how it is done:

```html
<script type="text/javascript" src="./airport.app.js"></script>

<script type="text/javascript">
Airport.app.init();
</script>
```

#### react-pixi-fiber

As an example, I also implemented a canvas animation using
[reac-pixi-fiber](https://github.com/michalochman/react-pixi-fiber).
Unlike [react-pixi](https://github.com/inlet/react-pixi),
it is a bit tricky, so I hope it helps someone as well.


#### SharedWorker

Also, it outputs another bundle file for
*[SharedWorker](https://developer.mozilla.org/en-US/docs/Web/API/SharedWorker)*
which allows messaging between the caller and the widget.

Basically, your app (caller for the widget) can send a message:

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

However, to be honest, I should have used *[Emitter](https://github.com/emitter-io/emitter)* instead.  
It is ugly as hell to output 2 files for 1 widget...

&nbsp;

### # Issues

Yeah. We all fail, right?

- It builds fine, but does not work for `webpack-dev-server` ([see notes](#5-2-webpack-dev-server)).
- `twin.macro` (Emotion & Tailwind) returns an empty object at runtime ([see notes](#5-3-emotion--tailwind)).
- Externalizing `react`, `react-dom`, `pixi`, `react-pixi`, and `react-pixi-fiber` failed.

&nbsp;



## 2. What I Did


### 2-1. Installed NPM Packages All


```
yarn add ramda react react-dom pixi.js pixi.js-legacy react-pixi-fiber@1.0.0-beta.4

yarn add --dev @babel/core @babel/preset-env @babel/preset-react @babel/cli core-js@3 @babel/runtime-corejs3 babel-loader file-loader style-loader css-loader postcss-loader webpack webpack-cli webpack-merge clean-webpack-plugin html-webpack-plugin license-webpack-plugin autoprefixer prettier http-server
```


### 2-2. Babel

For `@babel/polyfill` has been deprecated, we use `core-js`.

- @babel/core
- @babel/preset-env
- @babel/cli
- core-js@3
- @babel/runtime-corejs3

```
yarn add --dev @babel/core @babel/preset-env @babel/cli core-js@3 @babel/runtime-corejs3
```


### 2-3. Webpack

- webpack
- webpack-cli

```
yarn add --dev webpack webpack-cli
```

### 2-4. Loaders

- babel-loader
- file-loader
- style-loader
- css-loader
- postcss-loader

```
yarn add --dev babel-loader file-loader style-loader css-loader postcss-loader
```


### 2-5. Other Build Tools

- webpack-merge
- clean-webpack-plugin
- html-webpack-plugin (only for testing)
- license-webpack-plugin
- autoprefixer
- prettier

```
yarn add --dev webpack-merge clean-webpack-plugin html-webpack-plugin license-webpack-plugin autoprefixer prettier
```

### 2-6. React

- @babel/preset-react
- react
- react-dom

```
yarn add react react-dom

yarn add --dev @babel/preset-react
```

### 2-7. Other Dependencies

- ramda
- pixi.js
- pixi.js-legacy
- react-pixi-fiber@1.0.0-beta.4 ([issue](https://github.com/michalochman/react-pixi-fiber/issues/156#issuecomment-578214553))
- http-server

```
yarn add ramda pixi.js pixi.js-legacy react-pixi-fiber@1.0.0-beta.4

yarn add --dev http-server
```

&nbsp;



## 3. Build & Serve

### Build for DEV

```
yarn build:dev
```

### Serve from `localhost:8000`

```
yarn serve
```

Note: `chrome://inspect/#workers` to inspect running workers.


### Build for PROD

```
yarn serve
```

&nbsp;




## 4. How It Works


### 4-1. UMD Library

Outputting UMD library is quite easy.  
It's just that you often encouter issues when making it work with `babel`...

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

In the above I have two entries, but this is not necessary.  
Along with the main bundle,
I just needed another bundle output for
`SharedWorker` for messaging between the starter and the widget (to dynamically update props).

If you were to output only 1 bundle, you would do:

```js
  entry: './src/index.jsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'airport.js?[hash]',
    library: 'Airport',
    libraryTarget: 'umd',
  },
```

`[hash]` is not necessary neither.
I have it because I did not want to *"hard reload browsers"* when testing.

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

As you can see, it only exports `init` function using `export`.  
If you want to use `export default`,
then *[you need a special setup for babel](#5-1-module-exports-issues)*.

The module is now exposed *globally* as `Airport`.

I have the following HTML for testing:

`src/index.html`

```html
<!DOCTYPE html>
<html>
<body>
  <div id="airport"></div>

<script type="text/javascript" src="<%= htmlWebpackPlugin.files.js[0] %>"></script>

<script type="text/javascript">
Airport.app.init({
  {WHATEVER THE CONFIG PARAMS I WANT TO PASS}
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

Two things to note about the above HTML file.

First of all, we have the HTML only for a *testing* reason.  
That is why I use `html-webpack-plugin` only in `webpack.dev.js`.

Secondly, I could have statically served HTML file.
Instead, I use `html-webpack-plugin` to output to `dist`
because I simply want to append a hash to the file,
so that I don't have to reload hard.

When you want to output UMD library, you don't need an HTML file.
Simple is that.

&nbsp;



### 4-2. App Structure

It is probably worth describing how the app work.

If you are interested only in UMD library, you may stop reading.

So, the app starts when it renders React app into a designated DOM:

`src/index.html`

```html
<div id="airport"></div>

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

Here, the prop `config` is totally static, and it is given from whoever passes.  
By saying *"static"*, it means, React won't pick up the changes
even when the starter change the content of the prop.  
(that's why we need some tools like *SharedWorker*, or *Emitter* to allow messaging)

Now, it is the `Widget` component which renders the actual content:

`src/widget/index.jsx`

```jsx
import { AirportContent as Content } from './content';

export const Widget = ({ config = {} }) => {
  const [worker, setWorker] = useState();
  const [stageOptions, setStageOptions] = useState(DEFAULT_STAGE_OPTIONS);
  const [airportOptions, setAirportOptions] = useState(DEFAULT_AIRPORT_OPTIONS);

  useEffect(() => {
    setWorker(new SharedWorker('./airport.worker.js'));
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
```

in the above, `<Stage>` is a component provided by `react-pixi-fiber`
which does *NOT* render something that we are familiar with,
but it actually renders a `canvas` element.
All the components within `<Stage>` are graphical elements of HTML5 Canvas.

In `Widget` component, the app uses `useState` to set the followings:

- `stageOptions`
- `airportOptions`

`stageOptions` is passed to `<Stage>` so that `reac-pixi-fiber` can decide
the size for the canvas element.

`airportOptions` is for the airport animations only.
When we `init` the widget from the HTML, we *statically* pass `config`.
In `config` prop, we have a bunch fo parameters which define the app behavior.

Also, `Widget` refers to `airport.worker.js`.

```jsx
  setWorker(new SharedWorker('./airport.worker.js'));
```

From HTML, we can update the size of the widget.

However, I regret now that I should have used *[Emitter](https://github.com/emitter-io/emitter)* instead...  
It is ugly to output 2 bundles for a widget...



&nbsp;



## 5. Notes

### 5-1. Module Exports Issues

When exporting UMD library, you may encounter tons of issues.  
(e.g. `export default`, etc.)  
Here is a list of plugins you may want to dig in:

- <s>@babel/plugin-transform-modules-umd</s>
- @babel/plugin-proposal-export-default-from
- @babel/plugin-proposal-export-namespace-from
- babel-plugin-add-module-exports


### 5-2. `webpack-dev-server`

A bundle works for production, but it fails when using `webpack-dev-server`.  
With `writeToDisk: true` option, although we can read a physical output, it still does not work.  
It loads the library fine, *but exported module becomes an empty object...*


### 5-3. Emotion & Tailwind

Attempt to use `twin.macro` (Twin) for Emotion and Tailwind fails.

Note that Twin v2 was recently released as to support:
- tailwind@2 ([released on Nov. 19, 2020](https://github.com/ben-rogerson/twin.macro/releases/tag/2.0.0))
- emotion@11 ([released on Nov. 12, 2020](https://emotion.sh/docs/emotion-11))

There is an instruction given in the above release note,
but *it seems to fail when building as an UMD library...*

It builds fine, but I get the following runtime error:

```
index.jsx:13 Uncaught ReferenceError: __cssprop is not defined
```

If not for UMD library, it should work just fine.

Another workaround worth consider:  
https://github.com/ben-rogerson/twin.macro/issues/184#issuecomment-727236689

FYI: in case you want to use Twin in a normal manner (not UMD), then here are the packages you need:

- babel-plugin-macros
- @emotion/babel-plugin-jsx-pragmatic
- @emotion/react &lt;-- Not for "devDependencies" but "dependencies".
- @emotion/styled &lt;-- Not for "devDependencies" but "dependencies".
- twin.macro &lt;-- Not for "devDependencies" but "dependencies".

and prepare the following config files:

`babel.config.js`  

```js
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        useBuiltIns: 'entry',
        corejs: 3,
        targets: {
          esmodules: true,
        },
      },
    ],
    '@babel/preset-react',
  ],
  plugins: [
    'babel-plugin-macros',
    [
      '@emotion/babel-plugin-jsx-pragmatic',
      {
        export: 'jsx',
        import: '__cssprop',
        module: '@emotion/react',
      },
    ],
    [
      '@babel/plugin-transform-react-jsx',
      {
        pragma: '__cssprop',
        pragmaFrag: 'React.Fragment',
      },
    ],
  ],
};
```

`babel-plugin-macros.config.js`  

```
module.exports = {
  // preset: 'emotion',
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
    config: './src/tailwind.config.js',
    dataTwProp: true,
    debugPlugins: false,
    debug: false,
  },
};
```

&nbsp;



## 6. License

Dual-licensed under either of the followings.  
Choose at your option.

- The UNLICENSE ([LICENSE.UNLICENSE](LICENSE.UNLICENSE))
- MIT license ([LICENSE.MIT](LICENSE.MIT))
