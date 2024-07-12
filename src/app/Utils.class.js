import config from "./config.js";

const logStyle = {
    /**
     * @param {keyof {worker, database}} type 
     * @returns {String}
     */
    color: function(type) {
        return {
            worker: 'lightgreen',
            database: 'deepskyblue'
        }[type];
    },

    /**
     * @param {keyof {worker, database}} type 
     * @returns {String}
     */
    label: function(type) {
        return `
            background-color:#222;
            color:${this.color(type)};
            padding:5px 10px;
            font-size:14px;
            border:.5px solid gray;
        `;
    },

    /**
     * @returns {String}
     */
    message: () => `
        padding:5px;
        font-weight:bold;
        font-size:12px
    `,
}

export default class Utils {
    /**
     * @param {'log' | 'warn' | 'error'} type 
     * @param {String} message 
     * */
    workerMessage(workerFor, type, message, data = '') {
        console[type](
            `%cFrom worker%c\nWorker for: ${workerFor}\n${message}`,
            logStyle.label('worker'),
            logStyle.message(),
            data
        );
    }

    /**
     * @param {'log' | 'warn' | 'error'} type 
     * @param {String} message 
     * */
    databaseMessage(databaseFor, type, message, data = '') {
        console[type](
            `%cFrom database%c\nDatabase for: ${databaseFor}\n${message}`,
            logStyle.label('database'),
            logStyle.message(),
            data
        );
    }

    /**
     * @param {String} key 
     * @param {String} value 
     * @returns {String}
     */
    addQueryToUrl(key, value) {
        const url = new URL(window.location.href);
        const queryParams = url.searchParams;

        queryParams[queryParams.has(key) ? 'set' : 'append'](key, encodeURIComponent(value));

        return url.toString();
    }

    /**
     * @param {String} csv 
     * @returns {[Array<String>]}
     */
    parseCSV(csv) {
        return csv.split('\n')
            .filter(line => line.trim())
            .map(line => {
                const values = [];
                let current = '';
                let insideQuotes = false;
    
                for (const char of line) {
                    if (char === '"') {
                        insideQuotes = !insideQuotes;
                    } else if (char === ',' && !insideQuotes) {
                        values.push(current.trim());
                        current = '';
                    } else {
                        current += char;
                    }
                }
    
                values.push(current.trim());
                return values;
            });
    }

    /**
     * @param {String} url 
     * @returns {String}
     */
    getFileNameFromUrl(url) {
        return url.slice(url.lastIndexOf('/') + 1, url.lastIndexOf('?'));
    }

    /**
     * @param {Array} array 
     * @returns {Array}
     */
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    highlight(text, highlightValue) {
        let regexp = new RegExp(highlightValue, "i");
        return text.toString().replace(regexp, `<span class="highlight">$&</span>`);
    }

    rmHighlight(text) {
        let regex = /<span class="highlight">([\s\S]*?)<\/span>/gi;
        return text.toString().replace(regex, "$1");
    }

    /**
     * @param {String} str 
     * @returns {String}
     */
    titleCase(str) {
        let formattedStr = str.replace(/([A-Z])/g, " $1");

        formattedStr = formattedStr.replace(/([a-z])([A-Z])/g, "$1 $2");
        formattedStr = formattedStr.replace(/\b\w/g, (match) =>
            match.toUpperCase()
        );

        return formattedStr;
    }

    memoize(func) {
        const cache = {};
        return function(...args) {
            const key = JSON.stringify(args);
            if (!(key in cache)) {
                cache[key] = func.apply(this, args);
                config.log
                    && console.log(`%cCached result of: ${func.name}(${args.join(', ')})`, 'background: #222; color: #00BFFF; padding: 5px;');
            }
            return cache[key];
        };
    }
    memoizeGetAndSearchMethods(...targets) {
        targets.forEach(target => {
            const methodNames = Object.getOwnPropertyNames(target).filter(name => 
                ['get', 'search'].some(keyword => name.includes(keyword) && !name.includes('Ramdom'))
                    && (typeof target[name]) === 'function'
            );
            methodNames.forEach(methodName => {
                target[methodName] = this.memoize(target[methodName]);
            });
        });
    }

    //Sort functions
        byName = (a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase());
        byQuantity = (a, b) => a.quantity - b.quantity;
        sortSuggestionFn = (a, b) => {
            const typeOrder = ["code", "rjCode", "cv", "tag", "series", "engName", "japName"];
            const [keywordIndexA, keywordIndexB] = [a, b].map(_ => _.value.toString().toLowerCase().indexOf(_.keyword));

            if (keywordIndexA !== keywordIndexB) {
                return keywordIndexA - keywordIndexB;
            }

            const typeComparison = typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type);

            if (typeComparison !== 0) {
                return typeComparison;
            }

            return a.value.toString().localeCompare(b.value.toString());
        }
}