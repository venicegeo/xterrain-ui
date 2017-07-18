import L from 'leaflet'

import { clearDelegate, setDelegate, flyToBounds } from '../../primary-map'
import { toBounds } from '../../utils/leaflet-helpers'

import pointMarkerImage from '../../images/point_marker.svg'

const POINT_MARKER_ICON = L.icon({
    iconUrl: pointMarkerImage,
    iconSize: [30, 15],
    iconAnchor: [14, 15],
})

const FOOTPRINT_CLASS = 'CostDistance__mapPointFootprint'


/** @type L.FeatureGroup */
let _features = null

/**
 * @callback
 * @param {{ latitude: number, longitude: number }} point
 */
let _onPointCreated = null


export function activate({ onPointCreated }) {
    /** @type L.Map */
    let _map = null

    setDelegate({
        install(map) {
            console.debug('[cost_distance:map-delegate] Installing')

            _map = map
            map.on('click', onMapClick)

            _features = L.featureGroup()
            _features.addTo(_map)

            _onPointCreated = onPointCreated
        },
        destroy() {
            console.debug('[cost_distance:map-delegate] Destroying')

            _onPointCreated = null

            _map.off('click', onMapClick)
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
 * @param {{ latitude: number, longitude: number }} point -
 * @param {number} distance -
 * @returns {void}
 */
export function renderPoint({ point, distance }) {
    const latlng = { lat: point.latitude, lng: point.longitude }
    const bounds = toBounds(point, distance)

    if (_features.marker) {
        _features.marker.setLatLng(latlng)
    }
    else {
        _features.marker = L.marker(latlng, {
            icon: POINT_MARKER_ICON,
        }).addTo(_features)

    }

    if (_features.footprint) {
        _features.footprint.setBounds(bounds)
    }
    else {
        _features.footprint = L.rectangle(bounds, {
            className: FOOTPRINT_CLASS,
        }).addTo(_features)
    }
}


export function computeBounds(point, distance) {
    return toBounds(point, distance)
        .toBBoxString()
        .split(',')
        .map(parseFloat)
}


//
// Internals
//

/**
 * @param {L.MouseEvent} event -
 * @returns {void}
 */
function onMapClick(event) {
    _onPointCreated({
        longitude: event.latlng.lng,
        latitude: event.latlng.lat,
    })
}
