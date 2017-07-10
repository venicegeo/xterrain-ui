import GeoRing from './georing/GeoRing.vue'
import UnknownOperation from './UnknownOperation.vue'
import Viewshed from './viewshed/Viewshed.vue'

const AVAILABLE_COMPONENTS = {
    'georing': GeoRing,
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
