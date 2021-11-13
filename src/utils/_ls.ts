const _ls = {
  Set(key: string, value: any) {
    localStorage.setItem(key, value);
  },

  Get(key: string) {
    return localStorage.getItem(key);
  },

  Del(key: string) {
    localStorage.removeItem(key);
  },

  Clear() {
    localStorage.clear();
  },
};

export default _ls;
