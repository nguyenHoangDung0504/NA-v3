'use strict';

import '../styles/main.css';
import Utils from './Utils.class.js';
import config from './config.js';
import Database from '../model/Database.class.js';
import ListView from "../view/components/ListView.class.js";
import WatchView from "../view/components/WatchView.class.js";

const app = {
    /**
     * @type {{
     *      s1: Database, 
     *      s2: Database
     * }}
     */
    databases: {},

    /**
     * @type {{
     *      watchViews: Map<Number, WatchView>
     * }}
     */
    components: {},
};

console.time('Build app time: ');
"loading" === document.readyState ? document.addEventListener('DOMContentLoaded', async () => {
    await buildApp();
    console.timeEnd('Build app time: ');
}) : !async function(){
    await buildApp();
    console.timeEnd('Build app time: ');
}();

async function buildApp() {
    try {
        await loadData();
        buildView();
    } catch (error) {
        console.error('Error building app:', error);
    }
}

async function loadData() {
    try {
        app.databases = {
            s1: await Database.fromCsvPath('assets/data/data-s1.csv', { clearLog: true }),
            s2: await Database.fromCsvPath('assets/data/data-s2.csv', { test: false, clearLog: true }),
        };
    } catch (error) {
        console.error('Error loading databases:', error);
        throw error;
    }
}

function buildView() {
    try {
        initializeComponents();
        initializeFeatures();
    } catch (error) {
        console.error('Error initializing view:', error);
    }
}

function initializeComponents() {
    const listView = new ListView('track-grid');
    // .data([...app.databases.s1.trackMap.values()])
    // .bindFunction((e, d) => {
    //     e.querySelector('.code').textContent = d.code;
    //     e.querySelector('.eng-name').textContent = d.engName;
    // })
    // .render();
}

function initializeFeatures() {
    // Implement feature initialization logic here
}