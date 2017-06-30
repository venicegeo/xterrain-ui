import L from 'leaflet'
import { EnhancedLayerGroup } from './utils/leaflet-helpers'

const DEFAULT_CENTER = {lat: -10, lon: 0}
const DEFAULT_ZOOM = 1.75

const KEY_BASEMAP = 'MAP_BASEMAP'
const KEY_CENTER = 'MAP_CENTER'
const KEY_ZOOM = 'MAP_ZOOM'

const EVENT_WMS_CHANGE = 'wms:change'

const BASEMAP_Z_INDEX = 0
const [BASEMAP_LAYERS, DEFAULT_BASEMAP] = createBasemapLayers()

let _map,
    _currentBasemap,
    _delegate

const _wms = new EnhancedLayerGroup()


export function init(element) {
    _currentBasemap = BASEMAP_LAYERS[sessionStorage.getItem(KEY_BASEMAP)] || BASEMAP_LAYERS[DEFAULT_BASEMAP]

    _map = L.map(element, {
        center: JSON.parse(sessionStorage.getItem(KEY_CENTER)) || DEFAULT_CENTER,
        zoom: JSON.parse(sessionStorage.getItem(KEY_ZOOM)) || DEFAULT_ZOOM,

        layers: [
            _currentBasemap,
            _wms,
        ],
    })

    _map.on('moveend zoomend', () => {
        sessionStorage.setItem(KEY_CENTER, JSON.stringify(_map.getCenter()))
        sessionStorage.setItem(KEY_ZOOM, JSON.stringify(_map.getZoom()))
    })

    window.__map__ = _map  // DEBUG
    window.__wms__ = _wms  // DEBUG
    window.__basemap__ = _currentBasemap  // DEBUG
}

/**
 * @param {L.Bounds} bounds -
 * @param {L.FitBoundsOptions} options -
 * @returns {void}
 */
export function flyToBounds(bounds, options) {
    _map.flyToBounds(bounds, options)
}

/**
 * @returns {void}
 */
export function triggerReflow() {
    _map.invalidateSize()
}

export function addWmsLayer(workspace, id, attribution=null) {
    const canonicalId = `${workspace}:${id}`

    const existingLayer = _wms.find(l => l.canonicalId === canonicalId)
    if (existingLayer) {
        return  // Nothing to do
    }

    console.debug('[primary-map] Adding WMS layer "%s"', canonicalId)
    const newLayer = L.tileLayer.wms(`/wms/${workspace}`, {
        layers:      id,
        transparent: true,
        format:      'image/png',
        attribution,
    })
    newLayer.canonicalId = canonicalId
    _wms.addLayer(newLayer)

    // Notify subscribers
    _wms.fire(EVENT_WMS_CHANGE)
}

export function toggleWmsLayer(workspace, id, attribution=null) {
    const canonicalId = `${workspace}:${id}`

    const existingLayer = _wms.find(l => l.canonicalId === canonicalId)
    if (existingLayer) {
        console.debug('[primary-map] Removing WMS layer "%s"', canonicalId)
        _wms.removeLayer(existingLayer)

        // Notify subscribers
        _wms.fire(EVENT_WMS_CHANGE)
    }
    else {
        addWmsLayer(workspace, id, attribution)
    }
}

/**
 * @param {Function} callback -
 * @returns {function()} Returns an "unsubscribe" function
 */
export function subscribeToWmsLayerChanges(callback) {
    if (typeof callback !== 'function') {
        throw new Error('callback must be a function')
    }

    _wms.on(EVENT_WMS_CHANGE, callback)

    return () => _wms.off(EVENT_WMS_CHANGE, callback)  // Allow unsubscribe
}

/**
 * @returns {string[]} -
 */
export function getWmsLayers() {
    console.debug('[primary-map] Listing all WMS layers')
    return _wms.map(l => l.canonicalId)
}

/**
 * @returns {string[]} -
 */
export function getBasemaps() {
    console.debug('[primary-map] Listing all basemap layers')
    return Object.keys(BASEMAP_LAYERS)
}

/**
 * @returns {string} -
 */
export function getBasemap() {
    return sessionStorage.getItem(KEY_BASEMAP) || DEFAULT_BASEMAP
}

export function setBasemap(basemap) {
    const incoming = BASEMAP_LAYERS[basemap]
    if (incoming === _currentBasemap) {
        return  // Nothing to do
    }

    console.debug('[primary-map] Set basemap to "%s"', basemap)
    _currentBasemap.remove()
    _currentBasemap = incoming
    _currentBasemap.addTo(_map)
    sessionStorage.setItem(KEY_BASEMAP, basemap)

    window.__basemap__ = _currentBasemap  // DEBUG
}

/**
 * @returns {void}
 */
export function clearDelegate() {
    if (!_delegate) {
        return
    }

    _delegate.destroy()
    _delegate = null

    window.__delegate__ = _delegate  // DEBUG
}

/**
 * The concept of a "delegate" lets consumers add and remove clusters of layers/interactions
 * to a Leaflet map instance in a uniform manner.  This helps keep map-related code that is
 * specific to an "*Operation" component co-located with that component.
 *
 * @param {{install: Function, destroy: Function}} delegate -
 * @returns {void}
 */
export function setDelegate(delegate) {
    if (!delegate) {
        throw new Error('missing "delegate" argument')
    }
    if (delegate && typeof delegate.destroy !== 'function') {
        throw new Error('DelegateConstructor must define a `destroy` method')
    }
    if (delegate && typeof delegate.install !== 'function') {
        throw new Error('DelegateConstructor must define a `install` method')
    }

    clearDelegate()

    _delegate = delegate
    _delegate.install(_map)

    window.__delegate__ = _delegate  // DEBUG
}


//
// Helpers
//

function createBasemapLayers() {
    const layers = {}

    if (!Array.isArray(window.BASEMAPS)) {
        throw new Error('window.BASEMAPS must be an array of basemap definitions')
    }

    if (!window.BASEMAPS.length) {
        throw new Error('window.BASEMAPS cannot be empty')
    }

    const defaultBasemap = window.BASEMAPS[0].name
    window.BASEMAPS.forEach(basemap => {
        layers[basemap.name] = L.tileLayer(`/basemaps/${basemap.id}/{z}/{x}/{y}.png`, {
            attribution: basemap.attributions,
            maxZoom:     basemap.max_zoom,
            zIndex:      BASEMAP_Z_INDEX,
        })
    })

    return [layers, defaultBasemap]
}
