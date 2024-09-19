module.exports = {
  content: [
    './src/bg1.css',
    './src/{components,contexts,hooks,icons}/**/*.{tsx,ts}',
    './src/api/data/*.ts',
  ],
  theme: {
    extend: {
      colors: {
        white: '#f8f8f8',
        blue: {
          500: '#5271ff',
        },
      },
      screens: {
        xs: '360px',
      },
    },
  },
};
