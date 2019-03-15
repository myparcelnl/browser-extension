/* eslint-disable no-console */
const log = {
  success(message) {
    this.createMessage(message, {
      backgroundColor: '#23b237',
    });
  },

  info(message) {
    this.createMessage(message, {
      backgroundColor: '#34b7d4',
    });
  },

  warning(message) {
    this.createMessage(message, {
      backgroundColor: '#d18800',
    });
  },

  error(message) {
    this.createMessage(message, {
      backgroundColor: '#d45839',
    });
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
        'background-color: #333; font-size: 140%; color: white; border-radius: 2px 0 0 2px; padding: 0 .5rem;',
        'background-color: #ff8c00; color: white; padding: 2px .5rem;',
        'background-color: #fff; color: #222; border-radius: 0 2px 2px 0; padding: 2px .5rem;'
      );
    }
  },

  content(message, receiving = false) {
    if (process.env.NODE_ENV !== 'prod') {
      console.log(
        `%c${this.receiving(receiving)}%cContent%c${message}`,
        'background-color: #333; font-size: 140%; color: white; border-radius: 2px 0 0 2px; padding: 0 .5rem;',
        'background-color: #1eb9c5; color: white; padding: 2px .5rem;',
        'background-color: #fff; color: #222; border-radius: 0 2px 2px 0; padding: 2px .5rem;'
      );
    }
  },

  background(message, receiving = false) {
    if (process.env.NODE_ENV !== 'prod') {
      console.log(
        `%c${this.receiving(receiving)}%cBackground%c${message}`,
        'background-color: #333; font-size: 140%; color: white; border-radius: 2px 0 0 2px; padding: 0 .5rem;',
        'background-color: #1eb436; color: white; padding: 2px .5rem;',
        'background-color: #fff; color: #222; border-radius: 0 2px 2px 0; padding: 2px .5rem;'
      );
    }
  },

  receiving(bool) {
    return bool ? '▲' : '▼'
  },

  createMessage(message, style = '') {
    if (process.env.NODE_ENV !== 'prod') {
      console.log(`%c${message}`, `${style} border-radius: 2px; padding: 1px .5em;`);
    }
  },
};

export default log;
