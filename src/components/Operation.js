import GeoRing from './georing/GeoRing.vue'
import Viewshed from './viewshed/Viewshed.vue'

const AVAILABLE_COMPONENTS = {
    'georing': GeoRing,
    'viewshed': Viewshed,
}

export function getAvailableOperations() {
    return Object
        .keys(AVAILABLE_COMPONENTS)
        .map(key => ({
            key,
            label: AVAILABLE_COMPONENTS[key].LABEL,
        }))
}

export default {
    computed: {
        operationComponent () {
            return AVAILABLE_COMPONENTS[this.$store.state.operation] || null
        },
    },

    render(h) {
        return h(this.operationComponent)
    },
}
