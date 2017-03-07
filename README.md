# foundation-select

Select plugin for Foundation sites 6

[![Travis](https://img.shields.io/travis/samuelmc/foundation-select.svg)](https://travis-ci.org/samuelmc/foundation-select)

## Installation

**With bower:**

[![Bower](https://img.shields.io/bower/v/foundation-select.svg)]()

```shell
bower install --save foundation-select
```

Add all nessesary files to your html. This plugin only works with foundation and requires foundation-perfect-scrollbar and font-awesome.
```html
<link rel="stylesheet" type="text/css" href="bower_components/foundation-sites/dist/css/foundation.min.css"> 
<link rel="stylesheet" type="text/css" href="bower_components/foundation-perfect-scrollbar/dist/css/foundation-perfect-scrollbar.min.css">
<link rel="stylesheet" type="text/css" href="bower_components/foundation-select/dist/css/foundation-select.min.css">
<link rel="stylesheet" type="text/css" href="bower_components/font-awesome/css/font-awesome.min.css">
...
<script src="bower_components/jquery/dist/jquery.min.js"></script>
<script src="bower_components/perfect-scrollbar/js/perfect-scrollbar.jquery.min.js"></script>
<script src="bower_components/foundation-sites/dist/js/foundation.min.js"></script>
<script src="bower_components/foundation-perfect-scrollbar/dist/js/foundation.perfectScrollbar.min.js"></script>
<script src="bower_components/foundation-select/dist/js/foundation.select.min.js"></script>
```

If you are using foundation's scss with gulp, the best way add the styles is by adding it to the sass paths in your gulpfile.
```js
var gulp = require('gulp');
var $    = require('gulp-load-plugins')();

var sassPaths = [
  'bower_components/foundation-sites/scss',
  'bower_components/foundation-perfect-scrollbar/src/scss/plugin',
  'bower_components/foundation-select/src/scss/plugin',
  'bower_components/motion-ui/src',
  'bower_components/fontawesome/scss'
];

gulp.task('sass', function() {
    ...

```

Then add these settings to your _settings.scss file for customization
```scss
$select-background: $input-background !default;
$select-border: $input-border !default;
$select-color: $input-color !default;
$select-dropdown-height: rem-calc(300);
```
## Usage

Just add a data-select attribute to your select tag.

```html
<select data-select>
    <option value="">Placeholder<option>
    <option value="0">Option 1<option>
    <option value="1">Option 2<option>
    ...
</select>
```

Run foundation and it will automaticaly initialize all the selects
```js
$(document).foundation();
```

**Plugin options**

|Name     |Default  |Descrition|
|---------|---------|----------|
|data-icon-class|'fa-caret-down'|The FontAwesome class for the select triangle icon.|
|data-placeholder|''|Custom placeholder.|
|data-value|''|The default value of the select.|

## Licence
[![MIT Licence](https://img.shields.io/badge/Licence-MIT-blue.svg)](https://opensource.org/licenses/mit-license.php)

&copy; Samuel Moncarey
