const path = require("path");

const root = path.resolve(__dirname, "..");

module.exports = {
  apps: [
    {
      name: "hamarsride-user-backend",
      cwd: path.join(root, "hamarsride-user", "hamarsride-backend"),
      script: "src/server.js",
      env: {
        NODE_ENV: "production",
        PORT: 5000,
      },
    },
    {
      name: "hamarsride-admin-backend",
      cwd: path.join(root, "hamarsride-admin", "hamarsride-admin-backend"),
      script: "src/server.js",
      env: {
        NODE_ENV: "production",
        PORT: 5501,
      },
    },
  ],
};
