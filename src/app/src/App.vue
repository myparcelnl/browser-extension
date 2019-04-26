<template>
  <div id="app">
    <a
      v-for="app in apps"
      :key="app.url"
      v-text="app.name" />
  </div>
</template>

<script>

export default {
  name: 'App',
  data: () => ({
    apps: [{
      name: 'myparcel',
      url: 'myparcel',
    },
    {
      name: 'flespakket',
      url: 'flespakket',
    },
    {
      name: 'sendmyparcel',
      url: 'sendmyparcel',
    }],
  }),
  methods: {
    launchApp(app) {

    },
  },
};
</script>

<style lang="scss">
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
  }
</style>
