import { head, get, isEqual } from 'lodash';
import { stateGo } from 'redux-ui-router';
import incidentsViewContainerSelector from './incidents-view.selector';

class IncidentsViewController {
    constructor(
        $ngRedux, $filter,
        incidentsDdosAttackTypes, incidentsSignatureFields, incidentsTabList, incidentsExtendedTabList, incidentsAttackTypes, incidentsAttacks, incidentStatuses, incidentsMalwareSourcesFieldset
    ) {

        const translate = $filter('translate');
        this.incidentUnknownAttack = translate('INCIDENT_UNKNOWN_ATTACK');
        const translateIteratee = ({ key, id }) => ({ name: translate(key), id });

        this.disconnect = $ngRedux.connect(
            incidentsViewContainerSelector,
            { stateGo }
        )(this);

        this.incidentsAttacks = incidentsAttacks;
        this.incidentsSignatureFields = incidentsSignatureFields;
        this.incidentsTabList = incidentsTabList.concat(incidentsExtendedTabList).map(translateIteratee);
        this.incidentsDdosAttackTypes = incidentsDdosAttackTypes;
        this.incidentsAttackTypes = incidentsAttackTypes.map(item => ({
            ...translateIteratee(item),
            description: translate(item.key)
        }));
        this.incidentStatuses = incidentStatuses.map(status => ({
            ...status,
            key: translate(status.key)
        }));
        this.incidentsConstantsMap = new Map(this.incidentStatuses.map(({ value }) => ([value, value])));

        this.incidentsMalwareSourcesFieldset = incidentsMalwareSourcesFieldset;

        this._tabList = [];
        this.selectedTab = [];

        this._attacksList = [];
        this.attacksListOptions = {
            idField: 'index',
            groupBy: this.getAttackGroup.bind(this)
        };

        this.attackTypesMap = new Map();
    }

    $onInit() {
        this.activeTab = head(this.tabList);

        this.createAttackTypesMap();
    }

    $onDestroy() {
        this.disconnect();
    }

    createAttackTypesMap() {
        this.attackTypesMap
            .set(this.incidentsAttacks.PHISHING_ATTACK_ID, {
                field: 'phishingAttacks',
                // "Фишинг" - Адрес пострадавшей системы (ip или domain)
                getName: attack => attack.target.ip || attack.target.domain || this.incidentUnknownAttack
            })
            .set(this.incidentsAttacks.MALWARE_ID, {
                field: 'malwares',
                // "Вредоносное программное обеспечение" (ВПО) - Внешний IP-адрес зараженного узла
                getName: attack => attack.target.ip || this.incidentUnknownAttack
            })
            .set(this.incidentsAttacks.BRUTE_FORCE_ID, {
                field: 'bruteforces',
                // "Перебор паролей" - Адрес пострадавшей информациионной системы (ip или url)
                getName: attack => attack.target.ip || attack.target.url || this.incidentUnknownAttack
            })
            .set(this.incidentsAttacks.DDOS_ID, {
                field: 'ddosAttacks',
                // "DoS/DdoS" - Адрес пострадавшей информациионной системы (ip или domain или url или network)
                getName: attack => attack.target.ip || attack.target.domain || attack.target.url || attack.target.network || this.incidentUnknownAttack
            })
            .set(this.incidentsAttacks.CONTROL_CENTER_ID, {
                field: 'botnets',
                // "ЦУ бот-сети" - Адрес пострадавшей системы (ip или url)
                getName: attack => attack.target.ip || attack.target.url || this.incidentUnknownAttack
            })
            .set(this.incidentsAttacks.VULNERABILITIES_ID, {
                field: 'vulnerabilities',
                // "Эксплуатация уязвимостей" - Внешний адрес пострадавшей ЭВМ (ip, если нет то domain, если нет то url)
                getName: attack => attack.target.ip || attack.target.domain || attack.target.url || this.incidentUnknownAttack
            })
            .set(this.incidentsAttacks.MALICIOUS_RESOURCE_ID, {
                field: 'maliciousResources',
                // "Вредоносный ресурс" - Адрес пострадавшей системы (ip или url)
                getName: attack => attack.target.ip || attack.target.url || this.incidentUnknownAttack
            })
            .set(this.incidentsAttacks.CONTENT_CHANGE_ID, {
                field: 'contentChanges',
                // "Изменение контента" - Адрес пострадавшей системы (ip или url)
                getName: attack => attack.target.ip || attack.target.url || this.incidentUnknownAttack
            })
            .set(this.incidentsAttacks.SPAM_ID, {
                field: 'spams',
                // "Спам" - первая пара ip-domain из коллекции источники рассылки спама
                getName: attack => {
                    if (attack.sources.length) {
                        if (attack.sources[0].ip && attack.sources[0].domain) {
                            return `${attack.sources[0].ip} - ${attack.sources[0].domain}`
                        }
                        if (attack.sources[0].ip) {
                            return attack.sources[0].ip
                        }
                        if (attack.sources[0].domain) {
                            return attack.sources[0].domain
                        }
                    }
                    return this.incidentUnknownAttack
                }
            })
            .set(this.incidentsAttacks.PROHIBITED_CONTENT_ID, {
                field: 'prohibitedContents',
                // "Запрещенный контент" - Адрес пострадавшей системы (ip или url)
                getName: attack => attack.target.ip || attack.target.url || this.incidentUnknownAttack
            })
            .set(this.incidentsAttacks.TRAFFIC_HIJACK_ATTACK_ID, {
                field: 'trafficHijackAttacks',
                // "Атака на трафик" - Штатный prefix
                getName: attack => attack.legalPrefix || this.incidentUnknownAttack
            });
    }


    // list of attacks helpers
    getAttackGroup(attack) {
        return this.incidentsAttackTypes.find(({ id }) => id === attack.id).description;
    }

    get incidentStatus() {
        const { incidentStatuses, incident } = this;

        const status = incidentStatuses.find(status => status.value === incident.status);
        return get(status, 'key');
    }

    get attacksList() {
        const { incident } = this;
        let index = 0;
        const attacksList = [];

        this.attackTypesMap.forEach((attackType, id) =>
            incident.impact[attackType.field].forEach((attack, baseIndex) => {
                attacksList.push({
                    id,
                    name: attackType.getName(attack),
                    baseIndex,
                    index: index++
                });
            })
        );

        if (!isEqual(attacksList, this._attacksList)) {
            this._attacksList = attacksList;
        }

        return this._attacksList;
    }

    get currentAttack() {
        const { activeTab } = this;
        const attackType = this.attackTypesMap.get(activeTab.id) || {};
        const incidentField = this.incident.impact[attackType.field] || {};

        return incidentField[activeTab.baseIndex];
    }
    // end of attacks list helper

    get tabList() {
        const tabList = this.incidentsTabList;

        // ToDo: при просмотре это не требуется, т.к. нет добавления табов
        if (!isEqual(tabList, this._tabList)) {
            this._tabList = tabList;
        }
        return this._tabList;
    }

    get activeTab() {
        return head(this.selectedTab);
    }

    set activeTab(value) {
        this.selectedTab = [value];
    }

    handleEditBtnClick() {
        this.stateGo('incidents.edit', { incidentId: this.incident.id });
    }

    getBaseURL() {
        return this.incidentsAttachmentsBaseURL;
    }
}

IncidentsViewController.$inject = [
    '$ngRedux',
    '$filter',
    'incidentsDdosAttackTypes',
    'incidentsSignatureFields',
    'incidentsTabList',
    'incidentsExtendedTabList',
    'incidentsAttackTypes',
    'incidentsAttacks',
    'incidentStatuses',
    'incidentsMalwareSourcesFieldset'
];

export default IncidentsViewController;
