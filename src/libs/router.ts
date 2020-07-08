function serializeParams(obj: Object) {
  let str = '';
  for (const [key, value] of Object.entries(obj)) {
    str += '&';
    str += `${window.encodeURIComponent(key)}=${window.encodeURIComponent(value as string)}`;
  }
  if (str) {
    str = str.slice(1);
  }
  return str;
}

export class Router {
    #path = '/';
    #search: {[index: string]: string}
    #hash = '';
    constructor() {
      const searchTarget: {[index: string]: string} = {};
      this.#search = new Proxy(searchTarget, {
        set: (target, propKey, value) => {
          if (typeof value !== 'string') {
            throw new Error(`Search param value must be a string`);
          }

          target[propKey as string] = value;
          this.update();
          return true;
        },
      });

      const rawHash = window.location.hash.slice(1);
      if (!rawHash) {
        return;
      }

      const matchPath = rawHash.match(/[^?#]*/);
      const matchSearch = rawHash.match(/(?<=\?)[^#]*/);
      const matchHash= rawHash.match(/(?<=#).*/);

      if (matchPath) {
        this.#path = window.decodeURIComponent(matchPath[0]);
      }

      if (matchSearch) {
        const searchParams = matchSearch[0].split('&');
        for (const param of searchParams) {
          const [key, value] = param.split('=');
          this.#search[window.decodeURIComponent(key)] = window.decodeURIComponent(value);
        }
      }

      if (matchHash) {
        this.#hash = window.decodeURIComponent(matchHash[0]);
      }
    }

    get path() {
      return this.#path;
    }

    set path(value) {
      this.#path = value;
      this.update();
    }

    get search() {
      return this.#search;
    }

    set search(_) {
      throw new Error('Not allowed to set property: search');
    }

    get hash() {
      return this.#hash;
    }

    set hash(value) {
      this.#hash = value;
      this.update();
    }

    update() {
      const searchStr = serializeParams(this.search);
      const hashStr = window.encodeURIComponent(this.#hash);
      let url = '#';
      if (this.#path) {
        url += this.path;
      }
      if (searchStr) {
        url += '?' + searchStr;
      }
      if (hashStr) {
        url += '#' + hashStr;
      }
      if (url === '#') {
        url = '';
      }
      // history.replaceState may add multiple history when the initial url doesn't have '#' .
      // window.history.replaceState(null, '', url);
      window.location.replace(url);
    }
}
