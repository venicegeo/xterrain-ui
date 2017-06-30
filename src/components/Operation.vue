<script>
    import GeoRing from './georing/GeoRing.vue'

    const COMPONENTS = {
        'georing': GeoRing,
    }

    export default {
        props: {
            'operation': String,
        },

        computed: {
            operationComponent () {
                return COMPONENTS[this.operation] || null
            },
        },

        render(h) {
            return h(this.operationComponent)
        }
    }
</script>
