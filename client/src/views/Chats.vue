<template>
  <div>
    <div v-if="isLoggedIn">
      <div
        v-for="[index, single] in chatsData.entries()"
        :key="index"
        v-on:click="$router.push(`/game/${single.game_id}`)"
      >
        <div
          class="flex flex-row my-3 mx-1 xl:mx-112 xl:mt-10 lg:mx-112 lg:mt-10 md:mx-32"
          v-if="single.opponent"
        >
          <div class="mr-0">
            <avatar :username="single.opponent" />
          </div>
          <div class="ml-5 w-full mt-2 flex flex-col">
            <div class="flex flex-row justify-between">
              <span
                class="font-bold sm:text-sm md:text-lg lg:text-lg xl:text-lg"
                >You vs
                {{
                  single.opponent.toLowerCase() ===
                  userInfo.username.toLowerCase()
                    ? single.host.username.charAt(0).toUpperCase() +
                      single.host.username.slice(1)
                    : single.opponent.charAt(0).toUpperCase() +
                      single.opponent.slice(1)
                }}</span
              >
              <span>{{ formatDate(single.updatedAt) || "" }}</span>
            </div>
            <span class="text-xs text-left" v-if="single.history.length !== 0">
              {{
                lastMessage(single.history).sender === userInfo.id
                  ? "You"
                  : single.opponent.charAt(0).toUpperCase() +
                    single.opponent.slice(1)
              }}: {{ lastMessage(single.history).text }}</span
            >
          </div>
        </div>
        <div class="border border-green-600 xl:mx-112 md:mx-32"></div>
      </div>
    </div>

    <div v-else>
      <div class="mt-56">
        <span
          >You need to login before you can use this app. Please
          <router-link to="/login" class="cursor-pointer underline">
            login</router-link
          >
          if you have an account or
          <router-link to="/signup" class="cursor-pointer underline"
            >go to signup</router-link
          >
          to create an account.</span
        >
      </div>
    </div>

    <div
      v-if="isLoggedIn && chatsData.length === 0"
      class="mt-56 mx-1 flex flex-col"
    >
      <span
        >Oops! You dont have any game yet. Click on the hamburger menu to get
        started with creating a new game.</span
      >
      <span class="my-3">
        Once your friend(s) accept your game request, you'd see them here
      </span>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Avatar from "vue-avatar";
import jwt from "jsonwebtoken";
import { isToday, format, formatRelative } from "date-fns";
import { parseISO } from "date-fns/fp";
const jwtSecret = `dkfji39f3qs20s@EIjieve\\edei392324cEHcw1$evodv`;

export default {
  data() {
    return {
      imgStyle: {
        width: "50px",
        height: "50px",
        "border-radius": "25px",
      },
      chatsData: [],
      isLoggedIn: false,
      token: "",
      userInfo: {},
    };
  },
  components: {
    Avatar,
  },
  methods: {
    init() {
      let token = this.$cookies.get("token");
      let userInfo = {};
      if (token) {
        try {
          userInfo = jwt.verify(token, jwtSecret);
        } catch (error) {
          this.$cookies.remove("token");
          this.isLoggedIn = false;
          this.$router.push("/login");
          return;
        }
        this.isLoggedIn = true;
        this.token = token;
        this.userInfo = userInfo;
        document.title = `20 questions game - ${userInfo.username} games`;
        this.fetchAllGames();
      }
    },

    fetchAllGames() {
      let url = `http://localhost:4300/user/me/games`;
      axios
        .get(url, {
          headers: {
            Authorization: `Bearer ${this.token}`,
            "Content-Type": "application/json",
          },
        })
        .then((response) => {
          this.chatsData = response.data.data.games.reverse();
        })
        .catch((err) => {
          if (err.response.status >= 500) {
            alert("Oops! Error gettin this here");
            return;
          }

          if (err.response.status === 403) {
            this.$cookies.remove("token");
            this.isLoggedIn = false;
            this.$router.push("/login");
          }
        });
    },
    formatDate(date) {
      try {
        let formattedDate = parseISO(date);
        let isWithinToday = isToday(formattedDate);
        if (isWithinToday) {
          return format(formattedDate, "HH:mm a");
        }
        return formatRelative(formattedDate, new Date());
      } catch (error) {
        // console.log(`Error formatting data`);
      }
    },
    lastMessage(array) {
      return array[array.length - 1];
    },
  },
  created() {
    this.init();
  },
  watch: {
    $route: "init",
  },
};
</script>
