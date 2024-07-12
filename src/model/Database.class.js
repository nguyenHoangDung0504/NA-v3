import Utils from '../app/Utils.class.js';
import config from '../app/config.js';
import { Track, Cv, Tag, Series, OtherLink, SearchResult } from './DataClasses.js';

export default class Database {
    // Data
    /**@type {Utils}*/ #utils = undefined;
    /**@type {String} */ #csvAbsPath = undefined;
    /**@type {Array<Number>}*/ #keyList = [];
    /**@type {Map<String, Number>}*/ #trackKeyMap = new Map();
    /**@type {Map<Number, Track>}*/ #trackMap = new Map();
    /**@type {Map<String, Cv>}*/ #cvMap = new Map();
    /**@type {Map<String, Tag>}*/ #tagMap = new Map();
    /**@type {Map<String, Series>}*/ #seriesMap = new Map();
    /**
     * @param {String} message 
     * @param {any} data 
     */#log = (message, data) => this.#utils.databaseMessage(this.#csvAbsPath, 'log', message, data);
    
    #configs = {
        log: true,
        test: true,
        clearLog: false,
    };

    /**
     * @param {String} csvData 
     * @param {Utils} utils 
     * @param {String} csvAbsPath 
     * @param {{ log: Boolean, test: Boolean, clearLog: Boolean }} configs
     */
    constructor(csvData, utils, csvAbsPath, configs) {
        this.#utils = utils;
        this.#csvAbsPath = csvAbsPath;

        for (const config in configs) {
            this.#configs[`${config}`] = configs[config];
        }

        this.#build(csvData);
    }

    /**
     * @param {String} csvData 
     */
    #build(csvData) {
        console.time(`Build database ${this.#csvAbsPath} time`);

        this.#utils.parseCSV(csvData).forEach(row => {
            let [code, rjCode, cvs, tags, series, engName, japName, thumbnail, images, audios, otherLinks] = row;

            [cvs, tags, series, images, audios] = [cvs, tags, series, images, audios].map(list => {
                return (list.trim() !== '') 
                    ? list.split(",")
                        .filter((item) => item)
                        .map((item) => item.trim()
                            .replaceAll("”", '"')
                            .replaceAll("“", '"')
                            .replaceAll('’', "'")
                        )
                    : [];
            });

            [cvs, tags, series].forEach(list => list.sort());

            code = parseInt(code);

            otherLinks = otherLinks 
                ? otherLinks.split(',').filter(subStr => subStr).map(noteNLink => {
                    noteNLink = noteNLink.trim();
                    const [note, link] = noteNLink.split('::').map(item => item.trim());
                    return new OtherLink(note, link);
                })
                : [];
    
            const mapList = [this.#cvMap, this.#tagMap, this.#seriesMap];
            const classToCreate = [Cv, Tag, Series];
            
            [cvs, tags, series] = [cvs, tags, series].map((member, i) => {
                return member.map(item => {
                    const key = item.toLowerCase();
                    if(mapList[i].has(key)) {
                        mapList[i].get(key).quantity++;
                        return mapList[i].get(key);
                    }
                    mapList[i].set(key, new classToCreate[i](item, 1));
                    return mapList[i].get(key);
                });
            });

            const track = new Track(code, rjCode, cvs, tags, series, engName, japName, thumbnail, images, audios, otherLinks);
            this.#trackKeyMap.set(rjCode, code);
            this.#trackMap.set(code, track);
        });

        this.#completedBuild();
    }

    #completedBuild() {
        this.#utils.databaseMessage(this.#csvAbsPath, 'log', 'Completed build database');
        this.#utils.memoizeGetAndSearchMethods(this.#DAO);
        this.#DAO.sortByCode(true);
        [this.#cvMap, this.#tagMap, this.#seriesMap] = [this.#cvMap, this.#tagMap, this.#seriesMap].map(map => {
            return new Map([...map.entries()].sort((a, b) => a[1].name.localeCompare(b[1].name)));
        });
        console.timeEnd(`Build database ${this.#csvAbsPath} time`);
        this.#log(`Added: ${this.#keyList.length}`);
        this.#log('Complete build tracks map:', this.#trackMap);
        this.#log('Complete build CVs map:', this.#cvMap);
        this.#log('Complete build tags map:', this.#tagMap);
        this.#log('Complete build series map:', this.#seriesMap);
        this.#configs.test && this.#testingFunctions();
        this.#configs.clearLog && setTimeout(() => console.clear(), 10000);
    }

    #testingFunctions() {
        if(!this.#configs.log) return;

        const DAO = this.DAO;

        config.log = true;
        console.log('\n\n\n\n\n');
        console.time(`Database ${this.#csvAbsPath} functions testing time`);
        this.#log( 'Testing functions-----------------------------------------------------------------------');
        this.#log( '\tGet category "cv" with keyword "kaede akino":', DAO.getCategory('cv', 'kaede akino') );
        this.#log( '\tGet category "tag" with keyword "armpit":', DAO.getCategory('tag', 'armpit') );
        this.#log( '\tGet category "series" with keyword "platonicangels洗脳プロジェクト (platonicangels brainwashing project)":', DAO.getCategory('series', 'platonicangels洗脳プロジェクト (platonicangels brainwashing project)') );
        this.#log( '\tGet search suggestions with keyword "Na"', DAO.getSearchSuggestions('Na') );
        this.#log( '\tGet all tracks by keyword "saka"', DAO.searchTracksKey('saka') );
        this.#log( '\tGet tracks by category "cv" with keyword "narumi aisaka"', DAO.getTracksKeyByCategory('cvs', 'narumi aisaka') );
        this.#log( '\tGet tracks by category "tag" with keyword "elf"', DAO.getTracksKeyByCategory('tags', 'elf') );
        this.#log( '\tGet tracks by category "series" with keyword "ドスケベjKシリーズ"', DAO.getTracksKeyByCategory('series', 'ドスケベjKシリーズ') );
        this.#log( '\tGet tracks by identify with code "107613"', DAO.getTrackByIdentify('107613') );
        this.#log( '\tGet tracks by identify with RJcode "Rj377038"', DAO.getTrackByIdentify('Rj377038') );
        this.#log( '\tGet random 10 tracks', DAO.getRandomTracksKey(10) );
        this.#log( '\tGet random 20 tracks', DAO.getRandomTracksKey(20) );
        this.#log( 'End testing functions------------------------------------------------------------------');
        console.timeEnd(`Database ${this.#csvAbsPath} functions testing time`);
        console.log('\n\n\n\n\n');
        config.log = false;
        this.#configs.log = false;
    }

    /**
     * @param {Boolean} desc 
     * @returns {Array<Number>}
     */
    #getSortedTracksKeyByRjCode(desc) {
        const keyList = [...this.#trackKeyMap.keys()].sort((a, b) => {
            const [nA, nB] = [a, b].map(rjCode => rjCode.replace('RJ', ''));
            return nA.length - nB.length || Number(nA) - Number(nB);
        }).map(rjCodeKey => this.#trackKeyMap.get(rjCodeKey));

        return desc ? keyList.reverse() : keyList;
    }

    /**
     * @param {Boolean} desc 
     * @returns {Array<Number>}
     */
    #getSortedTracksKeyByCode(desc) {
        const keyList = [...this.#trackMap.keys()].sort((a, b) => a - b);
        return desc ? keyList.reverse() : keyList;
    }

    /**
     * @param {Boolean} desc 
     * @returns {Array<Number>}
     */
    #getSortedTracksKeyByUploadOrder(desc) {
        const keyList = [...this.#trackMap.keys()];
        return desc ? keyList.reverse() : keyList;
    }

    #DAO = {
        sortByRjCode: (desc = false) => this.#keyList = this.#getSortedTracksKeyByRjCode(desc),
        sortByCode: (desc = false) => this.#keyList = this.#getSortedTracksKeyByCode(desc),
        sortByUploadOrder: (desc = false) => this.#keyList = this.#getSortedTracksKeyByUploadOrder(desc),

        /**
         * @param {'cv' | 'tag' | 'series'} type 
         * @param {String} keyword 
         * @returns {Cv | Tag | Series}
         * @throws {Error} - Invalid category type
         */
        getCategory: (type, keyword) => {
            let map = null;
    
            switch (type) {
                case 'cv': map = this.#cvMap; break;
                case 'tag': map = this.#tagMap; break;
                case 'series': map = this.#seriesMap; break;
                default: throw new Error('Invalid category type');
            }
    
            return map.get(keyword.toLowerCase());
        },
        /**
         * @param {'cv' | 'tag' | 'series'} type 
         * @param {String} keyword 
         * @returns {Array<Cv | Tag | Series>}
         * @throws {Error} - Invalid category type
         */
        searchCategory: (type, keyword) => {
            const lowerCaseKeyword = keyword.toLowerCase();
            const result = [];
            let map = null;
    
            switch (type) {
                case 'cv': map = this.#cvMap; break;
                case 'tag': map = this.#tagMap; break;
                case 'series': map = this.#seriesMap; break;
                default: throw new Error('Invalid category type');
            }
    
            map.forEach((value, key) => 
                key.includes(lowerCaseKeyword) && result.push(value));
    
            return result;
        },

        /**
         * @param {String} keyword 
         * @param {Array<Number>} keyListToSearch 
         * @returns {Array<Number>}
         */
        searchTracksKey: (keyword, keyListToSearch = this.#keyList) => {
            const lowerCaseKeyword = keyword.toString().toLowerCase();
            const keyList = [];
    
            // Find Tracks with code, name or rjCode containing keywords
            keyListToSearch.forEach(codeKey => {
                let { code, rjCode, engName, japName, cvs, tags, series } = this.#trackMap.get(codeKey);
    
                // Standardized data
                code = code.toString();
                [rjCode, engName, japName] = [rjCode, engName, japName].map(str => str.toLowerCase());
    
                // Find Tracks with code, names or rjCode containing keywords
                if ([code, rjCode, engName, japName]
                    .some(valueToCheck => 
                        valueToCheck.includes(lowerCaseKeyword)))
                    keyList.push(codeKey);

                // Find Tracks with CVs, tag or series contain keywords
                [cvs, tags, series].forEach(list => {
                    list.forEach(({ name }) => {
                        !name.toLowerCase().includes(lowerCaseKeyword) 
                        || keyList.includes(codeKey) 
                        || keyList.push(codeKey);
                    });
                });
            });
    
            return keyList;
        },
        /**
         * @param {'cvs' | 'tags' | 'series'} category 
         * @param {String} keyword 
         * @param {Array<Number>} keyListToSearch 
         * @returns {Array<Number>}
         */
        getTracksKeyByCategory: (category, keyword, keyListToSearch = this.#keyList) => {
            const lowerCaseKeyword = keyword.toLowerCase();
            const keyList = [];
    
            if(!['cvs', 'tags', 'series'].includes(category)) throw new Error('Invalid category type');
    
            keyListToSearch.forEach(codeKey => {
                const track = this.#trackMap.get(codeKey);
                track[category].some(t => t.name.toLowerCase() === lowerCaseKeyword) && keyList.push(codeKey);
            });
    
            return keyList;
        },
        /**
         * @param {Number} page 
         * @param {Number} trackPerPage 
         * @param {Array<Number>} listToGet 
         * @returns {Array<Number>}
         */
        getTracksKeyForPage: (page, trackPerPage, listToGet = this.#keyList) => {
            const start = (page - 1) * trackPerPage;
            const end = Math.min(start + trackPerPage - 1, listToGet.length);
    
            return listToGet.slice(start, end + 1);
        },
        /**
         * @param {Number} numberOfTrack 
         * @param {Array<Number>} keyList 
         * @param {String} storageId 
         * @returns {Array<Number>}
         */
        getRandomTracksKey: (numberOfTrack, keyList = this.#keyList, storageId = undefined) => {
            const localStorageKey = `shuffled-indexes-id:${storageId ?? '_'}-${this.#csvAbsPath}`;
            const randomKeyList = [];
            let shuffledIndexes = JSON.parse(localStorage.getItem(localStorageKey));

            if (!shuffledIndexes || shuffledIndexes.length < numberOfTrack) {
                const remainingIndexes = Array.from(
                    Array(!shuffledIndexes ? keyList.length : keyList.length - shuffledIndexes.length).keys()
                );

                this.#utils.shuffleArray(remainingIndexes);

                if (!shuffledIndexes) {
                    shuffledIndexes = remainingIndexes;
                } else {
                    shuffledIndexes.push(...remainingIndexes);
                }

                localStorage.setItem(localStorageKey, JSON.stringify(shuffledIndexes));
            }
    
            for (let i = 0; i < numberOfTrack; i++) {
                randomKeyList.push(keyList[shuffledIndexes[i]]);
            }
    
            shuffledIndexes = shuffledIndexes.slice(numberOfTrack);
            localStorage.setItem(localStorageKey, JSON.stringify(shuffledIndexes));
    
            return randomKeyList;
        },
        /**
         * @param {String} keyword 
         * @returns {Array<SearchResult>}
         */
        getSearchSuggestions: (keyword) => {
            const lowerCaseKeyword = keyword.toString().toLowerCase();
            const results = [];
            const seen = new Set();
    
            this.#keyList.forEach(keyCode => {
                const track = this.#trackMap.get(keyCode);
                const lowerCaseCode = track.code.toString();
                const lowerCaseRjCode = track.rjCode.toLowerCase();
                const lowerCaseJapName = track.japName.toLowerCase();
                const lowerCaseEngName = track.engName.toLowerCase();
    
                // Check code
                if (lowerCaseCode.includes(lowerCaseKeyword) && !seen.has(`${track.code}_code`)) {
                    results.push(new SearchResult("code", track.code, keyword, track.code));
                    seen.add(`${track.code}_code`);
                }
                // Check rjCode
                if (lowerCaseRjCode.includes(lowerCaseKeyword) && !seen.has(`${track.rjCode}_rjCode`)) {
                    results.push(new SearchResult("rjCode", track.rjCode, keyword, track.code));
                    seen.add(`${track.rjCode}_rjCode`);
                }
                // Check cvs
                track.cvs.forEach(({ name: cv }) => {
                    const lowerCaseCv = cv.toLowerCase();
                    if (lowerCaseCv.includes(lowerCaseKeyword) && !seen.has(`${cv}_cv`)) {
                        results.push(new SearchResult("cv", cv, keyword, track.code));
                        seen.add(`${cv}_cv`);
                    }
                });
                // Check tags
                track.tags.forEach(({ name: tag }) => {
                    const lowerCaseTag = tag.toLowerCase();
                    if (lowerCaseTag.includes(lowerCaseKeyword) && !seen.has(`${tag}_tag`)) {
                        results.push(new SearchResult("tag", tag, keyword, track.code));
                        seen.add(`${tag}_tag`);
                    }
                });
                // Check series
                track.series.forEach(({ name: series }) => {
                    const lowerCaseSeries = series.toLowerCase();
                    if (lowerCaseSeries.includes(lowerCaseKeyword) && !seen.has(`${series}_series`)) {
                        results.push(new SearchResult("series", series, keyword, track.code));
                        seen.add(`${series}_series`);
                    }
                });
                // Check english name
                if (lowerCaseEngName.includes(lowerCaseKeyword) && !seen.has(`${track.engName}_engName`)) {
                    results.push(new SearchResult("engName", track.engName, keyword, track.code));
                    seen.add(`${track.engName}_engName`);
                }
                // Check japanese name
                if (lowerCaseJapName.includes(lowerCaseKeyword) && !seen.has(`${track.japName}_japName`)) {
                    results.push(new SearchResult("japName", track.japName, keyword, track.code));
                    seen.add(`${track.japName}_japName`);
                }
            });
    
            results.sort(this.#utils.sortSuggestionFn);
            return results; 
        },

        /**
         * @param {Number | String} identify 
         * @returns {Track}
         */
        getTrackByIdentify: (identify) => {
            return this.#trackMap.get(identify) 
                ?? this.#trackMap.get(Number(identify)) 
                ?? this.#trackMap.get(this.#trackKeyMap.get(identify.toUpperCase()));
        }
    }

    get DAO() { return this.#DAO; }

    /**
     * @param {String} csvPath 
     * @param {{ log: Boolean, test: Boolean, clearLog: Boolean }} configs 
     * @returns {Promise<Database>}
     */
    static async fromCsvPath(csvPath, configs) {
        const absolutePath = new URL(csvPath, window.location.origin).href;
        const utils = new Utils();
        const worker = new Worker('src/app/worker.js');
        let data = localStorage.getItem(`database-path:${absolutePath}`);

        if(!data) {
            try {
                data = await (await fetch(absolutePath)).text();
                localStorage.setItem(`database-path:${absolutePath}`, data);
            } catch (error) {
                console.error(error);
            }
        } else {
            const localData = data;
            
            worker.postMessage({ csvPath: absolutePath, localData });
            
            worker.onmessage = (event) => {
                const { action, data } = event.data;

                if (action === 'update') {
                    localStorage.setItem(`database-path:${absolutePath}`, data);
                    utils.workerMessage(absolutePath, 'log', `Data updated in local storage.`);
                } else if (action === 'no-update') {
                    utils.workerMessage(absolutePath, 'log', `Data in local storage is up-to-date.`);
                } else if (action === 'error') {
                    utils.workerMessage(absolutePath, 'error', `Error in worker:`, data);
                }

                worker.terminate();
            };
        }
        
        return new Database(data, utils, absolutePath, configs);
    }
}