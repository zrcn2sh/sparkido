/**
 * Wrangler esbuild alias for bare `require("sqlite")` in OpenNext handler.
 * The app uses Cloudflare D1, not Node sqlite; undici may reference this at bundle time only.
 */
class DatabaseSync {
  exec() {}
  prepare() {
    return {
      run: () => {},
      all: () => ({ results: [] }),
      get: () => null,
    }
  }
}

module.exports = { DatabaseSync }
