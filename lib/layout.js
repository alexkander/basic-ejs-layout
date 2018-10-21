'use strict';

const fs   = require('fs');
const path = require('path');
const ejs  = require('ejs');

class Layout {

  constructor (globalLocals = {}, transform = null) {
    [globalLocals, transform] = Layout.validParams(globalLocals, transform);
    this._directory = '';
    this._globalLocals = globalLocals;
    this._transform    = transform;
  }

  getTransformLocals (locals) {
    return this._transform(Object.assign({}, this._globalLocals, locals), this) || locals;
  }
  
  render (filePath, locals = {}, ejsOptions = {}) {
    Layout.validateFilePath(filePath);
    filePath          = path.resolve(this._directory, filePath);
    this._directory   = path.dirname(filePath);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const markup      = ejs.render(fileContent, this.getTransformLocals(locals), ejsOptions);
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
    this._parent = filePath;
  }

  include (filePath, locals = {}) {
    Layout.validateFilePath(filePath);
    filePath        = path.resolve(this._directory, filePath);
    const newLocals = Object.assign({}, this._globalLocals, locals);
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

  static engine (globalLocals = {}, transform = null) {
    [globalLocals, transform] = Layout.validParams(globalLocals, transform);

    return function (filePath, locals, cb) {
      process.nextTick(() => {
        try {
          const mainGlobals = Object.assign({}, globalLocals, locals);
          const layout      = new Layout(mainGlobals, transform);
          const result      = layout.render(filePath, {}, {});
          cb(null, result);
        } catch (error) {
          cb(error);
        }
      });
    };
  }

  static validParams (globalLocals, transform) {
    if (typeof globalLocals === 'function') {
      transform = globalLocals;
      globalLocals = {};
    }
    if (!transform) {
      transform = (locals, layout) => locals;
    }
    if (typeof globalLocals !== 'object') {
      throw Layout.getError('INVALID_GLOBAL_LOCALS', 'globalLocals is not a function');
    }
    if (typeof transform !== 'function') {
      throw Layout.getError('INVALID_TRANSFORM_LOCALS_FUNCTION', 'transform is not a function');
    }
    return [globalLocals, transform];
  }

}

module.exports = Layout;