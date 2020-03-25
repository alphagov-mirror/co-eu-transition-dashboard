const { Router } = require('express');
const path = require('path');
const jwt = require('services/jwt');
const { protect } = require('services/authentication');
const config = require('config');

const notLocals = [
  '_router',
  'journey',
  'constructor',
  'form',
  'next',
  'locals',
  'middleware',
  'handler',
  'req',
  'res'
];

const notDefined = val => typeof val === 'undefined' || val === null;
const defined = val => !notDefined(val);
const removeNulls = (obj) => {
  var isArray = obj instanceof Array;

  if(isArray) {
    for (var i = obj.length; i--;) {
      if (typeof obj[i] === "object") {
        obj[i] = removeNulls(obj[i]);
      } else if (obj[i] === null || obj[i] === undefined || (typeof obj[i] === "string" && !obj[i].length)) {
        obj.splice(i,1);
      } else if (!isNaN(obj[i])) {
        obj[i] = parseInt(obj[i]);
      }
    }
    if(!obj.length) {
      return undefined;
    }
  } else {
    for (var k in obj){
      if (typeof obj[k] === "object") {
        obj[k] = removeNulls(obj[k]);
      } else if (obj[k] === null || obj[k] === undefined || (typeof obj[k] === "string" && !obj[k].length)) {
        delete obj[k];
      } else if (!isNaN(obj[k])) {
        obj[k] = parseInt(obj[k]);
      }
    }
  }

  return obj;
}

const allProperties = (obj, arr = []) => {
  if (notDefined(obj)) {
    return arr;
  }
  const descriptors = Object.getOwnPropertyDescriptors(obj);
  const props = [
    ...Object.keys(descriptors).map(key => {
      return { key, descriptor: descriptors[key] };
    }),
    ...arr
  ];
  return allProperties(Object.getPrototypeOf(obj), props);
};

class Page {
  constructor(path, req, res) {
    this.path = path;
    this.req = req;
    this.res = res;
  }

  get url() {
    return '/';
  }

  get middleware() {
    return [...protect(['admin', 'user'])];
  }

  get template() {
    return path.join(this.path, `${this.constructor.name}.html`);
  }

  get schema() {
    return {}
  }

  get data() {
    const data = jwt.restoreData(this.req) || {};
    return data[this.constructor.name] || this.schema;
  }

  getRequest(req, res) {
    res.render(this.template, Object.assign(this.locals, { config } ));
  }

  saveData(data = {}, keepExistingData) {
    const _data = { [this.constructor.name]: data };
    jwt.saveData(this.req, this.res, _data, keepExistingData);
  }

  async postRequest(req, res) {
    this.saveData(removeNulls(req.body));

    res.redirect(this.url);
  }

  async handler(req, res) {
    this.req = req;
    this.res = res;

    const method = req.method.toLowerCase();

    switch (method) {
      case 'post':
        await this.postRequest(req, res);
        break;
      case 'get':
      default:
        await this.getRequest(req, res);
    }
  }

  get router() {
    this._router = Router();
    this._router.page = this;

    this.middleware.forEach(middleware => {
      this._router.use(this.url, middleware.bind(this));
    });

    this._router.use(this.url, this.handler.bind(this));

    return this._router;
  }

  get locals() {
    return allProperties(this)
      .filter(({ key }) => !(notLocals.includes(key)))
      .reduce((obj, { key, descriptor }) => {
        if (typeof descriptor.value === 'function') {
          obj[key] = descriptor.value.bind(this);
        } else if (defined(descriptor.value)) {
          obj[key] = this[key];
        } else if (defined(descriptor.get) && key !== '__proto__') {
          Object.assign(obj, {
            [key]: this[key]
          });
        }

        return obj;
      }, {});
  }
}

module.exports = Page;