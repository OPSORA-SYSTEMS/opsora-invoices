module.exports = {
  apps: [
    {
      name: "opsora-invoices",
      script: "node_modules/.bin/next",
      args: "start",
      cwd: "/var/www/opsora-invoices",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      error_file: "/var/log/opsora-invoices/error.log",
      out_file: "/var/log/opsora-invoices/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    },
  ],
};
