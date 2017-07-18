import ConnectedViewshed from './connected_viewshed/ConnectedViewshed.vue'
import CostDistance from './cost_distance/CostDistance.vue'
import GeoRing from './georing/GeoRing.vue'
import GeoRingBatch from './georing_batch/GeoRingBatch.vue'
import UnknownOperation from './UnknownOperation.vue'
import Viewshed from './viewshed/Viewshed.vue'

const AVAILABLE_COMPONENTS = {
    'connected_viewshed': ConnectedViewshed,
    'cost_distance': CostDistance,
    'georing': GeoRing,
    'georing_batch': GeoRingBatch,
    'viewshed': Viewshed,
}

export function getAvailableOperations() {
    return Object
        .keys(AVAILABLE_COMPONENTS)
        .sort()
        .map(key => ({
            key,
            label: AVAILABLE_COMPONENTS[key].LABEL,
        }))
}

export default {
    computed: {
        operationComponent () {
            return AVAILABLE_COMPONENTS[this.$store.state.operation] || UnknownOperation
        },
    },

    render(h) {
        return h(this.operationComponent)
    },
}
