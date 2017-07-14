import Vue from 'vue'
import Vuex from 'vuex'

import { getClient, onExpired } from './utils/session'

const POLL_FREQUENCY_BUSY = 10000
const POLL_FREQUENCY_IDLE = 300000

const DEFAULT_OPERATION = 'viewshed'
const KEY_IS_LOGGED_IN = 'IS_LOGGED_IN'


Vue.use(Vuex)


const store = new Vuex.Store({
    strict: true,

    state: {
        operation: location.hash.substr(1).trim() || DEFAULT_OPERATION,

        user: {
            isLoggedIn: JSON.parse(sessionStorage.getItem(KEY_IS_LOGGED_IN)) || false,
            name: null,
        },

        analytics: {
            items: [],
            isFetching: false,
            pollingFrequency: null,
            pollingRef: null,
            subscriptions: [],
        },

        sources: {
            items: [],
            isFetching: false,
        },

        errors: [],
    },

    mutations: {
        ANALYTIC_CREATED(state, analytic) {
            state.analytics = {
                ...state.analytics,
                items: [...state.analytics.items, analytic],
                subscriptions: [...state.analytics.subscriptions, analytic.id],
            }
        },

        ANALYTIC_UNSUBSCRIBED(state, analyticId) {
            state.analytics.subscriptions = state.analytics.subscriptions.filter(id => id !== analyticId)
        },

        CHANGE_ANALYTICS_POLLING(state, { frequency, ref }) {
            state.analytics = {
                ...state.analytics,
                pollingFrequency: frequency,
                pollingRef: ref,
            }
        },

        SESSION_DETECTED(state, user) {
            state.user.name = user.name
            state.user.isLoggedIn = true
            sessionStorage.setItem(KEY_IS_LOGGED_IN, true)
        },

        SESSION_EXPIRED(state) {
            state.user.isLoggedIn = false
            sessionStorage.clear()
        },

        CHANGE_OPERATION(state, value) {
            value = value.trim()
            state.operation = value
            location.hash = value
        },

        FETCH_ANALYTICS_START(state) {
            state.analytics.isFetching = true
        },

        FETCH_ANALYTICS_SUCCESS(state, analytics) {
            state.analytics.items = analytics
            state.analytics.isFetching = false
        },

        FETCH_ANALYTICS_FAIL(state) {
            state.analytics.isFetching = false
        },

        FETCH_SOURCES_START(state) {
            state.sources.isFetching = true
        },

        FETCH_SOURCES_SUCCESS(state, sources) {
            state.sources.items = sources
            state.sources.isFetching = false
        },

        FETCH_SOURCES_FAIL(state) {
            state.sources.isFetching = false
        },

        APPEND_ERROR(state, { heading, message }) {
            state.errors = [...state.errors, { heading, message }]
        },

        DISMISS_ERROR(state, err) {
            state.errors = state.errors.filter(e => e !== err)
        },
    },

    getters: {
        completedAnalytics(state) {
            return state.analytics.items.filter(a => a.status === 'Ready')
        },

        isLoadingSources(state) {
            return state.sources.isFetching
        },

        isSessionActive(state) {
            return state.user.isLoggedIn
        },

        runningAnalytics(state) {
            return state.analytics.items.filter(a => a.status.match(/Pending|Processing/i))
        },

        subscribedAnalytics(state) {
            return state.analytics.subscriptions.map(id => state.analytics.items.find(a => a.id === id))
        },
    },

    actions: {
        appendError(context, { heading, message }) {
            context.commit('APPEND_ERROR', { heading, message })
        },

        appendNewAnalytic(context, analytic) {
            context.commit('ANALYTIC_CREATED', analytic)
            context.dispatch('changeAnalyticsPolling', POLL_FREQUENCY_BUSY)
        },

        changeAnalyticsPolling(context, frequency) {
            if (context.state.analytics.pollingFrequency === frequency) {
                return  // Nothing to do
            }

            if (context.state.analytics.pollingRef === null) {
                console.debug('[store] Start polling for analytics (at %s seconds)', Math.round(frequency / 1000))
            }
            else {
                console.debug('[store] Update analytics polling rate (at %s seconds)', Math.round(frequency / 1000))
                clearInterval(context.state.analytics.pollingRef)
            }

            const ref = setInterval(() => {
                context.dispatch('fetchAnalytics', { enablePolling: true })
            }, frequency)

            context.commit('CHANGE_ANALYTICS_POLLING', { frequency, ref })
        },

        disableAnalyticsPolling(context) {
            console.debug('[store] Disabling analytics polling')

            clearTimeout(context.state.analytics.pollingRef)
            context.commit('CHANGE_ANALYTICS_POLLING', {
                pollingFrequency: null,
                pollingRef: null,
            })
        },

        fetchAnalytics(context, { enablePolling } = {}) {
            context.commit('FETCH_ANALYTICS_START')
            return getClient().get('/api/analytics')
                .then(response => {
                    context.commit('FETCH_ANALYTICS_SUCCESS', response.data.analytics)

                    if (enablePolling) {

                        // Adjust polling interval based on workload
                        const frequency = response.data.analytics.some(a => a.status.match(/Pending|Processing/i))
                            ? POLL_FREQUENCY_BUSY
                            : POLL_FREQUENCY_IDLE

                        context.dispatch('changeAnalyticsPolling', frequency)
                    }
                })
                .catch(err => {
                    context.commit('FETCH_ANALYTICS_FAIL')

                    if (err.response && err.response.status === 401) {
                        return
                    }

                    console.error('[store] Error fetching analytics list:', err)
                    context.commit('APPEND_ERROR', {
                        heading: 'Cannot list analytics',
                        message: err.response
                            ? 'An unknown server error prevents us from listing your analytics.'
                            : `An application error prevents us from listing your analytics (${err.message})`,
                    })
                })
        },

        fetchSources(context) {
            context.commit('FETCH_SOURCES_START')
            return getClient().get('/api/sources')
                .then(response => {
                    context.commit('FETCH_SOURCES_SUCCESS', response.data.sources)
                })
                .catch(err => {
                    context.commit('FETCH_SOURCES_FAIL')

                    if (err.response && err.response.status === 401) {
                        return
                    }

                    context.commit('APPEND_ERROR', {
                        heading: 'Could not fetch user profile',
                        message: err.response
                            ? `An unknown server error prevents us from looking up your profile (HTTP ${err.response.status})`
                            : `An application error prevents us from looking up your profile (${err.message})`,
                    })
                })
        },

        fetchUserProfile(context) {
            return getClient().get('/auth/whoami')
                .then(response => {
                    context.commit('SESSION_DETECTED', {
                        name: response.data.user.name,
                    })
                })
                .catch(err => {
                    if (err.response && err.response.status === 401) {
                        return
                    }

                    context.commit('APPEND_ERROR', {
                        heading: 'Could not fetch user profile',
                        message: err.response
                            ? `An unknown server error prevents us from looking up your profile (HTTP ${err.response.status})`
                            : `An application error prevents us from looking up your profile (${err.message})`,
                    })
                })
        },
    },
})

console.debug('[store] Subscribing to session expiration event')
onExpired(() => {
    store.commit('SESSION_EXPIRED')
})

console.debug('[store] Subscribing to browser hash navigation event')
window.addEventListener('popstate', () => {
    const operation = location.hash.substr(1).trim() || DEFAULT_OPERATION
    if (store.state.operation !== operation) {
        store.commit('CHANGE_OPERATION', operation)
    }
})

window.__store__ = store  // DEBUG

export default store
