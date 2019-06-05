module.exports = {

  /**
   * Oauth2 client ID.
   * @type {string}
   */
  clientId: '***',

  /**
   * Oauth2 client secret.
   * @type {string}
   */
  clientSecret: '***',

  /**
   * Refresh token.
   *
   * @see https://github.com/DrewML/chrome-webstore-upload/blob/master/How%20to%20generate%20Google%20API%20keys.md
   * @type {string}
   */
  refreshToken: '***',

  /**
   * App names and their extension ids.
   *
   * @type {Object}
   */
  apps: {
    myparcel: 'kmholoicenmanogjcnmajgjjpgppcghb',
    flespakket: 'nemmbcegkmaajnbeoedebhhelgncpdob',
    sendmyparcel: 'lnlejgndglbdjmcmehfnljgdamnomnkp',

    // Test extensions
    // staging_myparcel: '',
    // staging_flespakket: '',
    // staging_sendmyparcel: '',
  },
};
