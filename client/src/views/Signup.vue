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
        v-on:click="handleSignup($event)"
      >
        Signup
      </button>
    </div>
    <span
      >Alreadt have an account?
      <router-link to="/login" class="underline cursor-pointer"
        >Login here</router-link
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
    handleSignup(e) {
      e.preventDefault();
      const url = `http://localhost:4300/user/new`;
      const body = { username: this.username, password: this.password };
      axios
        .post(url, body, {
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then((response) => {
          console.log(`User signed up`);
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
          console.log(`Error signing up user`);
          if (err.response.status === 401) {
            alert(
              "Oops! Username or password invalid. Please confirm everything is correct and try again."
            );
            return;
          }
          alert("Internal Server Error: " + err.response);
        });
    },
  },
};
</script>