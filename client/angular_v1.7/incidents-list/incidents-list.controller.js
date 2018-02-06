import { isEqual } from 'lodash';
import { stateGo } from 'redux-ui-router';
import { importEntities, cancelImportEntities } from 'module-import/redux';
import { IMPORT_ENTITY_TYPE_INCIDENTS } from 'module-import/constants';
import { NEW_INCIDENT_ID } from 'module-incidents/constants/incidents-default.constant';
import { getIncidents, getExtraIncidents, getIncident, createIncident, closeIncidents } from '../../redux';
import incidentsListContainerSelector from './incidents-list.selector';

class IncidentsListController {
    constructor(
        $ngRedux, ModalService, incidentStatuses, incidentGroup, IncidentService, IncidentsGridService
    ) {
        this.gridOptions = {
            columnDefs: IncidentsGridService.columnDefs,
            data: this.incidents,
            multiSelect: true,
            noUnselect: false,
            onRegisterApi: gridApi => {
                this.gridApi = gridApi;
                this.gridApi.infiniteScroll.on.needLoadMoreData(null, this.needLoadMoreData.bind(this));
                this.gridApi.selection.on.rowSelectionChanged(null, row => this.onIncidentSelect(row.entity));
            }
        };

        this.ModalService = ModalService;
        this.incidentStatuses = incidentStatuses;
        this.incidentGroup = incidentGroup;
        this.IncidentService = IncidentService;

        this.incidentsGridPromise = null;

        this.disconnect = $ngRedux.connect(
            incidentsListContainerSelector,
            {
                stateGo,
                getIncidents,
                getIncident,
                createIncident,
                getExtraIncidents,
                closeIncidents,
                importEntities,
                cancelImportEntities
            }
        )(this.mergeToThis.bind(this));
    }

    handleCloseIncidents() {
        this.gridApi.selection.clearSelectedRows();
        this.stateGo('incidents.list', { selectedRows: null, incidentId: null });
        this.incidentsGridPromise = this.closeIncidents(this.selectedRows.map(incident => incident.id))
            .then(() => this.getIncidents())
            .finally(() => this.incidentsGridPromise = null);
    }

    $onDestroy() {
        this.disconnect();
    }

    needLoadMoreData() {
        const searchParams = this.searchParams;
        const offset = this.incidents.length;
        this.getExtraIncidents(searchParams, offset);
    }

    mergeToThis(nextState, actions) {
        Object.assign(this, actions);

        if (nextState.searchParams !== this.searchParams) {
            this.loadIncidents(nextState.searchParams);
        }
        if (!isEqual(nextState.incidents, this.incidents)) {
            this.handleChangeIncidents(nextState.incidents, nextState.incidents.length);
        }

        if (nextState.incidentId && (nextState.incidentId !== NEW_INCIDENT_ID) && (nextState.incidentId !== this.incidentId)) {
            this.getIncident(nextState.incidentId);
        }

        Object.assign(this, nextState);
    }

    /**
     * @description load incidents according to selected group
     * level = 0, id = 0  => all incidents
     * level = 1, id = id => subject incidents
     * level = 2, id = id => object incidents
     * level = 3, id = id => system incidents
     */
    loadIncidents(params) {
        const { id, level } = params;
        const currentLevel = id === this.incidentGroup.ROOT_GROUP_ID.toString() ? level : level + 1;

        this.incidentsGridPromise = this.getIncidents(id, currentLevel, params);
    }

    goToEdit(incidentId) {
        this.stateGo('incidents.edit', { incidentId });
    }

    onIncidentSelect(incident) {
        const selectedIncidents = this.gridApi.selection.getSelectedRows();
        const selectedSingleIncident = selectedIncidents.length === 1;
        this.stateGo(
            'incidents.list',
            {
                selectedRows: selectedIncidents,
                incidentId: selectedSingleIncident ? incident.id : null
            }
        );
    }

    handleChangeIncidents(incidents, total) {
        this.gridOptions.data = incidents.map(incident => ({
            ...incident,
            status: this.incidentStatuses.find(status => status.value === incident.status).key
        }));
        if (this.gridApi) {
            this.gridApi.infiniteScroll.dataLoaded(false, this.incidents.length < total);
        }
    }

    handleEditBtnClick() {
        this.goToEdit(this.selectedIncident.id);
    }

    handleImportBtnClick() {
        const parentController = this;

        this.ModalService.open(
            'importModal',
            ['entityType', 'fileUploadTarget', 'importEntities', 'cancelImportEntities'],
            {
                controller() {
                    this.entityType = IMPORT_ENTITY_TYPE_INCIDENTS;
                    this.fileUploadTarget = `/api/import/${this.entityType}/validate`;
                    this.importEntities = ids => parentController.handleEntitiesImport(ids);
                    this.cancelImportEntities = ids => parentController.cancelImportEntities(
                        IMPORT_ENTITY_TYPE_INCIDENTS,
                        ids
                    );
                },
                backdrop: 'static',
                keyboard: false
            }
        );
    }

    handleEntitiesImport(ids) {
        return this.importEntities(IMPORT_ENTITY_TYPE_INCIDENTS, ids);
    }
}

IncidentsListController.$inject = [
    '$ngRedux',
    'ModalService',
    'incidentStatuses',
    'incidentGroup',
    'IncidentService',
    'IncidentsGridService'
];

export default IncidentsListController;
