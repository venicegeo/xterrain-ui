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
    </main>
</template>

<script>
    import { mapState, mapMutations, mapActions, mapGetters } from 'vuex'

    import ErrorMask from './ErrorMask.vue'
    import Login from './Login.vue'
    import Navigation from './Navigation.vue'
    import PrimaryMap from './PrimaryMap.vue'
    import Operation from './Operation'

    export default {
        components: {
            ErrorMask,
            Login,
            Navigation,
            PrimaryMap,
            Operation,
        },

        mounted () {
            this.fetchUserProfile()
                .then(() => this.fetchAnalytics({ enablePolling: true }))
        },

        computed: {
            ...mapGetters(['isSessionActive']),
            ...mapState(['errors']),
        },

        methods: {
            ...mapMutations({
                'onErrorDismissed': 'DISMISS_ERROR',
            }),

            ...mapActions([
                'fetchUserProfile',
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

    .Application__map,
    .Application__operation,
    .Application__login {
        top: 50px !important;
    }
</style>
