'use strict';

const fs   = require('fs');
const path = require('path');
const ejs  = require('ejs');

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

    filePath = path.resolve(this._directory, filePath);

    return this.render(filePath, this._locals, {});

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

  static handler (filePath, args, cb) {
    process.nextTick(() => {
      try {
        const result = args.layout.render(filePath, args, {});
        cb(null, result);
      } catch (error) {
        cb(error);
      }
    });
  }

}

module.exports = Layout;