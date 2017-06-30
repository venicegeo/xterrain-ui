import 'leaflet/dist/leaflet.css'
import 'font-awesome/css/font-awesome.css'

import 'babel-polyfill'

import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

import {createStore} from './store/index'
import Application from './components/Application.vue'

window.__vm__ = new Vue({
    el: '#Application-placeholder',
    store: createStore(),
    render: h => h(Application),
})
