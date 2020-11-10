<template>
  <div>
    <div class="mt-5 mb-16">
      <div v-for="[index, message] in messages.entries()" :key="index">
        <div class="clearfix text-left" v-if="message.sender !== userid">
          <div class="w-3/4">
            <div class="bg-gray-300 w-auto float-left mx-4 my-2 p-2 rounded-lg">
              <div
                class="text-black flex flex-col"
                v-if="!isOpponent && message.sender"
              >
                <span class="mx-2"
                  >{{ opponentName }} asked: "{{ message.text }}"
                </span>
                <div class="flex flex-row justify-between mx-2 my-2">
                  <button
                    class="text-center py-1 bg-blue-500 px-5 rounded-lg mr-2"
                    v-on:click="handleCallToActionButton('yes')"
                  >
                    Yes
                  </button>
                  <button
                    class="text-center py-1 bg-blue-500 px-5 rounded-lg"
                    v-on:click="handleCallToActionButton('no')"
                  >
                    No
                  </button>
                </div>
              </div>

              <div v-else>
                {{ message.text }}
              </div>
            </div>
          </div>
        </div>

        <div class="clearfix text-left" v-else>
          <div class="ml-10">
            <div
              class="bg-green-300 float-right w-auto mx-4 my-2 p-2 rounded-lg clearfix"
            >
              <div>
                {{ message.text }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      class="fixed w-full flex justify-between bg-green-100"
      style="bottom: 0px"
    >
      <textarea
        class="flex-grow m-2 py-2 px-4 mr-1 rounded-full border border-gray-300 bg-gray-200 resize-none"
        rows="1"
        placeholder="Message..."
        style="outline: none"
        v-model="chatMessage"
        @keypress="sendMessage($event)"
        :disabled="disableInput"
      ></textarea>
      <button
        class="m-2"
        style="outline: none"
        v-on:click="buttonSendMessage($event)"
      >
        <svg
          class="svg-inline--fa text-green-400 fa-paper-plane fa-w-16 w-12 h-12 py-2 mr-2"
          aria-hidden="true"
          focusable="false"
          data-prefix="fas"
          data-icon="paper-plane"
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
        >
          <path
            fill="currentColor"
            d="M476 3.2L12.5 270.6c-18.1 10.4-15.8 35.6 2.2 43.2L121 358.4l287.3-253.2c5.5-4.9 13.3 2.6 8.6 8.3L176 407v80.5c0 23.6 28.5 32.9 42.5 15.8L282 426l124.6 52.2c14.2 6 30.4-2.9 33-18.2l72-432C515 7.8 493.3-6.8 476 3.2z"
          />
        </svg>
      </button>
    </div>

    <div v-if="messages.length === 0 && !isOpponent" class="mt-56">
      <!-- <span v-if="hasEnded"
        >Game is over..
        {{ winner.charAt(0).toUpperCase() + winner.slice(1) }} won the
        game!</span
      > -->
      <span
        >You haven't played any game with this person. When they ask you a
        question, the game will start! 😉</span
      >
    </div>

    <div v-if="messages.length === 0 && isOpponent" class="mt-56">
      <!-- <span v-if="hasEnded">Game is over.. {{ winner }} won the game!</span> -->
      <span
        >Hey! you accepted the invite to play against {{ hostName }}! They are
        waiting for you to start the game. Ask them a question to get
        started!</span
      >
    </div>
  </div>
</template>

<script>
import io from "socket.io-client";
import jwt from "jsonwebtoken";
import axios from "axios";
const socket = io(`http://localhost:4300`);
const jwtSecret = `dkfji39f3qs20s@EIjieve\\edei392324cEHcw1$evodv`;
const serverURL = `http://localhost:4300`;

export default {
  data() {
    return {
      isNew: false,
      chatMessage: "",
      messages: [],
      disableInput: true,
      ready: false,
      username: "",
      userid: "",
      gameData: {},
      isOpponent: false,
      opponentName: "",
      hostName: "",
      correctAnswer: "",
      gameId: "",
      winner: "",
      hasEnded: false,
    };
  },
  methods: {
    sendMessage(e) {
      if (e.ctrlKey && e.code === "Enter") {
        if (!this.chatMessage) {
          return;
        }

        socket.emit("send-message", {
          sender: this.userid,
          text: this.chatMessage,
          gameid: this.$route.params.id,
          host: this.hostName,
          opponent: this.opponentName,
        });
        this.messages.push({
          sender: this.userid,
          text: this.chatMessage,
          type: "text",
        });
        this.chatMessage = "";
        return;
      }
    },
    buttonSendMessage() {
      if (!this.chatMessage) {
        return;
      }
      this.messages.push({
        sender: this.userid,
        text: this.chatMessagem,
        type: "text",
      });
      this.chatMessage = "";
      return;
    },
    connectToSocket() {
      socket.emit("create-game-room", this.gameId);
    },
    addPlayer() {
      this.ready = true;
      socket.emit("join-game", this.username);
    },

    getUser() {
      let token = this.$cookies.get("token");
      if (token) {
        try {
          let f = jwt.verify(token, jwtSecret);
          this.username = f.username;
          this.userid = f.id;
          this.gameId = this.$route.params.id;
          document.title = `20 questions game - Game`;
        } catch (error) {
          console.log(`Error verifying token`);
          console.log(error);
        }
      }
    },
    fetchGame() {
      let token = this.$cookies.get("token");

      let url = `${serverURL}/game/${this.$route.params.id}`;
      axios
        .get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
        .then((response) => {
          let base = response.data.data;
          this.gameData = base;
          this.messages = base.history;
          if (base.opponent === this.username) {
            this.disableInput = false;
            this.isOpponent = true;
          }
          this.hostName =
            base.host.username.charAt(0).toUpperCase() +
            base.host.username.slice(1);
          this.opponentName =
            base.opponent.charAt(0).toUpperCase() + base.opponent.slice(1);

          if (base.winner) {
            this.hasEnded = true;
            this.disableInput = true;
            this.winner = base.winner;
            this.messages.push({
              sender: "",
              text: `The game has ended and ${
                base.winner.charAt(0).toUpperCase() + base.winner.slice(1)
              } won the game.`,
            });
          }
        })
        .catch((err) => {
          if (err.response && err.response.status === 403) {
            this.$cookies.remove("token");
            this.$router.push(`/login`);
          }
        });
    },

    listenForMessage() {
      socket.on("send-message", (data) => {
        this.messages.push(data);
      });

      socket.on("disconnect", () => {
        socket.removeAllListeners();
      });

      socket.on("game-finished", (data) => {
        this.disableInput = true;
        this.hasEnded = true;
        this.winner = data.winner;
        this.messages.push({
          sender: "",
          text: `The game has ended and ${
            data.winner.charAt(0).toUpperCase() + data.winner.slice(1)
          } won!`,
          type: "cta",
        });
      });
    },

    handleCallToActionButton(text) {
      this.messages.push({ sender: this.userid, text, type: "cta" });
      this.correctAnswer = text;
      socket.emit("send-message", {
        sender: this.userid,
        text,
        gameid: this.$route.params.id,
        host: this.hostName,
        opponent: this.opponentName,
      });
    },

    init() {
      this.getUser();
      this.fetchGame();
      this.connectToSocket();
      this.addPlayer();
      this.listenForMessage();
    },
  },

  watch: {
    $router: "init",
  },

  created() {
    this.init();
  },
};
</script>