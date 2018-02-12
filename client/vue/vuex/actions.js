import MutationsTypes from './mutation-types';
import UserService from './services';

// actions - module logic layer
// actions has access to services === http and state mutations
export default {
  async loadUser ({ commit, state, rootGetters }) {
    try {
      // rootGetters.token = app user token
      const user = await UserService.getUser();
      commit(MutationsTypes.SAVE_USER, user);
    } catch (error) {
      commit(MutationsTypes.SAVE_USER, { name: 'mock', role: 'manager' });
    }
  },

  refreshUser ({ commit, state, rootGetters }) {
    commit(MutationsTypes.SAVE_USER_INFO, { name: state.name + '1', role: 'manager', token: 'lohloh' });
  }
};
