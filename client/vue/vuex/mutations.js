import MutationsTypes from './mutation-types';

// mutations - handlers for changes that dispatched from actions
// reducer - YOU MUSTN'T RESET STATE LINK
export default {
  [MutationsTypes.SAVE_USER]: (state, user) => {
    state.name = user.name;
    state.role = user.role;
  },
  [MutationsTypes.SAVE_USER_INFO]: (state, user) => {
    state.name = user.name;
    state.role = user.role;
    state.token = user.token;
  },
  [MutationsTypes.CLEAR_USER]:  state => {
      state = {};
  },
};
