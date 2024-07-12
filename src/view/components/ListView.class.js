export default class ListView {
    #data;
    #list;
    #template;
    #bind;

    constructor(listId) {
        this.#list = document.getElementById(listId);
        this.#template = this.#list.querySelector('.template').cloneNode(true);
        this.#template.classList.remove('template');
        this.#data = this.#throwDataRequire;
        this.#bind = this.#throwImplementRequire;
    }

    /**
     * @param {Array} data 
     * @returns {ListView}
     */
    data(data) {
        if(data instanceof Array) {
            this.#data = data;
            return this;
        }

        throw new Error('Can resolve data type');
    }

    /**
     * @param {(element: HTMLElement, data)} bindFunction 
     * @returns {ListView}
     */
    bindFunction(bindFunction) {
        this.#bind = bindFunction;
        return this;
    }

    clear() {
        this.#list.innerHTML = '';
    }

    render() {
        this.clear();

        this.#data instanceof Function
            ? this.#data()
            : this.#data?.forEach(itemData => {
                const itemElement = this.#template.cloneNode(true);
                this.#bind(itemElement, itemData);
                this.#list.appendChild(itemElement);
            });

        return this;
    }

    #throwDataRequire() {
        throw new Error('A data array is required.');
    }

    #throwImplementRequire(element, data) {
        throw new Error('Bind function required.');
    }
}