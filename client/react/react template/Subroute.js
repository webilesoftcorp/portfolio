import React from 'react';
import { Switch, Route } from 'react-router';
import injectSheet from 'react-jss';
import PropTypes from 'prop-types';

import styles from './styles';

import * as Routes from 'constants/routing';
import Header from 'components/Header';
// views
import Main from './Main';
import Dashboard from './Dashboard';
import Overview from './Overview';

import NotFound from 'pages/NotFound';

import pathMatch from 'helpers/path';

function MealPlans({ classes, match }) {
  const { root, header } = classes;
  const path = pathMatch(match);

  return (
    <div className={root}>
      <Header className={header}/>
      <Switch>
        <Route
          path={
            path(
              Routes.CREATE,
            )
          }
          component={() => <Dashboard newPlan={true}/>}
        />
        <Route
          path={
            path(
              Routes.MEAL_PLAN_ID,
            )
          }
          component={Dashboard}
        />
        <Route
          exact
          path={
            path(Routes.OVERVIEW)
          }
          component={Overview}
        />
        <Route
          exact
          path={
            path(Routes.HOME)
          }
          component={Main}
        />

        <Route path="*" component={NotFound} />
      </Switch>
    </div>
  );
}

export default injectSheet(styles)(MealPlans);

MealPlans.propTypes = {
  classes: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
};
