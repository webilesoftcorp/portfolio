import _ from 'lodash';
import { fabric } from 'fabric-browserify';

import log from 'log';

// model
import model from 'model';
import Shelf from 'model/cabinet_items/shelf';
import InvisibleBorder from 'model/cabinet_items/invisible_border';
import VerticalShelf from 'model/cabinet_items/vertical_shelf';
import HorizontalShelf from 'model/cabinet_items/horizontal_shelf';
import HorizontalPipe from 'model/cabinet_items/horizontal_pipe';
import Shoes from 'model/cabinet_items/shoes';
import Hanger from 'model/cabinet_items/hanger';
import Tie from 'model/cabinet_items/tie';
import Pantograph from 'model/cabinet_items/pantograph';
import Paints from 'model/cabinet_items/paints';
import Box from 'model/cabinet_items/box';

// collection items
import HorizontalCollectionShelf from 'model/cabinet_collection_items/horizontal_shelf';
import VerticalCollectionShelf from 'model/cabinet_collection_items/vertical_shelf';
import ShoesCollection from 'model/cabinet_collection_items/shoes';
import HorizontalPipeCollection from 'model/cabinet_collection_items/horizontal_pipe';
import PantographCollection from 'model/cabinet_collection_items/pantograph';
import HangerCollection from 'model/cabinet_collection_items/hanger';
import TieCollection from 'model/cabinet_collection_items/tie';
import PaintsCollection from 'model/cabinet_collection_items/paints';
import BoxCollection from 'model/cabinet_collection_items/box';

// helpers
import cabinetCanvasHelper from 'helpers/cabinet_canvas_helper';
import * as RulerHelpers from 'helpers/rulers';
import * as HeaderHelpers from 'helpers/header';

// renderers
import renderer from 'renderer';

// controllers
import SpyCanvasController from 'controllers/spy_canvas';
import costControllers from 'controllers/cost';
import DoorsController from 'controllers/doors';
import RulerController from 'controllers/ruler';

// constants
import * as CanvasConstants from 'constants/canvas';
import { SHADOW_AVAILABLE_COLOR, SHADOW_DISABLE_COLOR } from 'constants/spy_canvas';

// const OFFSET_X_CABINET_FROM_CENTER = 25;
const OFFSET_X_CABINET_FROM_CENTER = 30;
const EMPTY_COLOR = '#f6f6ef';

class CabinetController {
    constructor () {
        this.itemsToUpdate = [];
    }

    calculateMainPoints() {
        const options = model.getOptions();
        const canvas = model.getCanvas();
        const centerX = Math.floor(canvas.width / 2) - OFFSET_X_CABINET_FROM_CENTER;
        const centerY = Math.floor(canvas.height / 2);
        const { heightChange, widthChange } = options;
        const cabinetWidth = model.getValue('currentWidth');
        const cabinetHeight = model.getValue('currentHeight');
        const halfWidthCabinet = Math.floor(
            cabinetCanvasHelper.calculatePx({
                value: cabinetWidth,
                oldMin: widthChange.min,
                oldMax: widthChange.max,
                newMin: CanvasConstants.MIN_WIDTH_CABINET,
                newMax: CanvasConstants.MAX_WIDTH_CABINET
            }) / 2
        );

        const halfHeightCabinet = Math.floor(
            cabinetCanvasHelper.calculatePx({
                value: cabinetHeight,
                oldMin: heightChange.min,
                oldMax: heightChange.max,
                newMin: CanvasConstants.MIN_HEIGHT_CABINET,
                newMax: CanvasConstants.MAX_HEIGHT_CABINET
            }) / 2
        );

        const leftTop = { x: centerX - halfWidthCabinet, y: centerY - halfHeightCabinet };
        const rightTop = { x: centerX + halfWidthCabinet, y: centerY - halfHeightCabinet };
        const leftDown = { x: centerX - halfWidthCabinet, y: centerY + halfHeightCabinet };
        const rightDown = { x: centerX + halfWidthCabinet, y: centerY + halfHeightCabinet };

        return { leftTop, leftDown, rightTop, rightDown };
    }

    initCanvas(id, container) {
        const options = model.getOptions();
        const values = model.getValue();
        let canvas = model.getCanvas();
        const shadow = model.getShadow();

        const { colorSide, colorShelf, color, background, line, stroke } = model.getValue('cabinetColor');

        if(_.isNull(canvas)) {
            canvas = new fabric.Canvas(id, {
                hoverCursor: 'pointer',
            });
            canvas.selection = false;
            // canvas.allowTouchScrolling  = true;

            model.saveCanvasContainer(container);
            model.setCanvas(canvas); 
        }

        this.canvas = canvas;

        const { shelfWidth, shelvesChange } = options;
        const { leftTop, leftDown, rightTop, rightDown } = this.calculateMainPoints();
        let backgroundGrid;

        const widthLeftShelves = Math.floor(
            cabinetCanvasHelper.calculatePx({
                value: values.leftShelf,
                oldMin: shelvesChange.min,
                oldMax: shelvesChange.max,
                newMin: CanvasConstants.MIN_SIDE_SHELVES_WIDTH,
                newMax: CanvasConstants.MAX_SIDE_SHELVES_WIDTH
            })
        );

        const widthRightShelves = Math.floor(
            cabinetCanvasHelper.calculatePx({
                value: values.rightShelf,
                oldMin: shelvesChange.min,
                oldMax: shelvesChange.max,
                newMin: CanvasConstants.MIN_SIDE_SHELVES_WIDTH,
                newMax: CanvasConstants.MAX_SIDE_SHELVES_WIDTH
           })
        );

        const insidePartOfBottomShelf = cabinetCanvasHelper.drawInsidePartOfBottomShelf({
            leftDown,
            stroke,
            rightDown,
            fill: color,
            visible: values.isShowBottomShelf
        });

        const insidePartOfCeiling = cabinetCanvasHelper.drawInsidePartOfCeiling({
            leftTop,
            stroke,
            strokeWidth: 1,
            rightTop,
            fill: color,
            visible: values.isShowCeiling
        });

        const insidePartOfRightShelf = cabinetCanvasHelper.drawInsidePartOfRightShelf({
            rightTop,
            rightDown,
            stroke,
            fill: values.isShowRightStand ? color : EMPTY_COLOR,
            visible: values.isShowRightShelve,
            shelfWidth
        });

        const insidePartOfLeftShelf = cabinetCanvasHelper.drawInsidePartOfLeftShelf({
            leftTop,
            leftDown,
            stroke,
            fill: values.isShowLeftStand ? color : EMPTY_COLOR,
            visible: values.isShowLeftShelve,
            shelfWidth
        });

        const backgroundCabinet = new fabric.Path(`M ${ (leftDown.x + CanvasConstants.PERSPECTIVE_WIDTH) + " " + ((leftDown.y + shelfWidth) - CanvasConstants.PERSPECTIVE_HEIGHT)}
            L ${ (leftTop.x + CanvasConstants.PERSPECTIVE_WIDTH) + " " + ((leftTop.y - shelfWidth) + CanvasConstants.PERSPECTIVE_HEIGHT)}
            L ${ (rightTop.x - CanvasConstants.PERSPECTIVE_WIDTH) + " " + ((rightTop.y - shelfWidth) + CanvasConstants.PERSPECTIVE_HEIGHT) }
            L ${ (rightDown.x - CanvasConstants.PERSPECTIVE_WIDTH) + " " + ((rightDown.y + shelfWidth) - CanvasConstants.PERSPECTIVE_HEIGHT) }z`, {
            stroke, 
            strokeWidth: 1,
            fill: background,
            selectable: false
        });

        const backgroundImage = model.getCanvasObject('backgroundImage');
        backgroundImage.set({
            left: backgroundCabinet.left,
            top: backgroundCabinet.top,
            width: backgroundCabinet.width,
            height: backgroundCabinet.height,
            visible: !values.isShowRear,
            selectable: false
        });

        const innerLeftTopAngle = { x: leftTop.x + CanvasConstants.PERSPECTIVE_WIDTH, y: leftTop.y - shelfWidth + CanvasConstants.PERSPECTIVE_HEIGHT };
        const innerLeftDownAngle = { x: leftDown.x + CanvasConstants.PERSPECTIVE_WIDTH, y: leftDown.y + shelfWidth - CanvasConstants.PERSPECTIVE_HEIGHT };
        const innerRightTopAngle = { x: rightTop.x - CanvasConstants.PERSPECTIVE_WIDTH, y: rightTop.y - shelfWidth + CanvasConstants.PERSPECTIVE_HEIGHT };
        const innerRightDownAngle = { x: rightDown.x - CanvasConstants.PERSPECTIVE_WIDTH,  y: rightDown.y + shelfWidth - CanvasConstants.PERSPECTIVE_HEIGHT };

        const delta = 7;

        // Background
        let beginX = innerLeftDownAngle.x;
        let beginY = innerLeftTopAngle.y;
        let currentOffsetTop = 0;
        let currentOffsetBottom = 0;
        let endY, endX;

        const data = [];
        while(beginX < innerRightDownAngle.x) {
            while(beginY < innerLeftDownAngle.y) {
                if( beginX + currentOffsetTop > innerRightDownAngle.x) {
                    endY = innerRightTopAngle.y + ((beginX + currentOffsetTop) % innerRightDownAngle.x);
                    endX = innerRightDownAngle.x;
                } else {
                    endY = innerRightTopAngle.y;
                    endX = beginX + currentOffsetTop;
                }

                data.push(`M ${ innerLeftDownAngle.x + " " + beginY }
                    L ${ endX + " " + endY }
                `);

                currentOffsetTop += delta;
                beginY += delta;
                currentOffsetBottom = (innerLeftTopAngle.y + currentOffsetTop) % innerLeftDownAngle.y;
            }

            if( innerLeftDownAngle.x + currentOffsetTop > innerRightDownAngle.x) {
                endY = innerRightTopAngle.y + ((innerLeftDownAngle.x + currentOffsetTop) % innerRightDownAngle.x);
                endX = innerRightDownAngle.x;
            } else {
                endY = innerRightTopAngle.y;
                endX = innerLeftDownAngle.x + currentOffsetTop;
            }

            data.push(`M ${ currentOffsetBottom + innerLeftDownAngle.x + " " + innerRightDownAngle.y }
                L ${ endX + " " + endY }
            `);

            data.push(`M ${ beginX + " " + innerLeftDownAngle.y }
                L ${ beginX + " " + innerLeftTopAngle.y }
            `);

            currentOffsetTop += delta;
            currentOffsetBottom += delta;
            beginX += delta;
        }

        backgroundGrid = new fabric.Path(_.join(data, ' '), { 
            stroke: line, 
            strokeWidth: 1,
            selectable: false,
            visible: values.isShowRear,
        });
        backgroundGrid.path.push(data);
        /*****************/
        
        // Left shelve
        const leftShelve = new fabric.Path(`
            M ${ (leftDown.x - shelfWidth ) + " " + ((leftDown.y + shelfWidth) - CanvasConstants.SIDE_SHELVES_DIFF)}
            L ${ ((leftDown.x - shelfWidth ) - widthLeftShelves - 1) + " " + ((leftDown.y + shelfWidth) - CanvasConstants.SIDE_SHELVES_DIFF)}
            L ${ ((leftTop.x - shelfWidth ) - widthLeftShelves - 1) + " " + ((leftTop.y - shelfWidth) + CanvasConstants.SIDE_SHELVES_DIFF) }
            L ${ ((leftTop.x - shelfWidth )) + " " + ((leftTop.y - shelfWidth) + CanvasConstants.SIDE_SHELVES_DIFF) }z`, {
            stroke, 
            strokeWidth: 1,
            fill: values.isShowLeftRear ? colorSide : EMPTY_COLOR,
            visible: values.isShowLeftShelve,
            selectable: false
        });

        const leftShelveLight = new fabric.Path(`
            M ${ ((leftDown.x - shelfWidth ) - widthLeftShelves) + " " + ((leftDown.y + shelfWidth) - CanvasConstants.SIDE_SHELVES_DIFF)}
            L ${ ((leftTop.x - shelfWidth ) - widthLeftShelves) + " " + ((leftTop.y - shelfWidth) + CanvasConstants.SIDE_SHELVES_DIFF) }
            C ${ Math.floor( ((leftTop.x - shelfWidth ) - widthLeftShelves/2) ) + " " + Math.floor( ((leftTop.y + leftDown.y) / 3 ) )+ " " + Math.floor( ((leftTop.x - shelfWidth ) - widthLeftShelves/2 + 2) )+ " " + Math.floor( ((leftDown.y + leftTop.y) / 2) ) + " " + Math.floor( ((leftTop.x - shelfWidth ) - widthLeftShelves/2 + 2) )+ " " + Math.floor( ((leftDown.y + leftTop.y) / 2) )}
            C ${ Math.floor( ((leftTop.x - shelfWidth ) - widthLeftShelves/2) )+ " " + Math.floor( ((leftTop.y + leftDown.y) / 1.5) )+ " " + Math.floor( ((leftTop.x - shelfWidth ) - widthLeftShelves + 1) )+ " " + ((leftDown.y + shelfWidth) - CanvasConstants.SIDE_SHELVES_DIFF) + " " + ((leftTop.x - shelfWidth ) - widthLeftShelves + 1) + " " + ((leftDown.y + shelfWidth) - CanvasConstants.SIDE_SHELVES_DIFF) }z`, {
            fill: values.isShowLeftRear ? color : EMPTY_COLOR,
            visible: values.isShowLeftShelve,
            selectable: false
        });
    
        canvas.add(leftShelve);
        canvas.add(leftShelveLight);
        model.setCanvasObject('leftShelve', leftShelve);
        model.setCanvasObject('leftShelveLight', leftShelveLight);

        const rightShelve = new fabric.Path(`
            M ${ (rightDown.x + shelfWidth ) + " " + ((rightDown.y + shelfWidth) - CanvasConstants.SIDE_SHELVES_DIFF)}
            L ${ ((rightDown.x + shelfWidth ) + widthRightShelves + 1) + " " + ((rightDown.y + shelfWidth) - CanvasConstants.SIDE_SHELVES_DIFF)}
            L ${ ((rightTop.x + shelfWidth ) + widthRightShelves + 1) + " " + ((rightTop.y - shelfWidth) + CanvasConstants.SIDE_SHELVES_DIFF) }
            L ${ ((rightTop.x + shelfWidth )) + " " + ((rightTop.y - shelfWidth) + CanvasConstants.SIDE_SHELVES_DIFF) }z`, {
            stroke, 
            strokeWidth: 1,
            fill: values.isShowRightRear ? colorSide : EMPTY_COLOR,
            visible: values.isShowRightShelve,
            selectable: false
        });

        const rightShelveLight = new fabric.Path(`
            M ${ ((rightDown.x + shelfWidth ) + widthRightShelves + 1) + " " + ((rightDown.y + shelfWidth) - CanvasConstants.SIDE_SHELVES_DIFF)}
            L ${ ((rightTop.x + shelfWidth ) + widthRightShelves + 1) + " " + ((rightTop.y - shelfWidth) + CanvasConstants.SIDE_SHELVES_DIFF) }
            C ${ Math.floor( ((rightTop.x + shelfWidth ) + widthRightShelves/2) )+ " " + Math.floor( ((rightTop.y + rightDown.y) / 3 ) )+ " " + Math.floor( ((rightTop.x + shelfWidth ) + widthRightShelves/2 + 2) ) + " " + Math.floor( ((rightDown.y + rightTop.y) / 2) ) + " " + Math.floor( ((rightTop.x + shelfWidth ) + widthRightShelves/2 + 2) )+ " " + Math.floor( ((rightDown.y + rightTop.y) / 2) )}
            C ${ Math.floor( ((rightTop.x + shelfWidth ) + widthRightShelves/2) )+ " " + Math.floor( ((rightTop.y + rightDown.y) / 1.5) )+ " " + ((rightTop.x + shelfWidth ) + widthRightShelves) + " " + ((rightDown.y + shelfWidth) - CanvasConstants.SIDE_SHELVES_DIFF)  + " " + ((rightTop.x + shelfWidth ) + widthRightShelves) + " " + ((rightDown.y + shelfWidth) - CanvasConstants.SIDE_SHELVES_DIFF) }z`, {
            fill: values.isShowRightRear ? color : EMPTY_COLOR,
            visible: values.isShowRightShelve,
            selectable: false
        });

        canvas.add(rightShelve);
        canvas.add(rightShelveLight);
        model.setCanvasObject('rightShelve', rightShelve);
        model.setCanvasObject('rightShelveLight', rightShelveLight);

        model.setCanvasObject('backgroundCabinet', backgroundCabinet);
        model.setCanvasObject('insidePartOfLeftShelf', insidePartOfLeftShelf);
        model.setCanvasObject('insidePartOfRightShelf', insidePartOfRightShelf);
        model.setCanvasObject('insidePartOfBottomShelf', insidePartOfBottomShelf);
        model.setCanvasObject('insidePartOfCeiling', insidePartOfCeiling);
        model.setCanvasObject('backgroundGrid', backgroundGrid);

        this.canvas.renderOnAddRemove = false;
        canvas.add(backgroundCabinet);
        canvas.add(backgroundImage);
        canvas.add(backgroundGrid);
        canvas.add(insidePartOfLeftShelf);
        canvas.add(insidePartOfRightShelf);
        canvas.add(insidePartOfBottomShelf);
        canvas.add(insidePartOfCeiling);
        canvas.add(shadow);
        this.renderCabinetFrame();

        this.initKeyElements();
        canvas.renderOnAddRemove = true;
        canvas.renderAll();
    }

    initKeyElements () {
        const canvas = model.getCanvas();
        const values = model.getValue();
        const { shelfWidth, shelvesChange } = model.getOptions();
        const { leftTop, leftDown, rightTop, rightDown } = this.calculateMainPoints();

        const widthRightShelves = Math.floor(
            cabinetCanvasHelper.calculatePx({
                value: values.rightShelf,
                oldMin: shelvesChange.min,
                oldMax: shelvesChange.max,
                newMin: CanvasConstants.MIN_SIDE_SHELVES_WIDTH,
                newMax: CanvasConstants.MAX_SIDE_SHELVES_WIDTH
           })
        );

        const widthLeftShelves = Math.floor(
            cabinetCanvasHelper.calculatePx({
                value: values.leftShelf,
                oldMin: shelvesChange.min,
                oldMax: shelvesChange.max,
                newMin: CanvasConstants.MIN_SIDE_SHELVES_WIDTH,
                newMax: CanvasConstants.MAX_SIDE_SHELVES_WIDTH
            })
        );

        // TOP SHELF
        const topShelf = this.initShelf({
            leftTop: {
                x: leftTop.x,
                y: leftTop.y - shelfWidth
            },
            rightDown: {
                x: rightTop.x,
                y: leftTop.y
            },
            strokeWidth: 1,
            visible: false, // in the nearest future will be replaced by false
            isTop: true,
            isHorizontal: true,
            perspectiveVisible: values.isShowCeiling,
            selectable: false,
        });

        // BOTTOM SHELF
        const bottomShelf = this.initShelf({
            leftTop: {
                x: leftDown.x,
                y: leftDown.y
            },
            rightDown: {
                x: rightDown.x,
                y: rightDown.y + shelfWidth
            },
            isHorizontal: true,
            strokeWidth: 1,
            visible: false, // in the nearest future will be replaced by false
            isBottom: true,
            perspectiveVisible: values.isShowCeiling,
            selectable: false,
        });

        // LEFT SHELF
        const leftShelf = this.initShelf({
            leftTop: {
                x: leftTop.x - shelfWidth,
                y: leftTop.y - shelfWidth
            },
            rightDown: {
                x: leftDown.x,
                y: leftDown.y + shelfWidth
            },
            isVertical: true,
            // stroke,
            isLeft: true,
            strokeWidth: 1,
            visible: false, // in the nearest future will be replaced by false
            perspectiveVisible: values.isShowCeiling,
            selectable: false,
        });

        // RIGHT SHELF
        const rightShelf = this.initShelf({
            leftTop: {
                x: rightTop.x,
                y: rightTop.y - shelfWidth
            },
            rightDown: {
                x: rightDown.x + shelfWidth,
                y: rightDown.y + shelfWidth
            },
            isVertical: true,
            isRight: true,
            strokeWidth: 1,
            visible: false, // in the nearest future will be replaced by false
            perspectiveVisible: values.isShowCeiling,
            selectable: false,
        });

        // LEFT INVISIBLE SHELF
        const leftInvisibleShelf = this.initInvisibleShelf({
            leftTop: {
                x: leftTop.x - widthLeftShelves - 2 * shelfWidth,
                y: leftTop.y + CanvasConstants.SIDE_SHELVES_DIFF + 1
            },
            rightDown: {
                x: leftDown.x - widthLeftShelves - shelfWidth,
                y: leftDown.y - CanvasConstants.SIDE_SHELVES_DIFF - 1
            },
            strokeWidth: 1,
            isVertical: true,
            isLeftInvisible: true,
        });

        // RIGHT INVISIBLE SHELF
        const rightInvisibleShelf = this.initInvisibleShelf({
            leftTop: {
                x: rightTop.x + widthRightShelves + shelfWidth,
                y: rightTop.y + CanvasConstants.SIDE_SHELVES_DIFF + 1
            },
            rightDown: {
                x: rightDown.x + widthRightShelves + 2 * shelfWidth,
                y: rightDown.y - CanvasConstants.SIDE_SHELVES_DIFF - 1
            },
            strokeWidth: 1,
            isVertical: true,
            isRightInvisible: true,
        });


        canvas.add(leftInvisibleShelf.element);
        canvas.add(rightInvisibleShelf.element);
        canvas.add(topShelf.element);
        canvas.add(bottomShelf.element);
        canvas.add(leftShelf.element);
        canvas.add(rightShelf.element);

        model.addCabinetItem(leftInvisibleShelf);
        model.addCabinetItem(rightInvisibleShelf);
        model.addCabinetItem(topShelf);
        model.addCabinetItem(bottomShelf);
        model.addCabinetItem(leftShelf);
        model.addCabinetItem(rightShelf);
    }

    moveShadow({ left = 0, top = 0, width = 0, height = 0, visible = false }) {
        const shadow = model.getShadow();
        shadow.set({
            left,
            top: top,
            visible,
            width,
            height
        });
    }

    hideShadow() {
        const shadow = model.getShadow();
        shadow.set({
            visible: false
        });
    }

    shadowToFront() {
        const shadow = model.getShadow();
        shadow.bringToFront();
    }

    setColorShadow(isValid) {
        const shadow = model.getShadow();
        const canvas = model.getCanvas();
        shadow.set({
            fill: isValid ? SHADOW_AVAILABLE_COLOR : SHADOW_DISABLE_COLOR
        });

        canvas.renderAll();
    }


    addLeftDefaultShelves () {
        const isShowLeftShelve = model.getValue('isShowLeftShelve');
        if (!isShowLeftShelve) { return; }

        const { leftTop, leftDown } = this.calculateMainPoints();
        const { shelfWidth, shelvesChange } = model.getOptions();
        const cabinetCollectionItems = model.getCollectionItems();
        const cabinetItems = model.getCabinetItems();
        const element = _.find(cabinetCollectionItems, item => item.element instanceof HorizontalCollectionShelf).element;
        const leftShelf = _.find(cabinetItems, item => item.options.isLeft); // cabinet width in px and top coordinates
        const leftInvisibleShelf = _.find(cabinetItems, item => item.options.isLeftInvisible);

        const { colorShelf, stroke, color } = model.getValue('cabinetColor');
        const options = {
            stroke,
            strokeWidth: 1,
            visible: true,
            selectable: true,
            hasControls: false,
            hasBorders: false,
            color: colorShelf,
            perspectiveColor: color,
            itemOptions: element.getItemOptions()
        };

        const widthLeftShelves = Math.floor(
            cabinetCanvasHelper.calculatePx({
                value: model.getValue('leftShelf'),
                oldMin: shelvesChange.min,
                oldMax: shelvesChange.max,
                newMin: CanvasConstants.MIN_SIDE_SHELVES_WIDTH,
                newMax: CanvasConstants.MAX_SIDE_SHELVES_WIDTH
            })
        );

        // top left
        SpyCanvasController.createAndAddItem(HorizontalShelf, {
            x: leftTop.x - widthLeftShelves - 2 * shelfWidth,
            y: leftTop.y + CanvasConstants.SIDE_SHELVES_DIFF - shelfWidth
        }, element.id, [ leftShelf, leftInvisibleShelf ], [], _.assign({}, options));

        // bottom left
        SpyCanvasController.createAndAddItem(HorizontalShelf, {
            x: leftDown.x - widthLeftShelves - 2 * shelfWidth,
            y: leftDown.y - CanvasConstants.SIDE_SHELVES_DIFF
        }, element.id, [ leftShelf, leftInvisibleShelf ], [], _.assign({}, options));
    }

    addRightDefaultShelves () {
        const isShowRightShelve = model.getValue('isShowRightShelve');
        if (!isShowRightShelve) { return; }

        const { rightTop, rightDown } = this.calculateMainPoints();
        const { shelfWidth, shelvesChange } = model.getOptions();
        const cabinetCollectionItems = model.getCollectionItems();
        const cabinetItems = model.getCabinetItems();
        const element = _.find(cabinetCollectionItems, item => item.element instanceof HorizontalCollectionShelf).element;
        const rightShelf = _.find(cabinetItems, item => item.options.isRight); // cabinet width in px and top coordinates
        const rightInvisibleShelf = _.find(cabinetItems, item => item.options.isRightInvisible);

        const { colorShelf, stroke, color } = model.getValue('cabinetColor');
        const options = {
            stroke,
            strokeWidth: 1,
            visible: true,
            selectable: true,
            hasControls: false,
            hasBorders: false,
            color: colorShelf,
            perspectiveColor: color,
            itemOptions: element.getItemOptions()
        };

        const widthRightShelves = Math.floor(
            cabinetCanvasHelper.calculatePx({
                value: model.getValue('rightShelf'),
                oldMin: shelvesChange.min,
                oldMax: shelvesChange.max,
                newMin: CanvasConstants.MIN_SIDE_SHELVES_WIDTH,
                newMax: CanvasConstants.MAX_SIDE_SHELVES_WIDTH
           })
        );

        // top right
        SpyCanvasController.createAndAddItem(HorizontalShelf, {
            x: rightTop.x - widthRightShelves - 2 * shelfWidth,
            y: rightTop.y + CanvasConstants.SIDE_SHELVES_DIFF - shelfWidth
        }, element.id, [ rightShelf, rightInvisibleShelf ], [], _.assign({}, options));

        // bottom right
        SpyCanvasController.createAndAddItem(HorizontalShelf, {
            x: rightDown.x - widthRightShelves - 2 * shelfWidth,
            y: rightDown.y - CanvasConstants.SIDE_SHELVES_DIFF
        }, element.id, [ rightShelf, rightInvisibleShelf ], [], _.assign({}, options));
    }

    defaultFilling () {
        this.addLeftDefaultShelves();
        this.addRightDefaultShelves();

        const cabinetCollectionItems = model.getCollectionItems();
        const { shelfWidth, shelvesChange } = model.getOptions();
        const { leftTop, rightTop, leftDown, rightDown } = this.calculateMainPoints();
        const cabinetItems = model.getCabinetItems();

        const verticalElement = _.find(cabinetCollectionItems, item => item.element instanceof VerticalCollectionShelf).element;
        verticalElement.preRender(); // hack for emulation livecycle
        const horizontalElement = _.find(cabinetCollectionItems, item => item.element instanceof HorizontalCollectionShelf).element;
        const shoesElement = _.find(cabinetCollectionItems, item => item.element instanceof ShoesCollection).element;
        const horizontalPipeElement = _.find(cabinetCollectionItems, item => item.element instanceof HorizontalPipeCollection).element;
        const pantographElement = _.find(cabinetCollectionItems, item => item.element instanceof PantographCollection).element;
        const hangerElement = _.find(cabinetCollectionItems, item => item.element instanceof HangerCollection).element;
        const tieElement = _.find(cabinetCollectionItems, item => item.element instanceof TieCollection).element;
        const paintsElement = _.find(cabinetCollectionItems, item => item.element instanceof PaintsCollection).element;
        const boxElement = _.find(cabinetCollectionItems, item => item.element instanceof BoxCollection).element;

        const leftShelf = _.find(cabinetItems, item => item.options.isLeft);
        const rightShelf = _.find(cabinetItems, item => item.options.isRight);

        const rightInvisibleShelf = _.find(cabinetItems, item => item.options.isRightInvisible);
        const leftInvisibleShelf = _.find(cabinetItems, item => item.options.isLeftInvisible);

        const topShelf = _.find(cabinetItems, item => item.options.isTop);
        const botomShelf = _.find(cabinetItems, item => item.options.isBottom);
        const { colorShelf, stroke, color } = model.getValue('cabinetColor');
        const options = {
            stroke,
            strokeWidth: 1,
            visible: true,
            selectable: true,
            hasControls: false,
            hasBorders: false,
            color: colorShelf,
            perspectiveColor: color
        };

        // vertical lines
        const leftVerticalShelf = SpyCanvasController.createAndAddItem(VerticalShelf, {
            x: 357,
            y: 200,
        }, verticalElement.id, [ topShelf, botomShelf ], [], _.assign({
            itemOptions: verticalElement.getItemOptions()
        }, options));

        const rightVerticalShelf = SpyCanvasController.createAndAddItem(VerticalShelf, {
            x: 497,
            y: 200,
        }, verticalElement.id, [ topShelf, botomShelf ], [], _.assign({
            itemOptions: verticalElement.getItemOptions()
        }, options));

        // first column
        const horizontalShelf_1 = SpyCanvasController.createAndAddItem(HorizontalShelf, {
            x: 50,
            y: 110,
        }, horizontalElement.id, [ leftShelf, leftVerticalShelf ], [], _.assign({
            itemOptions: horizontalElement.getItemOptions()
        }, options));

        const horizontalShelf_3 = SpyCanvasController.createAndAddItem(HorizontalShelf, {
            x: 50,
            y: 159,
        }, horizontalElement.id, [ leftShelf, leftVerticalShelf ], [], _.assign({
            itemOptions: horizontalElement.getItemOptions()
        }, options));

        const horizontalShelf_4 = SpyCanvasController.createAndAddItem(HorizontalShelf, {
            x: 50,
            y: 210,
        }, horizontalElement.id, [ leftShelf, leftVerticalShelf ], [], _.assign({
            itemOptions: horizontalElement.getItemOptions()
        }, options));

        const horizontalShelf_5 = SpyCanvasController.createAndAddItem(HorizontalShelf, {
                x: 50,
                y: 260,
            }, horizontalElement.id, [ leftShelf, leftVerticalShelf ], [], _.assign({
                itemOptions: horizontalElement.getItemOptions()
            }, options)
        );

        SpyCanvasController.createAndAddItem(HorizontalShelf, {
                x: 200,
                y: 260,
            }, horizontalElement.id, [ rightVerticalShelf, leftVerticalShelf ], [], _.assign({
                itemOptions: horizontalElement.getItemOptions()
            }, options)
        );

        SpyCanvasController.createAndAddItem(HorizontalShelf, {
                x: 200,
                y: 290,
            }, horizontalElement.id, [ rightVerticalShelf, leftVerticalShelf ], [], _.assign({
                itemOptions: horizontalElement.getItemOptions()
            }, options)
        );

        SpyCanvasController.createAndAddItem(HorizontalShelf, {
                x: 200,
                y: 330,
            }, horizontalElement.id, [ rightVerticalShelf, leftVerticalShelf ], [], _.assign({
                itemOptions: horizontalElement.getItemOptions()
            }, options)
        );

        SpyCanvasController.createAndAddItem(HorizontalPipe, {
                x: 200,
                y: 130,
            }, horizontalPipeElement.id, [ rightVerticalShelf, leftVerticalShelf ], [], _.assign({
                itemOptions: horizontalPipeElement.getItemOptions()
            }, options)
        );

        SpyCanvasController.createAndAddItem(Box, {
                x: 200,
                y: 339,
            }, boxElement.id, [ rightVerticalShelf, leftVerticalShelf ], [], _.assign({
                itemOptions: boxElement.getItemOptions()
            }, options)
        );

        SpyCanvasController.createAndAddItem(Box, {
                x: 200,
                y: 362,
            }, boxElement.id, [ rightVerticalShelf, leftVerticalShelf ], [], _.assign({
                itemOptions: boxElement.getItemOptions()
            }, options)
        );

        const verticalShelf_2 = SpyCanvasController.createAndAddItem(VerticalShelf, {
            x: 325,
            y: 270,
        }, verticalElement.id, [ horizontalShelf_5, botomShelf ], [], _.assign({
            itemOptions: verticalElement.getItemOptions()
        }, options));

        const shoes = SpyCanvasController.createAndAddItem(Shoes, {
            x: 50,
            y: 270,
        }, shoesElement.id, [ rightShelf, leftShelf ], [], _.assign({
            itemOptions: shoesElement.getItemOptions()
        }, options));

        const horizontalShelf_6 = SpyCanvasController.createAndAddItem(HorizontalShelf, {
            x: 50,
            y: 290,
        }, horizontalElement.id, [ verticalShelf_2, leftVerticalShelf ], [], _.assign({
            itemOptions: horizontalElement.getItemOptions()
        }, options));

        const horizontalShelf_7 = SpyCanvasController.createAndAddItem(HorizontalShelf, {
            x: 50,
            y: 330,
        }, horizontalElement.id, [ verticalShelf_2, leftVerticalShelf ], [], _.assign({
            itemOptions: horizontalElement.getItemOptions()
        }, options));

        const horizontalShelf_8 = SpyCanvasController.createAndAddItem(HorizontalShelf, {
            x: 50,
            y: 330,
        }, horizontalElement.id, [ verticalShelf_2, leftVerticalShelf ], [], _.assign({
            itemOptions: horizontalElement.getItemOptions()
        }, options));

        const widthRightShelves = Math.floor(
            cabinetCanvasHelper.calculatePx({
                value: model.getValue('rightShelf'),
                oldMin: shelvesChange.min,
                oldMax: shelvesChange.max,
                newMin: CanvasConstants.MIN_SIDE_SHELVES_WIDTH,
                newMax: CanvasConstants.MAX_SIDE_SHELVES_WIDTH
           })
        );

        // second column
        const horizontalShelf_2 = SpyCanvasController.createAndAddItem(HorizontalShelf, {
            x: 200,
            y: 110,
        }, horizontalElement.id, [ rightVerticalShelf, leftVerticalShelf ], [], _.assign({
            itemOptions: horizontalElement.getItemOptions()
        }, options));

        // third column
        const pantograph = SpyCanvasController.createAndAddItem(Pantograph, {
            x: 500,
            y: 80,
        }, pantographElement.id, [ rightVerticalShelf, rightShelf ], [], _.assign({
            itemOptions: pantographElement.getItemOptions()
        }, options));

        const horizontalShelf_31 = SpyCanvasController.createAndAddItem(HorizontalShelf, {
            x: 500,
            y: 205,
        }, horizontalElement.id, [ rightVerticalShelf, rightShelf ], [], _.assign({
            itemOptions: horizontalElement.getItemOptions()
        }, options));

        const hanger = SpyCanvasController.createAndAddItem(Hanger, {
            x: 530,
            y: 250
        }, hangerElement.id, [ horizontalShelf_31 ], [], _.assign({
            itemOptions: hangerElement.getItemOptions()
        }, options));

        const tie = SpyCanvasController.createAndAddItem(Tie, {
            x: 530,
            y: 230
        }, tieElement.id, [ leftShelf, rightShelf ], [], _.assign({
            itemOptions: tieElement.getItemOptions()
        }, options));

        const paints = SpyCanvasController.createAndAddItem(Paints, {
            x: 530,
            y: 290
        }, paintsElement.id, [ leftShelf, rightShelf ], [], _.assign({
            itemOptions: paintsElement.getItemOptions()
        }, options));

        const horizontalShelf_32 = SpyCanvasController.createAndAddItem(HorizontalShelf, {
            x: 500,
            y: 330,
        }, horizontalElement.id, [ rightVerticalShelf, rightShelf ], [], _.assign({
            itemOptions: horizontalElement.getItemOptions()
        }, options));

        const box_31 = SpyCanvasController.createAndAddItem(Box, {
            x: 500,
            y: 339,
        }, boxElement.id, [ rightVerticalShelf, rightShelf ], [], _.assign({
            itemOptions: boxElement.getItemOptions()
        }, options));

        const box_32 = SpyCanvasController.createAndAddItem(Box, {
            x: 500,
            y: 362,
        }, boxElement.id, [ rightVerticalShelf, rightShelf ], [], _.assign({
            itemOptions: boxElement.getItemOptions()
        }, options));

        // right side shelves
        const rightSideS = SpyCanvasController.createAndAddItem(HorizontalShelf, {
            x: rightTop.x - widthRightShelves - 2 * shelfWidth,
            y: 148
        }, horizontalElement.id, [ rightShelf, rightInvisibleShelf ], [], _.assign({}, options));

        const rightSideShelf = SpyCanvasController.createAndAddItem(HorizontalShelf, {
            x: rightTop.x - widthRightShelves - 2 * shelfWidth,
            y: 220
        }, horizontalElement.id, [ rightShelf, rightInvisibleShelf ], [], _.assign({}, options));

        const rightSideShelv = SpyCanvasController.createAndAddItem(HorizontalShelf, {
            x: rightTop.x - widthRightShelves - 2 * shelfWidth,
            y: 300
        }, horizontalElement.id, [ rightShelf, rightInvisibleShelf ], [], _.assign({}, options));

        // left side shelves
        const widthLeftShelves = Math.floor(
            cabinetCanvasHelper.calculatePx({
                value: model.getValue('leftShelf'),
                oldMin: shelvesChange.min,
                oldMax: shelvesChange.max,
                newMin: CanvasConstants.MIN_SIDE_SHELVES_WIDTH,
                newMax: CanvasConstants.MAX_SIDE_SHELVES_WIDTH
            })
        );

        // top left
        const leftSideS = SpyCanvasController.createAndAddItem(HorizontalShelf, {
            x: leftTop.x - widthLeftShelves - 2 * shelfWidth,
            y: 148
        }, horizontalElement.id, [ leftShelf, leftInvisibleShelf ], [], _.assign({}, options));

        const leftSideShelf = SpyCanvasController.createAndAddItem(HorizontalShelf, {
            x: leftTop.x - widthLeftShelves - 2 * shelfWidth,
            y: 220
        }, horizontalElement.id, [ leftShelf, leftInvisibleShelf ], [], _.assign({}, options));

        const leftSideShelv = SpyCanvasController.createAndAddItem(HorizontalShelf, {
            x: leftTop.x - widthLeftShelves - 2 * shelfWidth,
            y: 300
        }, horizontalElement.id, [ leftShelf, leftInvisibleShelf ], [], _.assign({}, options));
    }

    initCallbacks () {
        this.canvas.on({
            'object:moving' : this.onObjectMove,
            'touch:drag': this.onObjectDrag
        });
    }

    // ROLLERS LOGIC
    updateBottomRuler () {
        const cabinetItems = model.getCabinetItems();
        const verticalShelves = _.filter(cabinetItems, item => item.constructor === VerticalShelf);

        RulerController.updateBottomRuler(RulerHelpers.drawBottomRuler, verticalShelves);
    }

    updateRightRuler () {
        const cabinetItems = model.getCabinetItems();
        const horizontalShelves = _.filter(cabinetItems, item =>
            item.constructor === HorizontalShelf && !item.options.isLeftBorderShelf && !item.options.isRightBorderShelf);

        RulerController.updateRightRuler(RulerHelpers.drawRightRuler, horizontalShelves);
    }

    // call this method to draw cabinet rollers
    updateRuler () {
        let canvas = model.getCanvas();
        canvas.renderOnAddRemove = false;

        window.requestAnimationFrame(() => {
            RulerController.updateTopRuler();
            RulerController.updateLeftRuler();
            this.updateBottomRuler();
            this.updateRightRuler();

            RulerController.updateLeftBorderRuler();
            RulerController.updateRightBorderRuler();
            canvas.renderOnAddRemove = true;
            canvas.renderAll();
        });

    }

    removeCabinetItemChildren(item) {
        if (item.shouldBeRemovedByUpdate()) {
            _.forEach(item.children, child => {
                _.remove(child.parents, parent => parent.id === item.id);
                this.removeCabinetItemChildren(child);
            });

            item.delete(this.canvas);
        } else {
            this.itemsToUpdate.push(item);
        }
    }

    createCabinet = () => {
        this.removeAll();
        this.setCurrentValues();
        this.initCanvas();
        this.addLeftDefaultShelves();
        this.addRightDefaultShelves();
        DoorsController.createDoors();
        this.update();
    };

    removeCabinetItem(item) {
        const children = item.children;
        const childrenLength = children.length;

        for (let i = childrenLength - 1; i >= 0; i--) {
            this.removeCabinetItemChildren(children[i]);
        }

        item.delete(this.canvas);
    }

    updateItems () {
        _.forEach(this.itemsToUpdate, item => {
            // search cabinet collection item
            const cabinetCollectionItem = this.findCabinetCollectionItem(item);
            const children = item.children;

            // remove item
            item.delete(this.canvas);
            _.forEach(children, child => {
                _.remove(child.parents, parent => parent.id === item.id);
            });

            // emulate start & end of dragging collection item with correct coordinates
            SpyCanvasController.createItem(cabinetCollectionItem, {
                x: item.options.x,
                y: item.options.y
            }, children);
        });
    }

    findCabinetCollectionItem(cabinetItem) {
        const cabinetCollectionItems = model.getCollectionItems();
        return _.find(cabinetCollectionItems, item => item.element.id === cabinetItem.parentId);
    }

    onObjectMove = (e) => {
        if (model.isDraggingOn() || SpyCanvasController.isInAnimation) {
            e.target.lockMovementX = true;
            e.target.lockMovementY = true;
            return;
        }
        if (model.isDoorDragging() || model.isInTextureMode()) { return true; }
        // if (model.isDoorDragging()) { return; }
        if (model.isDoorElementDragging()) { return DoorsController.onElementDragStart(e); }
        this.onDragStart(e);
    };

    onObjectDrag = (e) => {
        if (model.isDraggingOn() || SpyCanvasController.isInAnimation) {
            e.target.lockMovementX = true;
            e.target.lockMovementY = true;
            return;
        }
        if (model.isDoorDragging() || model.isInTextureMode()) { return true; }
        if (model.isDoorElementDragging()) { return DoorsController.onElementDragStart(e); }
        this.onDragStart(e);
    };

    onDragStart = (e) => {
        requestAnimationFrame(() => {
            const parentId = e && e.target && e.target.parentId;
            const cabinetItems = model.getCabinetItems();
            const cabinetItem = _.find(cabinetItems, { id: parentId });

            if (!cabinetItem) {
                log.warn('CabinetController.onObjectMove: cabinetItem has no found');
                return;
            }

            // search cabinet collection item
            const cabinetCollectionItem = this.findCabinetCollectionItem(cabinetItem);

            // remove cabinet item & each children from model & canvas
            this.itemsToUpdate = [];
            this.removeCabinetItem(cabinetItem);
            this.itemsToUpdate = _.uniqBy(this.itemsToUpdate, 'id');
            this.canvas.renderAll();

            // update non deleted items
            this.updateItems();
            this.itemsToUpdate = [];

            // start dragging
            SpyCanvasController.onDragStart(cabinetCollectionItem, e);
        });
    };

    initShelf (options) {
        const shelf = new Shelf(options);
        shelf.preRender();
        return shelf;
    }

    initInvisibleShelf(options) {
        const invisibleBorder = new InvisibleBorder(options);
        invisibleBorder.preRender();
        return invisibleBorder;
    }

    addPhantom (phantom) {
        this.phantom = phantom;
        this.canvas.add(phantom);
    }

    removePhantom () {
        this.phantom.remove();
        this.phantom = null;
    }

    movePhantom ({x, y}) {
        this.phantom.set({
            left: x,
            top: y
        });

        this.canvas.renderAll();
    }

    update() {
        HeaderHelpers.changeStyleBidStep(DoorsController.isSelectedMaterialForAllDoors());
        // RECALCULATE CABINET COST
        costControllers.recalculateCabinetCost();
        this.updateRuler();
    }

    recalculate(prop) {
        const canvas = model.getCanvas();
        const { color, colorSide } = model.getValue('cabinetColor');
        const leftShelve = model.getCanvasObject('leftShelve');
        const leftShelveLight = model.getCanvasObject('leftShelveLight');
        const rightShelve = model.getCanvasObject('rightShelve');
        const rightShelveLight = model.getCanvasObject('rightShelveLight');
        const { shelfWidth, shelvesChange } = model.getOptions();
        const propValue = model.getValue(prop);
        const cabinetItems = model.getCabinetItems();
 
        switch(prop) {
            case 'isShowCeiling':
                const ceiling = model.getCanvasObject('insidePartOfCeiling');
                ceiling.set({ visible: propValue });
                this.renderCabinetFrame();
                break;

            case 'isShowBottomShelf':
                const bottom = model.getCanvasObject('insidePartOfBottomShelf');
                bottom.set({ visible: propValue });
                this.renderCabinetFrame();
                break;

            case 'isShowRightStand':
                const rightShelf = model.getCanvasObject('insidePartOfRightShelf');
                rightShelf.set({ fill: propValue ? color : EMPTY_COLOR });
                break;

            case 'isShowLeftStand':
                const leftShelf = model.getCanvasObject('insidePartOfLeftShelf');
                leftShelf.set({ fill: propValue ? color : EMPTY_COLOR });
                break;

            case 'isShowRear':
                const backgroundCabinet = model.getCanvasObject('backgroundCabinet');
                const backgroundGrid = model.getCanvasObject('backgroundGrid');
                const backgroundImage = model.getCanvasObject('backgroundImage');
                backgroundImage.set({ visible: !propValue });
                backgroundCabinet.set({ visible: propValue });
                backgroundGrid.set({ visible: propValue });
                break;

            case 'isShowRightShelve':
                rightShelve.set({ visible: propValue });
                rightShelveLight.set({ visible: propValue });
                if (!propValue) {
                    // remove right invisible shelf
                    const rightInvisibleShelf = _.find(cabinetItems, item => item.options.isRightInvisible);
                    rightInvisibleShelf && this.removeCabinetItem(rightInvisibleShelf);
                } else {
                    // add right invisible shelf
                    const rightShelfWidth = model.getValue('currentRightShelfWidth'); // sm
                    const rightVisibleShelf = _.find(cabinetItems, item => item.options.isRight);
                    const rightShelfRealWidth = Math.floor(
                        cabinetCanvasHelper.calculatePx({
                            value: rightShelfWidth,
                            oldMin: shelvesChange.min,
                            oldMax: shelvesChange.max,
                            newMin: CanvasConstants.MIN_SIDE_SHELVES_WIDTH,
                            newMax: CanvasConstants.MAX_SIDE_SHELVES_WIDTH
                       })
                    );

                    const rightInvisibleShelf = this.initInvisibleShelf({
                        leftTop: {
                            x: rightVisibleShelf.element.left + rightShelfRealWidth + shelfWidth,
                            y: rightVisibleShelf.element.top + CanvasConstants.SIDE_SHELVES_DIFF + shelfWidth + 1,
                        },
                        rightDown: {
                            x: rightVisibleShelf.element.left + rightShelfRealWidth + 2 * shelfWidth,
                            y: rightVisibleShelf.element.top + rightVisibleShelf.element.height - 2 * CanvasConstants.SIDE_SHELVES_DIFF + shelfWidth + 1
                        },
                        strokeWidth: 1,
                        isRightInvisible: true,
                    });
                    canvas.add(rightInvisibleShelf.element);
                    model.addCabinetItem(rightInvisibleShelf);

                    this.addRightDefaultShelves();
                }
                break;

            case 'isShowLeftShelve':
                leftShelve.set({ visible: propValue });
                leftShelveLight.set({ visible: propValue });
                if (!propValue) {
                    // remove left invisible shelf
                    const leftInvisibleShelf = _.find(cabinetItems, item => item.options.isLeftInvisible);
                    leftInvisibleShelf && this.removeCabinetItem(leftInvisibleShelf);
                } else {
                    // add left invisible shelf
                    const leftShelfWidth = model.getValue('currentLeftShelfWidth'); // sm
                    const leftVisibleShelf = _.find(cabinetItems, item => item.options.isLeft);

                    const leftShelfRealWidth = Math.floor(
                        cabinetCanvasHelper.calculatePx({
                            value: leftShelfWidth,
                            oldMin: shelvesChange.min,
                            oldMax: shelvesChange.max,
                            newMin: CanvasConstants.MIN_SIDE_SHELVES_WIDTH,
                            newMax: CanvasConstants.MAX_SIDE_SHELVES_WIDTH
                        })
                    );

                    const leftInvisibleShelf = this.initInvisibleShelf({
                        leftTop: {
                            x: leftVisibleShelf.element.left - leftShelfRealWidth - shelfWidth,
                            y: leftVisibleShelf.element.top + CanvasConstants.SIDE_SHELVES_DIFF + shelfWidth + 1,
                        },
                        rightDown: {
                            x: leftVisibleShelf.element.left - leftShelfRealWidth,
                            y: leftVisibleShelf.element.top + leftVisibleShelf.element.height - 2 * CanvasConstants.SIDE_SHELVES_DIFF + shelfWidth + 1
                        },
                        strokeWidth: 1,
                        isLeftInvisible: true,
                    });
                    canvas.add(leftInvisibleShelf.element);
                    model.addCabinetItem(leftInvisibleShelf);

                    this.addLeftDefaultShelves();
                }
                break;

            case 'isShowLeftRear':
                if (!propValue) {
                    leftShelve.set({ fill: EMPTY_COLOR });
                    leftShelveLight.set({ fill: EMPTY_COLOR });
                } else {
                    leftShelve.set({ fill: colorSide });
                    leftShelveLight.set({ fill: color });
                }
                break;

            case 'isShowRightRear':
                if (!propValue) {
                    rightShelve.set({ fill: EMPTY_COLOR });
                    rightShelveLight.set({ fill: EMPTY_COLOR });
                } else {
                    rightShelve.set({ fill: colorSide });
                    rightShelveLight.set({ fill: color });
                }
                break;

            case 'width':
            case 'height':
            case 'leftShelf':
            case 'rightShelf':
                this.tryRerender();
                break;

            default: break;
        }

        this.update();
        this.canvas.renderAll();
    }

    tryRerender() {
        if(this.cabinetIsEmpty()) {
            this.createCabinet();
        }
    }

    removeAll() {
        const canvas = model.getCanvas();
        canvas.clear();
        model.removeCabinetItems();
    }

    cabinetIsEmpty() {
        const cabinetItems = model.getCabinetItems();

        return _.every(cabinetItems, (item) => {
            return (item instanceof Shelf) || (item instanceof InvisibleBorder) || (item instanceof HorizontalShelf && (item.options.isOnTop || item.options.isOnBottom));
        });
    }

    setCurrentValues () {
        if (this.cabinetIsEmpty()) {
            model.setValue('currentWidth', model.getValue('width'));
            model.setValue('currentHeight', model.getValue('height'));
            model.setValue('currentLeftShelfWidth', model.getValue('leftShelf'));
            model.setValue('currentRightShelfWidth', model.getValue('rightShelf'));
        }
    }

    applyNewColor() {
        const cabinetItems = model.getCabinetItems();
        const { colorSide, colorShelf, color, background, line, stroke } = model.getValue('cabinetColor');

        _.forEach(cabinetItems, (item) => {
            if(item && _.isFunction(item.element.set) 
                && ((item instanceof HorizontalShelf) || (item instanceof VerticalShelf))) {
                item.updateColor({
                    fill: colorShelf,
                    perspectiveColor: color,
                    stroke
                });
            }
        });

        const backgroundCabinet = model.getCanvasObject('backgroundCabinet');
        backgroundCabinet.set({
            fill: background,
            stroke
        });

        const backgroundGrid = model.getCanvasObject('backgroundGrid');
        backgroundGrid.set({ stroke: line, strokeWidth: 1, });

        const rightShelve = model.getCanvasObject('rightShelve');
        rightShelve.set({
            fill: colorSide,
            stroke
        });

        const rightShelveLight = model.getCanvasObject('rightShelveLight');
        rightShelveLight.set({ fill: color });

        const leftShelve = model.getCanvasObject('leftShelve');
        leftShelve.set({
            fill: colorSide,
            stroke
        });

        const leftShelveLight = model.getCanvasObject('leftShelveLight');
        leftShelveLight.set({ fill: color });

        const insidePartOfLeftShelf = model.getCanvasObject('insidePartOfLeftShelf');
        insidePartOfLeftShelf.set({
            fill: color,
            stroke
        });

        const insidePartOfRightShelf = model.getCanvasObject('insidePartOfRightShelf');
        insidePartOfRightShelf.set({
            fill: color,
            stroke
        });

        const insidePartOfCeiling = model.getCanvasObject('insidePartOfCeiling');
        insidePartOfCeiling.set({
            fill: color,
            stroke
        });

        const insidePartOfBottomShelf = model.getCanvasObject('insidePartOfBottomShelf');
        insidePartOfBottomShelf.set({
            fill: color,
            stroke
        });

        const cabinetFrame = model.getCanvasObject('cabinetFrame');
        cabinetFrame.set({
            fill: colorShelf,
            stroke
        });

        this.canvas.renderAll();
    }

    setColorValue(color) {
        const { cabinetAvailableColors } = model.getOptions();
        const value = _.find(cabinetAvailableColors, { color });

        if(_.isObject(value)) {
            model.setValue('cabinetColor', _.cloneDeep(value));
            this.applyNewColor();
        }
    }

    setValue(prop, value) {
        const values = model.getValue();
        if(_.has(values, prop)) {
            model.setValue(prop, value);
            this.recalculate(prop);
        }
    }

    renderCabinetFrame() {
        const oldCabinetFrame = model.getCanvasObject('cabinetFrame');
        const canvas = model.getCanvas();

        if(oldCabinetFrame && _.isFunction(oldCabinetFrame.remove)) {
            oldCabinetFrame.remove();
        }

        const data = [];
        const values = model.getValue();
        const { isShowCeiling, isShowBottomShelf } = values;
        const { shelfWidth } = model.getOptions();
        const { colorShelf, stroke } = model.getValue('cabinetColor');

        const { leftTop, leftDown, rightTop, rightDown } = this.calculateMainPoints();
        let options = {
            stroke,
            strokeWidth: 1,
            fill: colorShelf,
            stroke,
            selectable: false,
            fillRule: 'evenodd'
        };
        if(!isShowCeiling && !isShowBottomShelf) {
            data.push(`M ${ leftDown.x  + " " + (leftDown.y + shelfWidth) }
                L ${ leftTop.x + " " + (leftTop.y - shelfWidth) }
                L ${ (leftTop.x - shelfWidth) + " " + (leftTop.y - shelfWidth) }
                L ${ (leftDown.x - shelfWidth) + " " + (leftDown.y + shelfWidth) }z
                M ${ rightDown.x  + " " + (rightDown.y + shelfWidth) }
                L ${ rightTop.x + " " + (rightTop.y - shelfWidth) }
                L ${ (rightTop.x + shelfWidth) + " " + (rightTop.y - shelfWidth) }
                L ${ (rightDown.x + shelfWidth) + " " + (rightDown.y + shelfWidth) }z
            `)
        } else if(isShowCeiling && isShowBottomShelf) {
            data.push(`M ${ leftDown.x + " " + leftDown.y }
                L ${ leftTop.x + " " + leftTop.y }
                L ${ rightTop.x + " " + rightTop.y }
                L ${ rightDown.x + " " + rightDown.y }
                L ${ leftDown.x + " " + leftDown.y }z
                M ${ (leftDown.x - shelfWidth) + " " + (leftDown.y + shelfWidth) }
                L ${ (leftTop.x - shelfWidth) + " " + (leftTop.y - shelfWidth) }
                L ${ (rightTop.x + shelfWidth) + " " + (rightTop.y - shelfWidth) }
                L ${ (rightDown.x + shelfWidth) + " " + (rightDown.y + shelfWidth) }
                L ${ (leftDown.x - shelfWidth) + " " + (leftDown.y + shelfWidth) }z
            `);
        } else if(isShowCeiling && !isShowBottomShelf) {
            data.push(`M ${ (leftDown.x - shelfWidth) + " " + (leftDown.y + shelfWidth) }
                L ${ (leftTop.x - shelfWidth) + " " + (leftTop.y - shelfWidth) }
                L ${ (rightTop.x + shelfWidth) + " " + (rightTop.y - shelfWidth) }
                L ${ (rightDown.x + shelfWidth) + " " + (rightDown.y + shelfWidth) }
                L ${ rightDown.x  + " " + (rightDown.y + shelfWidth) }
                L ${ rightTop.x + " " + rightTop.y }
                L ${ leftTop.x + " " + leftTop.y }
                L ${ leftDown.x  + " " + (leftDown.y + shelfWidth) }z
            `);
            
        } else if(!isShowCeiling && isShowBottomShelf) {
            data.push(`M ${ (leftTop.x - shelfWidth) + " " + (leftTop.y - shelfWidth) }
                L ${ (leftDown.x - shelfWidth) + " " + (leftDown.y + shelfWidth) }
                L ${ (rightDown.x + shelfWidth) + " " + (rightDown.y + shelfWidth) }
                L ${ (rightTop.x + shelfWidth) + " " + (rightTop.y - shelfWidth) }
                L ${ rightTop.x + " " + (rightTop.y - shelfWidth) }
                L ${ rightDown.x + " " + rightDown.y }
                L ${ leftDown.x + " " + leftDown.y }
                L ${ leftTop.x + " " + (leftTop.y - shelfWidth) }z
            `)
        }

        const cabinetFrame = new fabric.Path(_.join(data, ' '), options);

        model.setCanvasObject('cabinetFrame', cabinetFrame);
        canvas.add(cabinetFrame);
    }
}

export default new CabinetController();