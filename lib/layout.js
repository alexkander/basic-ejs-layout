'use strict';

const fs   = require('fs');
const path = require('path');
const ejs  = require('ejs');
const _    = require('lodash');


class Layout {

  constructor (directory, locals) {
    this._sections = {};
    this._directory = directory;
    this._locals    = locals;
  }

  parent (filePath) {
    if (!filePath || typeof filePath !== 'string') {
      throw new Error('layout without filePath');
    }
    if (!/\.ejs$/.test(filePath)) {
      throw new Error(`layout is not a *.ejs file → "${filePath}"`);
    }
    this._parent = path.resolve(this._directory, filePath);
  }

  include (filePath, entry = {}) {
    if (!filePath || typeof filePath !== 'string') {
      throw new Error('widget without filePath');
    }
    if (!/\.ejs$/.test(filePath)) {
      throw new Error(`widget is not a *.ejs file → "${filePath}"`);
    }

    filePath     = path.resolve(this._directory, filePath);
    const locals = _.extend({}, this._locals, entry);
    const parent = this._parent;
    const body   = this.body;
    delete this._parent;
    delete this.body;
    const result = this.render(filePath, locals, {});
    this._parent = parent;
    this.body    = body;

    return result;

  }
  
  render (filePath, locals, ejsOptions) {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const markup = ejs.render(fileContent, locals, ejsOptions);
    if (this._parent) {
      let layoutPath = this._parent;
      this.body = markup;
      delete this._parent;
      return this.render(layoutPath, locals, ejsOptions);
    }
    return markup;
  }

  section (sectionName, callback) {
    this._sections[sectionName] = this._sections[sectionName] || [];
    this._sections[sectionName].push(callback);
  }

  put (sectionName) {
    if (!this._sections[sectionName]) return '';
    this._sections[sectionName].map((callback) => {
      callback();
    });
  }

  static engine ({as, viewspath}) {
    return function (filePath, locals, cb) {
      process.nextTick(() => {
        try {
          locals[as] = new Layout(viewspath, locals);
          const result = locals[as].render(filePath, locals, {});
          cb(null, result);
        } catch (error) {
          cb(error);
        }
      });
    };
  }

}

module.exports = Layout;