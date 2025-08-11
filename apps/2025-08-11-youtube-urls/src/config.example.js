// Example deployment-specific config.
// Copy this file to src/config.js and fill values when you control the hosting.
// IMPORTANT: Any API key embedded in client-side code becomes public. Restrict by referrer and API scope.

window.APP_CONFIG = {
  // どちらか一方を使います:
  // 1) クライアント直叩き（鍵は露出します）
  apiKey: "",
  // 2) サーバプロキシ（推奨）
  // proxyBase: "https://us-central1-<your-project-id>.cloudfunctions.net/api",
  allowedHosts: ["muumuu8181.github.io"],
};
