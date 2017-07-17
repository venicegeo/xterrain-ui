import L from 'leaflet'

import 'leaflet-draw'

import { clearDelegate, setDelegate, flyToBounds } from '../../primary-map'


const POLYLINE_CLASSNAME = 'ConnectedViewshed__mapLinestring'
const MIN_VERTICES = 2


/** @type L.Control.Draw */
let _drawControl

/** @type L.FeatureGroup */
let _features = null

/**
 * @callback
 * @param {{ latitude: number, longitude: number }[]} point
 */
let _onPointsChanged = null


export function activate({ onPointsChanged }) {
    /** @type L.Map */
    let _map = null

    setDelegate({
        install(map) {
            console.debug('[connected-viewshed:map-delegate] Installing')

            _map = map

            _features = L.featureGroup()

            _features.addTo(_map)

            _drawControl = new L.Control.Draw({
                draw: {
                    polyline: {
                        guidelineDistance: 10,
                        shapeOptions: {
                            weight: 1,
                            className: POLYLINE_CLASSNAME,
                        },
                    },
                    polygon: false,
                    circle: false,
                    point: false,
                    marker: false,
                    rectangle: false,
                },
                edit: {
                    featureGroup: _features,
                },
            })

            _map
                .on('draw:created', onDrawCreated)
                .on('draw:deleted', onDrawDeleted)
                .on('draw:edited', onDrawEdited)

            _drawControl.addTo(_map)

            _onPointsChanged = onPointsChanged
        },
        destroy() {
            console.debug('[connected-viewshed:map-delegate] Destroying')

            _onPointsChanged = null

            _map
                .off('draw:created', onDrawCreated)
                .off('draw:deleted', onDrawDeleted)
                .off('draw:edited', onDrawEdited)
            _map = null

            _drawControl.remove()

            _features.remove()
            _features.clearLayers()
            _features.off()
            _features = null
        },
    })
}

export function deactivate() {
    clearDelegate()
}

export function recenter() {
    flyToBounds(_features.getBounds())
}

export function computeBounds(points) {
    return L.polyline(points.map(p => ({ lat: p.latitude, lng: p.longitude })))
        .getBounds()
        .toBBoxString()
        .split(',')
        .map(parseFloat)
}

/**
 * @param {{ latitude: number, longitude: number }[]} points -
 * @returns {void}
 */
export function renderPoints(points) {
    _features.clearLayers()

    if (!points.length) {
        return  // Nothing to do
    }

    console.debug('[connected-viewshed:map-delegate] Rendering linestring of %d vertices', points.length)
    const layer = L.polyline(points.map(p => ({ lat: p.latitude, lng: p.longitude })), {
        className: POLYLINE_CLASSNAME,
    })

    _features.addLayer(layer)
}


//
// Internals
//

function onDrawCreated(event) {
    const points = event.layer.getLatLngs().map(ll => ({ latitude: ll.lat, longitude: ll.lng }))

    if (points.length < MIN_VERTICES) {
        return  // Don't emit garbage
    }

    _onPointsChanged(points)
}

function onDrawDeleted() {
    _onPointsChanged([])
}

function onDrawEdited(event) {
    const [layer] = event.layers.getLayers()
    const points = layer.getLatLngs().map(ll => ({ latitude: ll.lat, longitude: ll.lng }))
    _onPointsChanged(points)
}
