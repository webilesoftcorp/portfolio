import { LOCATION_CHANGE } from 'react-router-redux';
import { takeEvery, cancel, call, fork, take } from 'redux-saga/effects';
import { matchPath } from 'react-router';

// constants
import * as Routes from 'constants/routing';

// view sagas
import home from './home';
import reset from './reset';
import authenticate from './authenticate';
import activate from './activate';
import checkEmail from './checkEmail';

// init hook
import initialize from '../initialize';

const viewSagas = {
  [Routes.HOME]: home,
  [Routes.RESET]: reset,
  [Routes.AUTHENTICATE]: authenticate,
  [Routes.ACTIVATE]: activate,
  [Routes.CHECK_EMAIL]: checkEmail,
};

let task = null;

function* onchange(action) {
  const {
    hash,
    pathname,
    search,
  } = action.payload;

  if (task) {
    yield cancel(task);
  }

  let saga;

  Object.keys(viewSagas).forEach(route => {
    let match = matchPath(pathname, {
      path: route,
    });
    if (match) {
      saga = viewSagas[route];
    }
  });

  if (saga) {
    task = yield fork(saga, search, hash);
  }
}

export default function* routerSaga() {
  const action = yield take(LOCATION_CHANGE);

  yield call(initialize);
  yield* onchange(action);

  yield takeEvery(LOCATION_CHANGE, onchange);
}
