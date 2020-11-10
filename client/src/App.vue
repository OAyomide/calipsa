<template>
  <div id="app">
    <div
      class="flex flex-row justify-between bg-green-700 text-white px-2 md:py-3 lg:px-112 xl:px-112 md:px-32"
    >
      <div class="flex flex-col">
        <span
          class="pt-2 font-bold uppercase text-xl cursor-pointer"
          v-on:click="$router.push('/chats')"
          >Gamify</span
        >
        <div v-if="isLoggedIn && mobileDropdown" class="w-full">
          <ul class="flex-col flex items-start mt-3">
            <li v-on:click="createNewGame">New game</li>
            <div class="border-2 border-black w-full"></div>
            <li v-on:click="handleLogout">Logout</li>
            <div class="border-2 border-black w-full"></div>
          </ul>
        </div>
      </div>

      <div class="block lg:hidden md:hidden">
        <button
          class="mt-2 font-medium text-black rounded px-3 pt-1"
          v-on:click="mobileDropdown = !mobileDropdown"
        >
          <img
            :src="loginIcon"
            alt=""
            class="h-5 w-5"
            v-if="!isLoggedIn"
            v-on:click="$router.push('/login')"
          />
          <img :src="menuIcon" alt="" class="h-5 w-5" v-else />
        </button>
      </div>

      <div class="block sm:hidden lg:flex md:flex">
        <div v-if="!isLoggedIn">
          <button
            class="mt-2 font-medium text-white rounded-full bg-gray-1100 px-6 border-2 border-solid"
            v-on:click="$router.push('/login')"
          >
            Login
          </button>
          <button
            class="mx-5 mt-2 font-medium text-white rounded-full bg-gray-1100 px-6 border-2 border-solid"
            v-on:click="$router.push('/signup')"
          >
            Sign up
          </button>
        </div>
        <div v-else>
          <button
            class="mt-2 font-medium text-white rounded-full bg-gray-1100 px-6 border-2 border-solid"
            v-on:click="createNewGame"
          >
            New Game
          </button>

          <button
            class="mx-5 mt-2 font-medium text-white rounded-full bg-gray-1100 px-6 border-2 border-solid"
            v-on:click="handleLogout"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
    <router-view />
  </div>
</template>

<script>
import axios from "axios";
import Copy from "copy-to-clipboard";
import jwt from "jsonwebtoken";
import loginIcon from "./assets/svg/login.svg";
import menuIcon from "./assets/svg/menu.svg";
const jwtSecret = `dkfji39f3qs20s@EIjieve\\edei392324cEHcw1$evodv`;
export default {
  data() {
    return {
      mobileDropdown: false,
      isLoggedIn: false,
      loginIcon,
      menuIcon,
      token: "",
    };
  },

  created() {
    this.init();
  },
  watch: {
    $route: "init",
  },
  methods: {
    init() {
      let token = this.$cookies.get("token");
      try {
        jwt.verify(token, jwtSecret);
        this.isLoggedIn = true;
        this.token = token;
      } catch (error) {
        this.isLoggedIn = false;
        this.$cookies.remove("token");
      }
    },
    createNewGame() {
      this.$dialog
        .prompt(
          {
            title: "Create new game",
            body: "What is the word to be guessed?",
          },
          {
            title: "Add name",
            body: "Whats the name?",
          }
        )
        .then((dialog) => {
          let url = `http://localhost:4300/game/new`;
          axios
            .post(
              url,
              { answer: dialog.data },
              {
                headers: {
                  Authorization: `Bearer ${this.token}`,
                  "Content-Type": "application/json",
                },
              }
            )
            .then((response) => {
              this.$toast.open(
                "New game created and invite link copied to clipboard."
              );
              Copy(
                `http://localhost:4200/game/${response.data.data.game_id}/join`
              );
            })
            .catch((err) => {
              if (err.response.status >= 500) {
                this.$toast.open(
                  "Oops! Could not create new game. Please try again."
                );
                return;
              }
              if (err.response.status === 404) {
                this.handleLogout();
                return;
              }
            });
        })
        .catch();
    },

    handleLogout() {
      this.$cookies.remove("token");
      this.isLoggedIn = false;
      this.$router.push("/login");
      return;
    },
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
