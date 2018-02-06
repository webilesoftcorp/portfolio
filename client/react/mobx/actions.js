import * as API from './api';

import looksStore from './store';

import * as Formatters from './formatters';

export const loadLooks = async () => {
  let response;

  looksStore.startLoading();

  try {
    response = await API.getLooks();
  } catch(error) {
    looksStore.stopLoading();
    console.error(error);
    return error;
  }
  const { success, data } = response;

  console.debug(response);

  if (success && data.looks) {
    const looks = Formatters.formatLooks(data.looks);
    looksStore.saveLooks(looks);
    return looks;
  }

  looksStore.stopLoading();
  return response;
};

export const loadLook = async id => {
  let response;

  looksStore.startLoading();

  try {
    response = await API.getLook(id);
  } catch(error) {
    looksStore.stopLoading();
    console.error(error);
    return error;
  }
  const { success, data } = response;

  console.debug(response);

  if (!success || !data.look) {
    return response;
  }

  const look = data.look;

  try {
    response = await loadLooks();
  } catch(error) {
    console.error(error);
    return error;
  }

  looksStore.stopLoading();
  return Formatters.formatLook(look);
};

export const createLook = async look => {
  let response;

  looksStore.startLoading();

  try {
    response = await API.createLook(look);
  } catch(error) {
    looksStore.stopLoading();
    console.error(error);
  }
  const { success, data } = response;

  console.debug(response);

  if (!success || !data.look) {
    return response;
  }

  const result = Formatters.formatLook(data.look);

  try {
    response = await loadLooks();
  } catch(error) {
    console.error(error);
    return error;
  }

  looksStore.stopLoading();
  return result;
};

export const updateLook = async (id, look) => {
  let response;

  looksStore.startLoading();

  try {
    response = await API.updateLook(id, look);
  } catch(error) {
    looksStore.stopLoading();
    console.error(error);
  }
  const { success, data } = response;

  console.debug(response);

  if (!success || !data.look) {
    return response;
  }

  // TODO: update accroding to server API
  const result = Formatters.formatLook(data.look);

  try {
    response = await loadLooks();
  } catch(error) {
    console.error(error);
    return error;
  }

  looksStore.stopLoading();
  return result;
};

export const deleteLook = async id => {
  let response;

  looksStore.startLoading();

  try {
    response = await API.deleteLook(id);
  } catch(error) {
    looksStore.stopLoading();
    console.error(error);
  }
  const { success } = response;

  console.debug(response);

  if (!success) {
    return response;
  }

  try {
    response = await loadLooks();
  } catch(error) {
    console.error(error);
    return error;
  }

  looksStore.stopLoading();
  return response;
};

export const addItemToLook = async (id, item) => {
  let response;

  looksStore.startLoading();

  try {
    response = await API.addItemToLook(id, item);
  } catch(error) {
    looksStore.stopLoading();
    console.error(error);
  }
  const { success } = response;

  console.debug(response);

  if (!success) {
    return response;
  }

  try {
    response = await loadLooks();
  } catch(error) {
    console.error(error);
    return error;
  }

  looksStore.stopLoading();
  return response;
};


export const deleteItemFromLook = async (id, itemId) => {
  let response;

  looksStore.startLoading();

  try {
    response = await API.deleteItemFromLook(id, itemId);
  } catch(error) {
    looksStore.stopLoading();
    console.error(error);
  }
  const { success } = response;

  console.debug(response);

  if (!success) {
    return response;
  }

  try {
    response = await loadLooks();
  } catch(error) {
    console.error(error);
    return error;
  }

  looksStore.stopLoading();
  return response;
};
