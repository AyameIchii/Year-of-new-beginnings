/**
 * Mock window.storage cho môi trường local (VSCode / Vite).
 * Trong Claude.ai, window.storage được inject sẵn nên file này không cần.
 *
 * Dữ liệu lưu vào localStorage để giữ qua lần reload.
 * Muốn lưu RAM only thì đổi localStorage → const store = {}.
 */

if (!window.storage) {
  window.storage = {
    async get(key, shared = false) {
      const k = (shared ? "shared:" : "local:") + key;
      const value = localStorage.getItem(k);
      return value !== null ? { key, value, shared } : null;
    },

    async set(key, value, shared = false) {
      const k = (shared ? "shared:" : "local:") + key;
      localStorage.setItem(k, value);
      return { key, value, shared };
    },

    async delete(key, shared = false) {
      const k = (shared ? "shared:" : "local:") + key;
      localStorage.removeItem(k);
      return { key, deleted: true, shared };
    },

    async list(prefix = "", shared = false) {
      const p = (shared ? "shared:" : "local:") + prefix;
      const keys = Object.keys(localStorage)
        .filter((k) => k.startsWith(p))
        .map((k) => k.replace(/^(shared:|local:)/, ""));
      return { keys, prefix, shared };
    },
  };
}
