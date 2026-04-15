const path = require("path");

const root = process.env.HAMARSRIDE_ROOT || path.resolve(__dirname, "..");

module.exports = {
  apps: [
    {
      name: "hamarsride-backend",
      cwd: path.join(root, "hamarsride-backend"),
      script: "src/server.js",
      exec_mode: "fork",
      instances: 1,
      node_args: "--max-old-space-size=512",
      watch: false,
      autorestart: true,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: 5000,
      },
    },
  ],
};
