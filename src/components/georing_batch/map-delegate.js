import L from 'leaflet'

import 'leaflet.markercluster'

import { clearDelegate, setDelegate, flyToBounds } from '../../primary-map'

const CLUSTER_CLASS = 'GeoRingBatch__cluster'
const CLUSTER_BOUNDS_CLASS = 'GeoRingBatch__clusterBounds'
const CLUSTER_TOOLTIP_MAX_IDENTIFIERS = 5
const POINT_CLASS = 'GeoRingBatch__point'
const POINT_CLASS_SELECTED = 'GeoRingBatch__point GeoRingBatch__point--isSelected'
const POINT_CLASS_RELATED = 'GeoRingBatch__point--isRelated'
const TOOLTIP_CLASS = 'GeoRingBatch__pointTooltip'
const TOOLTIP_DIRECTION = 'top'

/** @type L.MarkerClusterGroup */
let _layers


export function activate({ onPointClick }) {
    setDelegate({
        install(map) {
            console.debug('[georing_batch:map-delegate] Installing')
            _layers = createLayerGroup()

            _layers.bindTooltip(l => l.identifier, { className: TOOLTIP_CLASS, direction: TOOLTIP_DIRECTION })

            _layers.on('mouseover', onPointMouseOver)
            _layers.on('mouseout', onPointMouseOut)
            _layers.on('click', (event) => onPointClick(event.layer.identifier))
            _layers.addTo(map)
        },
        destroy() {
            console.debug('[georing_batch:map-delegate] Destroying')
            _layers.remove()
            _layers.clearLayers()
            _layers.off()
            _layers = null
        },
    })
}

export function deactivate() {
    clearDelegate()
}

export function fitContents() {
    flyToBounds(_layers.getBounds())
}

export function renderPoints(records) {
    if (!_layers) {
        throw new Error('this delegate is not activated')
    }

    console.debug('[georing_batch:map-delegate] Rendering points')
    _layers.clearLayers()

    records.forEach(record => {
        const points = record.points.map(([x, y]) => {
            const layer = L.circle({lat: y, lng: x}, {
                className: record.selected ? POINT_CLASS_SELECTED : POINT_CLASS,
            })

            layer.identifier = record.identifier
            layer.selected = record.selected

            return layer
        })

        _layers.addLayers(points)
    })
}


//
// Internals
//

function createLayerGroup() {
    return L.markerClusterGroup({
        disableClusteringAtZoom: 13,
        spiderfyOnMaxZoom: false,
        polygonOptions: {
            className: CLUSTER_BOUNDS_CLASS,
        },
        iconCreateFunction(cluster) {
            const identifiers = cluster.getAllChildMarkers()
                .slice(0, CLUSTER_TOOLTIP_MAX_IDENTIFIERS)
                .map(m => m.identifier)

            let tooltip = identifiers.join(', ')

            const unlistedCount = cluster.getChildCount() - identifiers.length
            if (unlistedCount) {
                tooltip += `, and ${unlistedCount} more...`
            }

            cluster.bindTooltip(tooltip, {
                className: TOOLTIP_CLASS,
                direction: TOOLTIP_DIRECTION,
                offset: [0, -20],
            })

            return L.divIcon({
                className: CLUSTER_CLASS,
                html: `<div>${cluster.getChildCount()}</div>`,
                iconSize: [40, 40],
            })
        },
    })
}

function onPointMouseOver(event) {
    _layers.eachLayer(l => {
        const element = l.getElement()
        if (!element) {
            return  // Nothing is rendered
        }

        if (l.identifier === event.layer.identifier && event.layer !== l) {
            // element.classList.add(POINT_CLASS_RELATED)
            element.setAttribute('class', `${l.selected ? POINT_CLASS_SELECTED : POINT_CLASS} ${POINT_CLASS_RELATED} leaflet-interactive`)  // HACK -- IE11 compat
        }
        else {
            // element.classList.remove(POINT_CLASS_RELATED)
            element.setAttribute('class', `${l.selected ? POINT_CLASS_SELECTED : POINT_CLASS} leaflet-interactive`)  // HACK -- IE11 compat
        }
    })
}

function onPointMouseOut() {
    _layers.eachLayer(l => {
        const element = l.getElement()
        if (!element) {
            return  // Nothing is rendered
        }
        // element.classList.remove(POINT_CLASS_RELATED)
        element.setAttribute('class', `${l.selected ? POINT_CLASS_SELECTED : POINT_CLASS} leaflet-interactive`)  // HACK -- IE11 compat
    })
}
