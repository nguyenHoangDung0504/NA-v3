class Track {
    /**
     * @param {Number} code 
     * @param {String} rjCode 
     * @param {Array<Cv>} cvs 
     * @param {Array<Tag>} tags 
     * @param {Array<Series>} series 
     * @param {String} engName 
     * @param {String} japName 
     * @param {String} thumbnail 
     * @param {Array<String>} images 
     * @param {Array<String>} audios 
     * @param {Array<OtherLink>} otherLinks 
     */
    constructor(code, rjCode, cvs, tags, series, engName, japName, thumbnail, images, audios, otherLinks) {
        this.code = code;
        this.rjCode = rjCode;
        this.cvs = cvs;
        this.tags = tags;
        this.series = series;
        this.engName = engName;
        this.japName = japName;
        this.thumbnail = thumbnail;
        this.images = images;
        this.audios = audios;
        this.otherLinks = otherLinks;
    }
}

class Category {
    /**
     * @param {String} name 
     * @param {Number} quantity 
     */
    constructor(name, quantity) {
        this.name = name;
        this.quantity = quantity;
    }
}

class Cv extends Category {
    constructor(name, quantity) {
        super(name, quantity);
    }
}

class Tag extends Category {
    constructor(name, quantity) {
        super(name, quantity);
    }
}

class Series extends Category {
    constructor(name, quantity) {
        super(name, quantity);
    }
}

class OtherLink {
    /**
     * @param {String} note 
     * @param {URL} url 
     */
    constructor(note, url) {
        this.note = note;
        this.url = url;
    }
}

class SearchResult {
    /**
     * @param {'code' | 'rjCode' | 'cv' | 'tag' | 'series' | 'engName' | 'japName'} type 
     * @param {String} value 
     * @param {String} keyword 
     * @param {Number} code 
     */
    constructor(type, value, keyword, code) {
        this.type = type;
        this.value = value;
        this.keyword = keyword;
        this.code = code;
    }
}

export { Track, Cv, Tag, Series, OtherLink, SearchResult }