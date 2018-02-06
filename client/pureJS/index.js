import _ from 'lodash';

class Renderer {
    constructor () {
        this.constructor = null;
        this.component = null;
    }

    init (container) {
        this.container = container;
    }

    renderComponent (Component, options) {
        const component = new Component(options);

        this.preRender(component, options);

        this.buildTree(component, null);

        this.render(component);
        this.postRender(component);
    }

    buildTree (component, parent) {
        const children = _.values(component.children);

        if (!parent) { this.component = component; }
        else { component.parent = parent; }

        _.forEach(children, child => {
            this.buildTree(child, component);
        });
    }

    // livecycle
    preRender (component, options) {
        component.preRender(options);  // component define all children

        const children = _.values(component.children);

        _.forEach(children, child => {
            this.preRender(child);
        });

    }

    render (component) {
        this.container.innerHTML = component.getTemplate();
    }

    rerender (component) {
        const componentElement = document.getElementById(component.id);
        const parentElement = componentElement.parentElement;
        const nextElement = componentElement.nextElementSibling;

        parentElement.removeChild(componentElement);

        let div = document.createElement('div');
        div.innerHTML = component.getTemplate();

        if (!!nextElement) {
            parentElement.insertBefore(div.children[0], nextElement);
        } else {
            parentElement.appendChild(div.children[0]);
        }
    }

    postRender (component) {
        const children = _.values(component.children);

        _.forEach(children, child => {
            this.postRender(child);
        });

        component.postRender();
    }

    unload (component) {
        const children = _.values(component.children);

        _.forEach(children, child => {
            this.unload(child);
        });

        component.unload();
    }

    update (component, options = {}) {
        // unload component
        this.unload(component);

        this.preRender(component, options);

        // create ref to parent
        this.buildTree(component, component.parent);

        this.rerender(component);

        this.postRender(component);
    }
}

export default new Renderer();
