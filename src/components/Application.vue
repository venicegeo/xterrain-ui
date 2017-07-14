<template>
    <main id="Application">
        <Navigation/>
        <PrimaryMap
            class="Application__map"
            v-if="isSessionActive"
        />
        <Operation
            class="Application__operation"
            v-if="isSessionActive"
        />
        <Login
            class="Application__login"
            v-if="!isSessionActive"
        />

        <ErrorMask
            class="Application__errorMask"
            :heading="error.heading"
            :message="error.message"
            :onDismiss="() => onErrorDismissed(error)"
            :key="error"
            v-for="error in errors"
        />

        <LoadingMask
            v-if="isLoadingSources"
            class="Application__loadingMask"
            caption="Loading available data sources"
        />
    </main>
</template>

<script>
    import { mapState, mapMutations, mapActions, mapGetters } from 'vuex'

    import ErrorMask from './ErrorMask.vue'
    import LoadingMask from './LoadingMask.vue'
    import Login from './Login.vue'
    import Navigation from './Navigation.vue'
    import PrimaryMap from './PrimaryMap.vue'
    import Operation from './Operation'

    export default {
        components: {
            ErrorMask,
            LoadingMask,
            Login,
            Navigation,
            PrimaryMap,
            Operation,
        },

        mounted () {
            this.fetchUserProfile()
                .then(() => Promise.all([
                    this.fetchSources(),
                    this.fetchAnalytics({ enablePolling: true }),
                ]))
        },

        computed: {
            ...mapGetters([
                'isSessionActive',
                'isLoadingSources',
            ]),
            ...mapState(['errors']),
        },

        methods: {
            ...mapMutations({
                'onErrorDismissed': 'DISMISS_ERROR',
            }),

            ...mapActions([
                'disableAnalyticsPolling',
                'fetchAnalytics',
                'fetchUserProfile',
                'fetchSources',
            ]),
        },

        watch: {
            isSessionActive() {
                if (!this.isSessionActive) {
                    this.disableAnalyticsPolling()
                }
            },
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

    .Application__map,
    .Application__operation,
    .Application__login {
        top: 50px !important;
    }

    .Application__operation {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
    }

    .Application__operation > * {
        pointer-events: auto;
    }

    .Application__loadingMask {
        z-index: 998;
    }
</style>
