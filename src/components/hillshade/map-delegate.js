import L from 'leaflet'

import 'leaflet-draw'

import { clearDelegate, setDelegate, flyToBounds } from '../../primary-map'


const FOOTPRINT_CLASS = 'Hillshade__mapRectangleFootprint'


/** @type L.Control.Draw */
let _drawControl

/** @type L.FeatureGroup */
let _features = null

/**
 * @callback
 * @param {[number, number, number, number]} rectangle
 */
let _onRectangleChanged = null


export function activate({ onRectangleChanged }) {
    /** @type L.Map */
    let _map = null

    setDelegate({
        install(map) {
            console.debug('[hillshade:map-delegate] Installing')

            _map = map

            _features = L.featureGroup()
            _features.addTo(_map)

            _drawControl = new L.Control.Draw({
                draw: {
                    polyline: false,
                    polygon: false,
                    circle: false,
                    point: false,
                    marker: false,
                    rectangle: {
                        guidelineDistance: 10,
                        shapeOptions: {
                            weight: 1,
                            className: FOOTPRINT_CLASS,
                        },
                    },
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

            _onRectangleChanged = onRectangleChanged
        },
        destroy() {
            console.debug('[hillshade:map-delegate] Destroying')

            _onRectangleChanged = null

            _drawControl.remove()
            _drawControl = null

            _map
                .off('draw:created', onDrawCreated)
                .off('draw:deleted', onDrawDeleted)
                .off('draw:edited', onDrawEdited)
            _map = null

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

/**
 * @param {[number, number, number, number]} rectangle -
 * @returns {void}
 */
export function renderRectangle({ rectangle }) {
    _features.clearLayers()

    if (!rectangle) {
        return  // Nothing to do
    }

    console.debug('[hillshade:map-delegate] Rendering rectangle "%s"', rectangle.join(', '))

    const [minX, minY, maxX, maxY] = rectangle
    L.rectangle(L.latLngBounds({ lng: minX, lat: minY }, { lng: maxX, lat: maxY }), {
        className: FOOTPRINT_CLASS,
    }).addTo(_features)
}


//
// Internals
//

function onDrawCreated(event) {
    _onRectangleChanged(toBoundingBox(event.layer))
}

function onDrawEdited(event) {
    _onRectangleChanged(toBoundingBox(event.layer))
}

function onDrawDeleted(event) {
    _onRectangleChanged(null)
}

function toBoundingBox(layer) {
    return layer
        .getBounds()
        .toBBoxString()
        .split(',')
        .map(parseFloat)
}
