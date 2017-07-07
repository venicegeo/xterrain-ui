import 'leaflet/dist/leaflet.css'
import 'font-awesome/css/font-awesome.css'

import './styles/globals.css'

import 'babel-polyfill'

import Vue from 'vue'

import store from './store'
import Application from './components/Application.vue'


window.__vm__ = new Vue({
    store,
    el: '#Application',
    render: h => h(Application),
})
