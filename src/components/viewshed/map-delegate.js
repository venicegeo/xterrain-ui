import L from 'leaflet'

import { clearDelegate, setDelegate, flyToBounds } from '../../primary-map'

import pointMarkerImage from '../../images/point_marker.svg'

const POINT_MARKER_ICON = L.icon({
    iconUrl: pointMarkerImage,
    iconSize: [30, 15],
    iconAnchor: [14, 15],
})

const FOOTPRINT_CLASS = 'Viewshed__mapPointFootprint'


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
            console.debug('[viewshed:map-delegate] Installing')

            _map = map
            map.on('click', onMapClick)

            _features = L.featureGroup()
            _features.addTo(_map)

            _onPointCreated = onPointCreated
        },
        destroy() {
            console.debug('[viewshed:map-delegate] Destroying')

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
 * @param {number} radius -
 * @returns {void}
 */
export function renderPoint({ point, radius }) {

    const latlng = { lat: point.latitude, lng: point.longitude }

    _features
        .clearLayers()
        .addLayer(L.marker(latlng, {
            icon: POINT_MARKER_ICON,
        }))
        .addLayer(L.circle(latlng, {
            className: FOOTPRINT_CLASS,
            radius,
        }))
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
