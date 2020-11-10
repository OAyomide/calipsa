<template>
  <span>{{ loadingText }}</span>
</template>

<script>
import axios from "axios";
export default {
  data() {
    return {
      loadingText: "Loading",
    };
  },
  created() {
    this.acceptInvite();
  },
  watch: {
    $router: "acceptInvite",
  },
  methods: {
    acceptInvite() {
      let url = `http://localhost:4300/game/invite/${this.$route.params.gameid}`;
      let token = this.$cookies.get("token");
      axios
        .put(
          url,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        )
        .then(() => {
          this.$router.push(`/game/${this.$route.params.gameid}`);
        })
        .catch((err) => {
          console.log(err);
          if (err.response.status === 403) {
            this.$toast.open(
              `You're not signed in and cannot join this game. Please try again`
            );
            this.loadingText = "Please log in to join this game.";
            return;
          }
          this.$toast.open(
            "Oops! An error occured and could not join game. Please try again"
          );
        });
    },
  },
};
</script>