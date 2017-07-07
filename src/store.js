import Vue from 'vue'
import Vuex from 'vuex'

import { getClient, onExpired } from './utils/session'

const POLL_FREQUENCY_BUSY = 10000
const POLL_FREQUENCY_IDLE = 300000

const KEY_IS_LOGGED_IN = 'IS_LOGGED_IN'


Vue.use(Vuex)


const store = new Vuex.Store({
    strict: true,

    state: {
        operation: 'viewshed',

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
            state.operation = value
        },

        FETCH_ANALYTICS_START(state) {
            state.analytics = { ...state.analytics, isFetching: true }
        },

        FETCH_ANALYTICS_SUCCESS(state, analytics) {
            state.analytics = { ...state.analytics, items: analytics, isFetching: false }
        },

        FETCH_ANALYTICS_FAIL(state) {
            state.analytics = { ...state.analytics, isFetching: false }
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

onExpired(() => {
    store.commit('SESSION_EXPIRED')
})

window.__store__ = store  // DEBUG

export default store
