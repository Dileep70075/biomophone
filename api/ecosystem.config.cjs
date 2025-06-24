module.exports = {
    apps: [
        {
            name: 'biomophoneapi',
            script: 'index.js', // Replace with your entry file
            cwd: './', // Current working directory for the backend
            instances: 1, // Set to 'max' for clustering
            exec_mode: 'fork', // Use 'cluster' if you want multiple instances
            env_production: {
                NODE_ENV: 'production',
                PORT: 8800,
            },
            output: './logs/backend_output.log',
            error: './logs/backend_error.log',
        },
    ],
};
