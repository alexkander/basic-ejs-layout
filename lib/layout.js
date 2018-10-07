'use strict';

const fs   = require('fs');
const path = require('path');
const ejs  = require('ejs');

class Layout {

  constructor (directory = '', locals = {}) {
    // this._sections = {};
    this._directory = directory;
    this._locals    = locals;
  }
  
  render (filePath, locals = {}, ejsOptions = {}) {
    Layout.validateFilePath(filePath);
    filePath          = path.resolve(this._directory, filePath);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const markup      = ejs.render(fileContent, locals, ejsOptions);
    this._directory   = path.dirname(filePath);
    if (this._parent) {
      const layoutPath  = this._parent;
      this.body       = markup;
      const directory = this._directory;
      delete this._parent;
      const result    = this.render(layoutPath, locals, ejsOptions);
      this._directory = directory;
      return result;
    }
    return markup;
  }

  parent (filePath) {
    Layout.validateFilePath(filePath);
    this._parent = path.resolve(this._directory, filePath);
  }

  include (filePath, locals = {}) {
    Layout.validateFilePath(filePath);
    filePath        = path.resolve(this._directory, filePath);
    const newLocals = Object.assign({}, this._locals, locals);
    const parent    = this._parent;
    const body      = this.body;
    const directory = this._directory;
    delete this._parent;
    delete this.body;
    const result    = this.render(filePath, newLocals, {});
    this._parent    = parent;
    this.body       = body;
    this._directory = directory;
    return result;
  }

  // section (sectionName, callback) {
  //   this._sections[sectionName] = this._sections[sectionName] || [];
  //   this._sections[sectionName].push(callback);
  // }

  // put (sectionName) {
  //   if (!this._sections[sectionName]) return '';
  //   this._sections[sectionName].map((callback) => {
  //     callback();
  //   });
  // }

  static getError(code, messsage) {
    const err = new Error(messsage);
    err.code = code;
    return err;
  }

  static validateFilePath (filePath) {
    if (!filePath || typeof filePath !== 'string') {
      throw Layout.getError('INVALID_FILEPATH', 'filePath is not valid');
    }
    if (!/\.ejs$/.test(filePath)) {
      throw Layout.getError('FILEPATH_IS_NOT_EJS', `filePath is not a *.ejs file → "${filePath}"`);
    }
  }

  static engine (as = 'layout') {
    return function (filePath, locals, cb) {
      process.nextTick(() => {
        try {
          const viewspath = path.dirname(filePath);
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