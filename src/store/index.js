import Vuex from 'vuex'
import axios from 'axios'


const POLL_FREQUENCY_BUSY = 10000
const POLL_FREQUENCY_IDLE = 300000


export function createStore () {
    return new Vuex.Store({
        strict: true,
        state: {
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
                return axios.get('/api/analytics')
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
                        console.error('[store] Error fetching analytics list:', err)

                        context.commit('FETCH_ANALYTICS_FAIL')
                        context.commit('APPEND_ERROR', {
                            heading: 'Cannot list analytics',
                            message: err.response
                                ? 'An unknown server error prevents us from listing your analytics.'
                                : `An application error prevents us from listing your analytics (${err.message})`,
                        })
                    })
            },
        },
    })
}
