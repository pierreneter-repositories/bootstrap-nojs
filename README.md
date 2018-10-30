# Bootstrap nojs (bootstrap only css)

> This's [bootstrap](https://github.com/twbs/bootstrap), but without js

[![npm](https://img.shields.io/npm/v/bootstrap-nojs.svg)](https://www.npmjs.com/package/bootstrap-nojs)
![Travis (.org)](https://img.shields.io/travis/pierreneter-repositories/bootstrap-nojs.svg)
![NpmLicense](https://img.shields.io/npm/l/bootstrap-nojs.svg?registry_uri=https%3A%2F%2Fregistry.npmjs.com)

## Install

```bash
yarn add bootstrap-nojs
# or
npm install bootstrap-nojs --save
```

## Usage

import at your SCSS file:

```scss
@import "~bootstrap-nojs/bootstrap.css";
// or import another thing of bootstrap:
@import "~bootstrap-nojs/bootstrap-reboot.css";
@import "~bootstrap-nojs/bootstrap-grid.css";
```

All file of this package:

```
.
|____bootstrap-grid.css
|____bootstrap-grid.css.map
|____bootstrap-grid.min.css
|____bootstrap-grid.min.css.map
|____bootstrap-reboot.css
|____bootstrap-reboot.css.map
|____bootstrap-reboot.min.css
|____bootstrap-reboot.min.css.map
|____bootstrap.css
|____bootstrap.css.map
|____bootstrap.min.css
|____bootstrap.min.css.map
```

## FAQ

### Why do not use `bootstrap`?

If you don't need `js` of bootstrap. This repo has a smaller size. And you don't need care about `js` warning if you install it just for use CSS any more.

### Why do not use `bootstrap-css-only`, `bootstrap-only-css`, `bootstrap-css`?

All of that is out of date with `bootstrap`. This `bootstrap-nojs` keep updated day by day by a cronjob.

## License

MIT
