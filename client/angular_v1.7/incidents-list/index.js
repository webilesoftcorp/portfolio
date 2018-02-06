import angular from 'angular';
import 'mosaic-deps';
import moduleImportModal from 'module-import/components/import-modal';
import modulePtFilters from 'components/pt-filters';
import moduleIncidentsGroupsTree from '../incidents-groups-tree';
import moduleIncidentsGrid from '../../components/incidents-grid';
import { incidentGroup } from '../../constants';
import IncidentsListController from './incidents-list.controller';

export default angular
    .module('pt.incidents.containers.incidentsList', [
        'mc.components.button',
        moduleImportModal,
        modulePtFilters,
        moduleIncidentsGroupsTree,
        moduleIncidentsGrid
    ])
    .component('incidentsListContainer', {
        template: require('./incidents-list.template.html'),
        controller: IncidentsListController
    })
    .constant('incidentGroup', incidentGroup)
    .name;
