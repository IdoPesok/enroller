<template>
  <div id="app">
    <b-navbar class="nav">
      <template slot="brand">
        <router-link class="navbar-item" to="/" exact>ExampleApp</router-link>
      </template>
      <template slot="start">
        <router-link class="navbar-item" to="/" exact>Home</router-link>
        <router-link class="navbar-item" to="/about" exact>About</router-link>
      </template>
      <template slot="end">
        <div class="navbar-item">
          <button
            class="button is-primary"
            v-on:click="isLoginModalActive = true"
            v-if="!isLoggedIn"
          >
            Login
          </button>
          <button
            class="button is-primary"
            v-on:click="logout"
            v-if="isLoggedIn"
          >
            Logout
          </button>
        </div>
      </template>
    </b-navbar>
    <b-modal
      :active.sync="isLoginModalActive"
      has-modal-card
      :can-cancel="false"
    >
      <LoginForm v-on:close="isLoginModalActive = false" />
    </b-modal>
    <router-view />
  </div>
</template>

<script>
import LoginForm from "@/components/LoginForm.vue";
export default {
  components: { LoginForm },
  data: function() {
    return {
      isLoginModalActive: false
    };
  },
  computed: {
    isLoggedIn: function() {
      return this.$store.state.loginState.loggedIn;
    }
  },
  methods: {
    logout: function() {
      this.$store.dispatch("logout");
    }
  }
};
</script>

<style lang="scss">
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
.nav {
  a {
    font-weight: bold;
    color: #2c3e50;
    &.router-link-exact-active,
    &.router-link-active {
      color: #42b983;
    }
  }
}
</style>
