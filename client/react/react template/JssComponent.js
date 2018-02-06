import React, { Component } from 'react';
import PropTypes from 'prop-types';
import injectSheet from 'react-jss';

import styles from './styles';

import Header from './Header';
import Board from './Board';

import { NEW_PLANS_BOAD_DATA } from 'constants/widgets/mealPlansDashboard';

@injectSheet(styles)
export default class Dashboard extends Component {
  static propTypes = {
    newPlan: PropTypes.bool,
    classes: PropTypes.object.isRequired,
    openMealPlansModal: PropTypes.func.isRequired,
    openCreateMealPlanModal: PropTypes.func.isRequired,
    openConfirmationModal: PropTypes.func.isRequired,
    openMealDetailsModal: PropTypes.func.isRequired,
    saveMealPlan: PropTypes.func.isRequired,
    saveMealDay: PropTypes.func.isRequired,
    loadMealDetails: PropTypes.func.isRequired,
    saveCurrentDayData: PropTypes.func.isRequired,
    saveCurrentDayNumber: PropTypes.func.isRequired,
    boardData: PropTypes.object.isRequired,
    dayCount: PropTypes.number.isRequired,
  };

  static defaultProps = {
    newPlan: false,
  };

  state = {
    selectedDay: 0,
  };

  boardData = null;

  handleChangeDay = (event, value) => {
    this.props.saveCurrentDayData({
      data: this.boardData,
      dayNumber: this.state.selectedDay,
      id: this.boardData.id,
    });
    this.setState({
      selectedDay: value,
    });
  };

  handleSaveDay = () => {
    this.props.saveCurrentDayData({
      data: this.boardData,
      dayNumber: this.state.selectedDay,
      id: this.boardData.id,
    });
    this.props.newPlan ?
      this.props.openCreateMealPlanModal(this.boardData) :
      this.props.saveMealDay();
  };

  componentWillMount = () => {
    if (!this.props.newPlan) {
      const {match, requestMealPlanDetails} = this.props;
      requestMealPlanDetails(match.params.mealPlanId);
    }
  };

  render() {
    const {
      classes,
      openMealPlansModal,
      openConfirmationModal,
      openMealDetailsModal,
      boardData,
      dayCount,
      newPlan,
      loadMealDetails,
    } = this.props;
    return (
      <div className={classes.root}>
        <Header
          currentDay={this.state.selectedDay}
          onSaveClick={this.handleSaveDay}
          changeDay={this.handleChangeDay}
          day={dayCount}
        />
        <Board
          dayNumber={this.state.selectedDay}
          dayDataSave={data => this.boardData = data}
          openMealPlansModal={openMealPlansModal}
          loadMealDetails={loadMealDetails}
          openMealDetailsModal={openMealDetailsModal}
          openConfirmationModal={openConfirmationModal}
          data={newPlan ? NEW_PLANS_BOAD_DATA : boardData.get(this.state.selectedDay)}
        />
      </div>
    );
  }
}
