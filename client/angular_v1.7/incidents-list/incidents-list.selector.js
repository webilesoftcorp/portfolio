import { createSelector } from 'reselect';
import { routerCurrentParamSelector } from 'module-app/redux';
import {
    incidentsGroupGridSelector, currentIncidentIdSelector, currentIncidentSelector, isIncidentEditableSelector
} from '../../redux';

const incidentsListSearchParamsSelector = createSelector(
    [routerCurrentParamSelector('id'), routerCurrentParamSelector('level')],
    (id, level) => ({
        id,
        level
    })
);

const incidentsListSelectedRowsSelector = createSelector(
    [routerCurrentParamSelector('selectedRows')],
    rows => rows
);

const isIncidentsDeactivatableSelector = createSelector(
    [incidentsListSelectedRowsSelector],
    (selectedRows = []) => {
        return !selectedRows.length
            || !!selectedRows.find(incident => incident.status !== 'INCIDENT_STATUS_OPEN_TITLE'
                || incident.syncStatus !== 'synchronized');
    }
);
export default createSelector(
    [
        incidentsGroupGridSelector, incidentsListSearchParamsSelector, currentIncidentIdSelector,
        currentIncidentSelector, isIncidentEditableSelector, incidentsListSelectedRowsSelector,
        isIncidentsDeactivatableSelector
    ],
    (incidents, searchParams, incidentId, currentIncident, isIncidentEditable, selectedRows, isIncidentsDeactivatable) => ({
        incidents,
        searchParams,
        incidentId,
        selectedIncident: currentIncident,
        isIncidentEditable,
        isIncidentsDeactivatable,
        selectedRows
    })
);
