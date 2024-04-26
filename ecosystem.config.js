module.exports = {
  apps: [
    {
      name: 'data-io',
      script: 'npm',
      args: 'run start:prod',
      exec_mode: 'fork',
      instance_var: 'INSTANCE_ID',
      instances: 1,
      autorestart: true,
      env: {},
    },
  ],
};
