module.exports = {
  apps: [
    {
      name: "biomophoneclient", // Change this to your app's name
      script: "node_modules/.bin/http-server",
      args: ["build", "-p", "3000"], // Serve the 'build' directory on port 4000
      instances: 1,
      autorestart: true,
      watch: true,
      max_memory_restart: "1G",
      env_production: {
        NODE_ENV: "production",
        PORT: 3000, // Change this to your production port
      },
    },
  ],
};
