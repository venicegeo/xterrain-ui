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
