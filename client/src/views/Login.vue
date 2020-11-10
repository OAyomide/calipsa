<template>
  <div>
    <div class="flex flex-col mt-32 md:mx-32 xl:mx-112 lg:mx-112">
      <input
        type="text"
        name=""
        id="username"
        placeholder="Enter your username "
        class="border-2 border-black my-5 mx-3 rounded px-1 py-1"
        v-model="username"
      />
      <input
        type="password"
        name=""
        id="password"
        placeholder="Enter your password"
        class="border-2 border-black mx-3 rounded px-1 py-1"
        v-model="password"
      />
      <button
        class="bg-black mx-3 my-3 py-1 rounded text-white"
        v-on:click="loginUser($event)"
      >
        Login
      </button>
    </div>
    <span
      >Dont't have an account?
      <router-link to="/signup" class="underline cursor-pointer"
        >Signup here</router-link
      >
    </span>
  </div>
</template>

<script>
import axios from "axios";
export default {
  data() {
    return {
      username: "",
      password: "",
    };
  },
  methods: {
    loginUser(e) {
      e.preventDefault();
      let url = `http://localhost:4300/user/login`;
      let body = { username: this.username, password: this.password };
      axios
        .post(url, body, { headers: { "Contenty-Type": "application/json" } })
        .then((response) => {
          this.$cookies.set(
            "token",
            response.data.data.token,
            new Date(Date.now() + 86400e3),
            "/",
            "",
            false
          );

          this.$router.push("/chats");
        })
        .catch((err) => {
          console.log(err);
          if (err.response.status >= 500) {
            this.$toast.open("An internal error occured. Please try again.");
            return;
          }
          if (err.response.status === 401) {
            this.$toast.open("Username or password incorrect");
            return;
          }
        });
    },
  },
};
</script>