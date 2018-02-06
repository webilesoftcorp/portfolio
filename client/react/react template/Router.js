import React from 'react';
import { Switch, Route } from 'react-router';

import * as Routes from '../constants/routing';

// views
import Home from 'pages/Home';
import Authenticate from 'pages/Authenticate';
import Dashboard from 'pages/Dashboard';
import Vacations from 'pages/Vacations';
import Requests from 'pages/Requests';
import Profile from 'pages/Profile';
import Reset from 'pages/Reset';
import Activate from 'pages/Activate';
import CheckEmail from 'pages/CheckEmail';

import NotFound from 'pages/NotFound';

const Router = () => (
  <Switch>
    <Route exact path={Routes.HOME} component={Home} />
    <Route exact path={Routes.AUTHENTICATE} component={Authenticate} />
    <Route exact path={Routes.DASHBOARD} component={Dashboard} />
    <Route exact path={Routes.VACATIONS} component={Vacations} />
    <Route exact path={Routes.REQUESTS} component={Requests} />
    <Route exact path={Routes.PROFILE} component={Profile} />

    <Route exact path={Routes.RESET} component={Reset} />
    <Route exact path={Routes.ACTIVATE} component={Activate} />
    <Route exact path={Routes.CHECK_EMAIL} component={CheckEmail} />
    <Route path="*" component={NotFound} />
  </Switch>
);

export default Router;
