// access to state props should be organized via getters === selectors

export default {
  name: state => state.name,
  role: state => state.role,
  token: state => state.token,
};
