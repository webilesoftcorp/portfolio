import log from 'log';

import model from 'model';
import renderer from 'renderer';
import _ from 'lodash';

// constants
import ModalTypes from 'constants/modal_types';

// modals
import InstructionModal from 'components/modals/instruction';
import TwoOptionsMOdal from 'components/modals/two_options';
import ConfirmationModal from 'components/modals/confirmation_modal';
import DoorsModificationModal from 'components/modals/doors_modification';

// helpers
import * as ModalsHelpers from 'helpers/modals';

class ModalsController {
    openModal(modal) {
        log.debug(`ModalsController.openModal: type = ${modal.type}, options = ${JSON.stringify(modal.options)}`);

        model.addModal(modal);
        renderer.update(renderer.component.children.modalContainer, { modals: model.getModals() });
    }

    closeLastModal() {
        model.removeLastModal();
        renderer.update(renderer.component.children.modalContainer, { modals: model.getModals() });
    }

    closeAllModals() {
        model.removeAllModals();
        renderer.update(renderer.component.children.modalContainer, { modals: model.getModals() });
    }

    // specific methods
    openInstructionModal(options = {}) {
        const type = ModalTypes.INSTRUCTION_MODAL;

        if (!ModalsHelpers.modalIsOpened(model.getModals(), type)) {
            this.openModal({ constructor: InstructionModal, options, type });
        } else {
            log.debug('ModalsController.openInstructionModal: prevent unnecessary modal opening.');
        }
    }

    openTwoOptionsModal(options = {}) {
        const type = ModalTypes.TWO_OPTIONS;

        if (!ModalsHelpers.modalIsOpened(model.getModals(), type)) {
            this.openModal({
                constructor: TwoOptionsMOdal,
                options,
                type
            });
        } else {
            log.warn('ModalsController.openTwoOptionsModal: prevent unnecessary modal opening.');
        }
    }

    openConfirmationModal(options = {}) {
        const type = ModalTypes.CONFIRMATION_MODAL;

        if (!ModalsHelpers.modalIsOpened(model.getModals(), type)) {
            this.openModal({
                constructor: ConfirmationModal,
                options,
                type
            });
        } else {
            log.warn('ModalsController.openConfirmationModal: prevent unnecessary modal opening.');
        }
    }

    openDoorsModificationModal (options = {}) {
        const type = ModalTypes.DOORS_MODIFICATION_MODAL

        if (!ModalsHelpers.modalIsOpened(model.getModals(), type)) {
            this.openModal({
                constructor: DoorsModificationModal,
                options,
                type
            });
        } else {
            log.warn('ModalsController.openDoorsModificationModal: prevent unnecessary modal opening.');
        }
    }

}

export default new ModalsController();