module.exports = {
  mode: 'jit',
  purge: ['./src/**/*.{css,tsx}'],
  darkMode: false,
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/forms')],
};
