module.exports = {
  apps: [
    {
      name: 'crm',
      script: 'dist/apps/gdmn-nxt-server/main.js',
      watch: true,
      ignore_watch: ['node_modules'],
      env: {
        NODE_ENV: 'production',
        NX_SERVER_HOST: '0.0.0.0',
      },
      env_development: {
        NODE_ENV: "development",
      }
    }
  ]
}
