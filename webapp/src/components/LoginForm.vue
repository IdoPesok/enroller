<template>
  <div class="modal-card" style="width:auto">
    <header class="modal-card-head">
      <p class="modal-card-title">Login</p>
    </header>
    <section class="modal-card-body">
      <span class="has-text-danger" v-if="error">Unsuccessful logging in.</span>
      <b-field label="Email">
        <b-input
          type="email"
          v-model="email"
          placeholder="Your email"
          required
        ></b-input>
      </b-field>

      <b-field label="Password">
        <b-input
          type="password"
          v-model="password"
          password-reveal
          placeholder="Your password"
          required
        ></b-input>
      </b-field>
    </section>
    <footer class="modal-card-foot">
      <button class="button" type="button" v-on:click="close">Close</button>
      <button class="button is-primary" v-on:click="login">Login</button>
    </footer>
  </div>
</template>
<script>
export default {
  data: function() {
    return {
      email: "",
      password: "",
      error: false
    };
  },
  methods: {
    login: function() {
      this.error = false;
      this.$store
        .dispatch("login", { email: this.email, password: this.password })
        .then(
          () => {
            this.$emit("close");
          },
          () => {
            this.error = true;
          }
        );
    },
    close: function() {
      this.$emit("close");
    }
  }
};
</script>
