import _ from 'lodash';
import Base from 'components/base';

import './style';

//locale
import Locale from 'constants/locale';

// constants
import * as HeaderConstants from './constants';
import { PRODUCTION_SERVER_CONFIG } from 'config';
import { CONFIG_RESOURCES_PATH } from 'constants/common';
import ROUTES from 'constants/routes';

// navigator
import navigator from 'navigator';

// model
import model from 'model';

import * as HeaderHelpers from 'helpers/header';

// controllers
import DoorsController from 'controllers/doors';
import ModalsController from 'controllers/modals';

export default class Header extends Base {
    constructor () {
        super();

        this.selectedItem = null;
        this.headerList = null;
        this.itemsMap = {
            [HeaderConstants.HEADER_ITEM_IDS.INSIDE]: {
                navigate: navigator.navigateToInsidePage,
                class: HeaderConstants.HEADER_ITEM_CLASSES.INSIDE,
            }, [HeaderConstants.HEADER_ITEM_IDS.DOORS]: {
                navigate: navigator.navigateToDoorsPage,
                class: HeaderConstants.HEADER_ITEM_CLASSES.DOORS,
            }, [HeaderConstants.HEADER_ITEM_IDS.BID]: {
                navigate: navigator.navigateToBidPage,
                class: HeaderConstants.HEADER_ITEM_CLASSES.BID,
            }
        };

    }
    getTemplate () {
        return `
            <div class="constructor-header" id="${this.id}">
                <ul class="constructor-header-list" id="${HeaderConstants.HEADER_LIST_ID}">
                    <li class="constructor-header-item" id="${HeaderConstants.HEADER_ITEM_IDS.INSIDE}">
                        <div class="constructor-header-item-container">
                            <div class="constructor-header-item-step">
                                ${Locale.KEYS.HEADER_STEP_1}
                            </div>
                            <label class="constructor-header-item-title">
                                ${Locale.KEYS.HEADER_INSIDE_TITLE}
                            </label>
                        </div>
                    </li>
                    <li class="constructor-header-item" id="${HeaderConstants.HEADER_ITEM_IDS.DOORS}">
                        <div class="constructor-header-item-container">
                            <div class="constructor-header-item-step">
                                ${Locale.KEYS.HEADER_STEP_2}
                            </div>
                            <label class="constructor-header-item-title">
                                ${Locale.KEYS.HEADER_DOORS_TITLE}
                            </label>
                        </div>
                    </li>
                    <li class="constructor-header-item" id="${HeaderConstants.HEADER_ITEM_IDS.BID}">
                        <div class="constructor-header-item-container">
                            <div class="constructor-header-item-step">
                                ${Locale.KEYS.HEADER_STEP_3}
                            </div>
                            <label class="constructor-header-item-title">
                                ${Locale.KEYS.HEADER_BID_TITLE}
                            </label>
                        </div>
                    </li>
                </ul>
            </div>
        `;
    }

    postRender () {
        this.headerList = document.getElementById(HeaderConstants.HEADER_LIST_ID);
        const listItems = this.headerList.children;

        this.selectedItem = listItems[0]; // prevent fatal

        for (let i = 0; i < listItems.length; i++){
            listItems[i].addEventListener('click', this.onHeaderListItemClick.bind(this, listItems[i]));

            listItems[i].children[0].classList.add(this.itemsMap[listItems[i].id].class);
        }

        this.setSelectedItem(listItems[0]);
    }

    update (route) {
        const listItems = this.headerList.children;
        let item;

        switch (route) {
            case ROUTES.INSIDE: item = listItems[0]; break;
            case ROUTES.DOORS: item = listItems[1]; break;
            case ROUTES.BID: item = listItems[2]; break;
            default: break;
        }

        this.setSelectedItem(item);
    }

    // handlers
    setSelectedItem (item) {
        // unselect
        this.selectedItem.classList.remove(HeaderConstants.HEADER_SELECTED_CLASS);

        this.selectedItem = item;

        // select new
        this.selectedItem.classList.add(HeaderConstants.HEADER_SELECTED_CLASS);

        // mark all previous items as completed
        let shouldRemoveMark = false;

        _.forEach(this.headerList.children, child => {
            if (child === item) {
                shouldRemoveMark = true;
            }

            if (shouldRemoveMark) {
                child.classList.remove(HeaderConstants.HEADER_COMPLETED_CLASS);
                child.children[0].children[0].style.backgroundImage = '';
            } else {
                child.classList.add(HeaderConstants.HEADER_COMPLETED_CLASS);
                child.children[0].children[0].style.backgroundImage = 
                    `url("${PRODUCTION_SERVER_CONFIG.URL}/${CONFIG_RESOURCES_PATH}/${HeaderConstants.CHECK_ICON}")`;
            }
        });
    }

    navigateTo = (item) => {
        this.setSelectedItem(item);
        ModalsController.closeAllModals();
        this.itemsMap[item.id].navigate(true);
    }

    // handlers
    onHeaderListItemClick(item) {
        if(item.id === HeaderConstants.HEADER_ITEM_IDS.BID) {
            if(DoorsController.isSelectedMaterialForAllDoors()) {
                HeaderHelpers.changeStyleBidStep(true, true);
                this.navigateTo(item);
            } else {
                ModalsController.openConfirmationModal({
                    message: Locale.KEYS.CONFIRMATION_MODAL_CHOOSE_DOORS_MATERIAL
                });
            }
        } else {
            this.navigateTo(item);
        }
    }
}
