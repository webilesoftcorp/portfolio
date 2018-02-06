import { takeEvery, call, put, all } from 'redux-saga/effects';

import { LOGIN_EMPLOYER } from '../../constants/actions';
import { post } from '../../utils/request';
import history from '../../utils/history';
import { set as setCookie } from '../../utils/cookie';
import {
  TOKEN_COOKIE_NAME,
  ROLE_COOKIE_NAME,
  ROLE_TYPES,
} from '../../constants/cookie';
import { startLoading, finishLoading } from 'action-creators';
import {
  loginEmployerFailure,
  loginEmployerSuccess,
} from 'action-creators/employer/login';

const SUCCESS_PATHNAME = '/employer/candidates';

export function* loginWorker({ payload }) {
  try {
    yield put(startLoading());
    const response = yield call(post, '/employer/login', payload);

    const { user, token, errors } = response;
    if (!user || !token || (errors && errors.length)) throw errors && errors[0];

    setCookie(TOKEN_COOKIE_NAME, token);
    setCookie(ROLE_COOKIE_NAME, ROLE_TYPES.EMPLOYER);
    yield all([
      put(loginEmployerSuccess({ user, role: ROLE_TYPES.EMPLOYER })),
      call(history.push, SUCCESS_PATHNAME),
    ]);
  } catch (err) {
    yield put(loginEmployerFailure(err));
  }
  yield put(finishLoading());
}

export default function* loginWatcher() {
  yield takeEvery(LOGIN_EMPLOYER, loginWorker);
}
