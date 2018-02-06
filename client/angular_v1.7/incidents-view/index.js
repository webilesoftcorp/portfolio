import angular from 'angular';
import 'mosaic-deps';
import moduleCgBusy from 'config/cgBusy';

import moduleLocalization from 'config/localization';
import moduleIncidentsViewDetails from '../../components/incidents-view-details';
import IncidentsViewController from './incidents-view.controller';
import moduleIncidentsEditRecommendations from '../incidents-view-recommendations';
import moduleIncidentsViewLog from '../incident-view-log';

// view attack tabs
import moduleIncidentsViewGeneralInfo from '../../components/view/incidents-view-general-info';
import moduleIncidentsViewPhishingAttack from '../../components/view/incidents-view-phishing-attack';
import moduleIncidentsViewMalware from '../../components/view/incidents-view-malware';
import moduleIncidentsViewBruteForce from '../../components/view/incidents-view-brute-force';
import moduleIncidentsViewDdos from '../../components/view/incidents-view-ddos';
import moduleIncidentsViewControlCenter from '../../components/view/incidents-view-control-center';
import moduleIncidentsViewVulnerabilities from '../../components/view/incidents-view-vulnerabilities';
import moduleIncidentsViewMaliciousResource from '../../components/view/incidents-view-malicious-resource';
import moduleIncidentsViewContentChanges from '../../components/view/incidents-view-content-changes';
import moduleIncidentsViewSpam from '../../components/view/incidents-view-spam';
import moduleIncidentsViewProhibitedContent from '../../components/view/incidents-view-prohibited-content';
import moduleIncidentsViewTrafficHijackAttack from '../../components/view/incidents-view-traffick-hijack-attack';
import moduleIncidentsViewAttachments from '../../components/view/incidents-view-attachments';

export default angular
    .module('pt.incidents.containers.incidentsView', [
        'mc.components.button',
        'mc.components.list',
        moduleLocalization,
        moduleCgBusy,
        moduleIncidentsViewGeneralInfo,
        moduleIncidentsViewDetails,
        moduleIncidentsEditRecommendations,
        moduleIncidentsViewLog,
        moduleIncidentsViewPhishingAttack,
        moduleIncidentsViewMalware,
        moduleIncidentsViewBruteForce,
        moduleIncidentsViewDdos,
        moduleIncidentsViewControlCenter,
        moduleIncidentsViewVulnerabilities,
        moduleIncidentsViewContentChanges,
        moduleIncidentsViewSpam,
        moduleIncidentsViewProhibitedContent,
        moduleIncidentsViewTrafficHijackAttack,
        moduleIncidentsViewMaliciousResource,
        moduleIncidentsViewAttachments
    ])
    .component('incidentsViewContainer', {
        template: require('./incidents-view.template.html'),
        controller: IncidentsViewController
    })
    .name;
