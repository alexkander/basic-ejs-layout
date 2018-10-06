basic-ejs-layout
===============

[![npm version](https://badge.fury.io/js/basic-ejs-layout.svg)](https://badge.fury.io/js/basic-ejs-layout) [![Build Status](https://travis-ci.org/arondn2/basic-ejs-layout.svg?branch=master)](https://travis-ci.org/arondn2/basic-ejs-layout)
[![Coverage Status](https://coveralls.io/repos/github/arondn2/basic-ejs-layout/badge.svg?branch=master)](https://coveralls.io/github/arondn2/basic-ejs-layout?branch=master)

Template system based on EJS for express/loopback 3.x modules

## Installation

`npm install basic-ejs-layout --save`

## Usage

#### Include
```js
var Layout = require('basic-ejs-layout');
```

#### `new Layout(viewdir = '', locals = {})`;

Create a instance to render views.

##### Arguments
 Name      | Type      | Description
-----------|-----------|-------------
 `viewdir` | `string`  | Directory where find views.
 `locals`  | `object`  | Vars to include in rendering.

##### Example
```js
// Option 1
var layout = new Layout.get();
// Option 2
var layout = new Layout.get('./myviews');
// Option 3
var layout = new Layout.get('./myviews', {
  var1: "one",
  var2: "two",
});
```

#### `layout.render(filePath, locals = {}, ejsOpts = {})`

Render a the file indicated in `filePath`, with vars in `locast`, and EJS options
`ejsOpts`. Vars in `locals` are extend from `locals` in `new Layout` call. Return
the view rendered.

##### Arguments
 Name       | Type      | Description
------------|-----------|-------------
 `filePath` | `string`  | View path to render.
 `locals`   | `object`  | Vars to include in rendering.
 `ejsOpts`  | `object`  | Options to EJS render.

##### Example
```js
var layout   = new Layout.get('./myviews', { appname: 'My App' });
var rendered = layout.render('myview.ejs', { message: 'Hello world' });
// Render ./myviews/myview.ejs file with vars appname='My app' and message='Hello world'.

```

#### `layout.parent(filePath)`

Indicate a view is render into another view. Child view is set in property
`body` from renderer instance. This require send layout instance into vars to
render.

##### Arguments
 Name       | Type      | Description
------------|-----------|-------------
 `filePath` | `string`  | Directory where find views.

##### Example

```js
var layout   = new Layout.get('./myviews');
var rendered = layout.render('myview.ejs', {  ly: layout }); // Render ./myviews/myview.ejs
```

./myviews/myview.ejs
```html
<% ly.parent('myparent.ejs') %>
<p>Luke: Nooooo!!!</p>
```

./myviews/myparent.ejs
```html
<p>Luke: He told me you kill him</p>
<p>Darth Vader: No, I am your father</p>
<%- ly.body %>
```

Result:
```html
<p>Luke: He told me you kill him</p>
<p>Darth Vader: No, I am your father</p>
<p>Luke: Nooooo!!!</p>
```

#### `layout.include(filePath, locals = {})`
Render a view into another view. Vars in `locals` will be add into rendering
view. Return the view rendered.

##### Arguments
 Name       | Type      | Description
------------|-----------|-------------
 `filePath` | `string`  | Directory where find views.
 `locals`   | `object`  | Vars to include in rendering.

##### Example

```js
var layout   = new Layout.get('./myviews');
var rendered = layout.render('myview.ejs', {  ly: layout }); // Render ./myviews/myview.ejs
```

./myviews/myview.ejs
```html
<p>Luke: He told me you kill him</p>
<p>Darth Vader: No, I am your father</p>
<%- ly.include('otherview.ejs', { destinatary: 'Luke' }) %>
```

./myviews/otherview.ejs
```html
<p><%- destinatary %>: Nooooo!!!</p>
```

Result:
```html
<p>Luke: He told me you kill him</p>
<p>Darth Vader: No, I am your father</p>
<p>Luke: Nooooo!!!</p>
```

#### `layout.engine(as = 'layout')`
Return a callback to set in a engine render. This engine will have a global var
called as indicated `as` param. Return a function.

##### Arguments
 Name | Type      | Description
------|-----------|-------------
 `as` | `string`  | Varname to instance layout to render.

##### Example
```js
var app = express();
app.engine('ejs', Layout.engine('ly'));
app.set('view engine', 'ejs');
app.set('views', 'myviews'); // Optional.

app.get('/', function (req, res) {
  res.render('myview'); // myview.ejs in views folder set in express app.
});
```

### Troubles

If you have any kind of trouble with it, just let me now by raising an issue on
the GitHub issue tracker here:

https://github.com/arondn2/basic-ejs-layout/issues

Also, you can report the orthographic errors in the READMEs files or comments. Sorry for that, English is not my main language.

## Tests

`npm test` or `npm run cover`
