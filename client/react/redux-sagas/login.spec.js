import { put, call } from 'redux-saga/effects';

// saga
import { loginWorker } from 'middleware/employer/login';

// action creators
import {
  loginEmployer,
  loginEmployerSuccess,
  loginEmployerFailure,
} from 'action-creators/employer/login';
import { startLoading, finishLoading } from 'action-creators';

// constants
import { ROLE_TYPES } from 'constants/cookie';

// utils
import { post } from 'utils/request';

const TEST_USER = {
  companyImage: 'https://s3.amazonaws.com/re-hire/1516278914277',
  companyIndustry: '',
  companyInfo: 'Info',
  companyName: 'Name',
  email: 'bam@gmail.com',
  firstName: 'Bam',
  id: '225334ff-f7fb-437a-8eef-14a6308b7213',
  lastName: 'Test',
  location: 'Aberaeron',
  profileImage: 'https://s3.amazonaws.com/re-hire/1516278914277',
  remainingPosts: 0,
  subscription: 'None?',
};

describe('employer login', () => {
  const testAction = {
    email: 'bam@gmail.com',
    password: 'password',
  };
  const action = loginEmployer(testAction);

  it('loginWorker should put start loading', () => {
    const generator = loginWorker(action);

    const loginWorkerLoading = generator.next().value;
    expect(loginWorkerLoading).toEqual(put(startLoading()));
  });

  it('loginWorker should call employer login with', () => {
    const generator = loginWorker(action);
    generator.next().value;

    const callPostRequest = generator.next().value;
    expect(callPostRequest).toEqual(call(post, '/employer/login', testAction));
  });

  it("loginWorker should fail if user didn't come from server", () => {
    const generator = loginWorker(action);
    generator.next().value;
    generator.next().value;

    const serverResponse = {
      token: 'xxx',
    };
    const postRequest = generator.next(serverResponse).value;
    expect(postRequest).toEqual(put(loginEmployerFailure()));
  });

  it("loginWorker should fail if server didn't return token", () => {
    const generator = loginWorker(action);
    generator.next().value;
    generator.next().value;

    const serverResponse = {
      user: TEST_USER,
    };
    const postRequest = generator.next(serverResponse).value;
    expect(postRequest).toEqual(put(loginEmployerFailure()));
  });

  it('loginWorker should put success if all comes from server', () => {
    const generator = loginWorker(action);
    generator.next().value;
    generator.next().value;

    const serverResponse = {
      user: TEST_USER,
      token: 'xxx',
    };
    const postRequest = generator.next(serverResponse).value;
    expect(postRequest.ALL[0]).toEqual(
      put(loginEmployerSuccess({ role: ROLE_TYPES.EMPLOYER, user: TEST_USER })),
    );
  });

  it('loginWorker should put finish loading', () => {
    const generator = loginWorker(action);
    generator.next().value;
    generator.next().value;
    generator.next().value;

    const loadingFinish = generator.next().value;
    expect(loadingFinish).toEqual(put(finishLoading()));
  });
});
