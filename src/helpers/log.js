/* eslint-disable no-console */
const log = {
  success(message) {
    this.createMessage(message, 'background-color: #23b237;');
  },

  info(message) {
    this.createMessage(message, 'background-color: #34b7d4;');
  },

  warning(message) {
    this.createMessage(message, 'background-color: #d18800;');
  },

  error(message) {
    this.createMessage(message, 'background-color: #d45839;');
  },

  separator() {
    if (process.env.NODE_ENV !== 'prod') {
      console.log(
        `%c${new Date().toLocaleTimeString()}%c                                                                  `,
        'background-color: red; color: #fff; padding: 0 .5rem;',
        'background: repeating-linear-gradient(45deg, yellow, yellow 10px, black 10px, black 20px);',
      );
    }
  },

  event(message) {
    if (process.env.NODE_ENV !== 'prod') {
      console.log(
        `%cEvent%c${message}`,
        'background-color: #7842FF; color: white; border-radius: 2px 0 0 2px; padding: 0 .5rem; font-size: 85%;',
        'background-color: #fff; color: #222; border-radius: 0 2px 2px 0; padding: 0 .5rem; font-size: 85%;'
      );
    }
  },

  popup(message, receiving = false) {
    if (process.env.NODE_ENV !== 'prod') {
      // receiving = receiving ? '↓' : '↑';
      console.log(
        `%c${this.receiving(receiving)}%cPopup%c${message}`,
        `${this.color(receiving)} border-radius: 2px 0 0 2px; padding: 1px .5rem;`,
        `background: linear-gradient(to ${receiving ? 'top' : 'bottom'} left, red, #ff8c00); color: white; padding: 1px .5rem;`,
        `${this.color(receiving)} border-radius: 0 2px 2px 0; padding: 1px .5rem;`
      );
    }
  },

  content(message, receiving = false) {
    if (process.env.NODE_ENV !== 'prod') {
      console.log(
        `%c${this.receiving(receiving)}%cContent%c${message}`,
        `${this.color(receiving)} border-radius: 2px 0 0 2px; padding: 1px .5rem;`,
        `background: linear-gradient(to ${receiving ? 'top' : 'bottom'} left, blue, #1eb9c5); color: white; padding: 1px .5rem;`,
        `${this.color(receiving)} border-radius: 0 2px 2px 0; padding: 1px .5rem;`
      );
    }
  },

  background(message, receiving = false) {
    if (process.env.NODE_ENV !== 'prod') {
      console.log(
        `%c${this.receiving(receiving)}%cBackground%c${message}`,
        `${this.color(receiving)} border-radius: 2px 0 0 2px; padding: 1px .5rem;`,
        `background: linear-gradient(to ${receiving ? 'top' : 'bottom'} left, yellowgreen, #1eb436); color: white; padding: 1px .5rem;`,
        `${this.color(receiving)} border-radius: 0 2px 2px 0; padding: 1px .5rem;`
      );
    }
  },

  color(bool) {
    if (bool === 'queue') {
      return 'background-color: #666; color: #fff;';
    }
    return bool ? 'background-color: #fff; color: #222;' : 'background-color: #333; color: #fff;';
  },

  receiving(bool) {
    if (bool === 'queue') {
      return 'QUEUED';
    }
    return bool ? '▼' : '▲';
  },

  createMessage(message, style = '') {
    if (process.env.NODE_ENV !== 'prod') {
      console.log(`%c${message}`, `color: white; ${style} border-radius: 2px; padding: 1px .5em;`);
    }
  },
};

export default log;
