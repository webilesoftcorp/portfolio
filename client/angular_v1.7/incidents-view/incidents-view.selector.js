import { createSelector } from 'reselect';
import {
    currentIncidentIdSelector, currentIncidentSelector, isIncidentEditableSelector
} from '../../redux';

export default createSelector(
    [currentIncidentIdSelector, currentIncidentSelector, isIncidentEditableSelector],
    (incidentId, incident, isIncidentEditable) => ({
        incidentId,
        incident,
        isIncidentEditable
    })
);
