<template>
    <main id="Application">
        <PrimaryMap/>
        <Operation
            operation="georing"
        />

        <ErrorMask
            class="Application__errorMask"
            :heading="error.heading"
            :message="error.message"
            :onDismiss="() => onErrorDismissed(error)"
            :key="error"
            v-for="error in errors"
        />
    </main>
</template>

<script>
    import { mapState, mapMutations, mapActions } from 'vuex'

    import ErrorMask from './ErrorMask.vue'
    import PrimaryMap from './PrimaryMap.vue'
    import Operation from './Operation.vue'

    export default {
        components: {
            ErrorMask,
            PrimaryMap,
            Operation,
        },

        mounted () {
            this.fetchAnalytics({ enablePolling: true })
        },

        computed: mapState(['errors']),

        methods: {
            ...mapMutations({
                'onErrorDismissed': 'DISMISS_ERROR',
            }),

            ...mapActions([
                'fetchAnalytics',
            ]),
        },
    }
</script>

<style>
    body {
        overflow: hidden;
    }

    #Application {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        overflow: hidden;
    }

    .Application__errorMask {
        z-index: 999;
    }
</style>
