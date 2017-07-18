import L from 'leaflet'

export class EnhancedLayerGroup extends L.LayerGroup {

    /**
     * @param {Function} callback -
     * @returns {L.Layer|null} -
     */
    find(callback) {
        let layer = null
        this.eachLayer(l => {
            if (layer) {
                return  // Nothing to do; layer already found
            }

            if (callback(l)) {
                layer = l
            }
        })
        return layer
    }

    /**
     * @param {Function} callback -
     * @returns {L.Layer[]} -
     */
    filter(callback) {
        return this._asArray().filter(callback)
    }

    /**
     * @param {Function} callback -
     * @returns {*[]} -
     */
    map(callback) {
        return this._asArray().map(callback)
    }

    //
    // Internals
    //

    /**
     * @returns {L.Layer[]} -
     * @private
     */
    _asArray() {
        const layers = []
        this.eachLayer(l => layers.push(l))
        return layers
    }
}

/**
 * Convert a point to a bounding box with a predefined buffer
 *
 * @param {{latitude: number, longitude: number}} point -
 * @param {number} padding Buffer size (in decimal degrees)
 * @returns {L.LatLngBounds} -
 */
export function toBounds({ latitude, longitude }, padding = 1.0) {
    return L.latLngBounds(
        {
            lng: longitude - padding,
            lat: latitude - padding,
        },
        {
            lng: longitude + padding,
            lat: latitude + padding
        },
    )
}
