/* eslint-disable no-console */
const log = {
  success(message) {
    this.createMessage(message, ['#23b237']);
  },

  info(message) {
    this.createMessage(message, ['#34b7d4']);
  },

  warning(message) {
    this.createMessage(message, ['#d18800']);
  },

  error(message) {
    this.createMessage(message, ['#d45839']);
  },

  createMessage(message, style = []) {
    if (process.env.NODE_ENV !== 'prod') {
      console.log(`%c${message}`, this.style.apply(null, style));
    }
  },

  style(bgc, color = 'white', padding = '1px .5em') {
    return `background-color: ${bgc}; color: ${color}; border-radius: 2px;${padding ? `padding: ${padding};` : ''}`;
  },
};

export default log;
