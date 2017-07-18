import L from 'leaflet'

import { clearDelegate, setDelegate, flyToBounds } from '../../primary-map'

import pointMarkerImage from '../../images/point_marker.svg'

const POINT_MARKER_ICON = L.icon({
    iconUrl: pointMarkerImage,
    iconSize: [30, 15],
    iconAnchor: [14, 15],
})

const INNER_FOOTPRINT_CLASS = 'GeoRing__mapRadius GeoRing__mapRadius--inner'
const OUTER_FOOTPRINT_CLASS = 'GeoRing__mapRadius GeoRing__mapRadius--outer'


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
            console.debug('[georing:map-delegate] Installing')

            _map = map
            map.on('click', onMapClick)

            _features = L.featureGroup()
            _features.addTo(_map)

            _onPointCreated = onPointCreated
        },
        destroy() {
            console.debug('[georing:map-delegate] Destroying')

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
 * @param {number} innerRadius -
 * @param {number} outerRadius -
 * @returns {void}
 */
export function renderPoint({ point, innerRadius, outerRadius }) {

    const latlng = { lat: point.latitude, lng: point.longitude }

    if (_features.marker) {
        _features.marker.setLatLng(latlng)
    }
    else {
        _features.marker = L.marker(latlng, {
            icon: POINT_MARKER_ICON,
        }).addTo(_features)
    }

    if (_features.innerFootprint) {
        _features.innerFootprint
            .setLatLng(latlng)
            .setRadius(innerRadius)
    }
    else {
        _features.innerFootprint = L.circle(latlng, {
            className: INNER_FOOTPRINT_CLASS,
            radius: innerRadius,
        }).addTo(_features)
    }

    if (_features.outerFootprint) {
        _features.outerFootprint
            .setLatLng(latlng)
            .setRadius(outerRadius)
    }
    else {
        _features.outerFootprint = L.circle(latlng, {
            className: OUTER_FOOTPRINT_CLASS,
            radius: outerRadius,
        }).addTo(_features)
    }
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
