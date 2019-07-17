import Vue from "vue";
import Vuex from "vuex";
import createLogger from "vuex/dist/logger";

Vue.use(Vuex);

export default new Vuex.Store({
  plugins: [createLogger()],
  state: {
    gameStarted: true,
    gameEnded: false,
    playersJoined: 0,
    stack: new Array(),
    history: new Array(),
    turn: "black",
    priority: "black",
    health: {
      black: 3,
      white: 3
    },
    positions: {
      black: [0, 0],
      white: [6, 6]
    },
    hand: {
      black: new Array(),
      white: new Array()
    },
    frozen: {
      black: false;
      white: false
    }
  },
  getters: {},
  mutations: {
    startGame(state) {
      state.gameStarted = true;
    },

    endGame(state) {
      state.gameEnded = true;
    },

    updateStack(state, payload) {
      state.stack.unshift(payload);
    },

    updatePosition(state, payload) {
      state.position[payload.user] = payload.coordinates;
    },

    logHistory(state, payload) {
      state.history.unshift(payload);
    },

    toggle(state, property) {
      state[property] = toggle(state[property]);
    },

    attack(state, payload) {
      const user = toggle(payload.user);
      state.health[user] = state.health[user] - 1;
    },

    removeCardFromHand(state, payload) {
      const user = payload.user;
      state.hand[user] = state.hand[user].filter(
        card => card !== payload.name
      );
    },

    counterAttack(state, payload) {
      const user = toggle(payload.user);
      state.health[user] = state.health[user] - 1;
    },

    counterSpell(state) {
      state.stack.shift();
    },

    removeFrozen(state, payload) {
      state.frozen[payload.player] = false;
    },

    freeze(state, payload) {
      const user = toggle(payload.user);
      state.frozen[user] = true;
    },

    block(state, payload) {
      state.stack.shift();
    },

    teleport(state, payload) {},

    retreat(state, payload) {},

    stutter(state, payload) {},

    timeWarp(state, payload) {}
  },
  actions: {
    moveIntent({ commit }, payload) {
      const validMove = checkForValidMove(state, payload.coordinates);
      if (validMove) {
        commit("updateStack", payload);
        commit("toggle", "priority");
      }
    },

    attackIntent({ commit }, payload) {
      commit("updateStack", payload);
      commit("toggle", "priority");
    },

    playSpell({ commit }, payload) {
      commit("removeCardFromHand", payload);
      commit("updateStack", payload);
      commit("toggle", "priority");
    },

    resolveStack({ commit, dispatch, state }) {
      state.stack.forEach(actions => {
        commit(actions.name, actions);
      });

      dispatch("checkForWin");
    },

    checkForWin({ commit, state }) {
      let winners = ["black", "white"].filter(
        player => state[player].health <= 0
      );

      if (winners.length) {
        commit("endGame");
      }
    },

    pass({ commit }) {
      commit("toggle", "priority");
    }
  },
  modules: {
    black: Player("black", [0, 0], true),
    white: Player("white", [6, 6], false)
  }
});

function toggle(user) {
  return user === "black" ? "white" : "black";
}

function checkForValidMove(state, coordinates) {
  // Current position
  const c = state.position;

  // Requested position
  const r = coordinates;

  // Distance requested
  const d = [Math.abs(c[0] - r[0]), Math.abs(c[1] - r[1])];

  // Within the 7x7 grid
  const onBoard = r[0] <= 6 && r[1] <= 6 && (r[0] >= 0 && r[1] >= 0);

  // Not moving diagonal and not more than one space
  const validMove = (d[0] == 1 && d[1] == 0) || (d[0] == 0 && d[1] == 1);

  if (onBoard && validMove) {
    return true;
  }

  return false;
}
