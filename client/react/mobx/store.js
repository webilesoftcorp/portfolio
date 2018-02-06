import { observable, action }  from 'mobx';

const looksStore = observable({
  isLoading: false,

  looks: [],

  startLoading: action(() => {
    looksStore.isLoading = true;
  }),

  stopLoading: action(() => {
    looksStore.isLoading = false;
  }),

  saveLooks: action(looks => {
    looksStore.looks = looks;
  }),

  clearLooks: action(() => {
    looksStore.looks = [];
  })
});

export default looksStore;
