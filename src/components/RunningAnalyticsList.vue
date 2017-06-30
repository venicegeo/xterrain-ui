<template>
    <div class="RunningAnalyticsList">
        <h2 class="RunningAnalyticsList__header">My Running Analytics ({{ analytics.length }})</h2>
        <ul class="RunningAnalyticsList__items">
            <RunningAnalyticListItem
                v-for="analytic in analytics"
                :key="analytic.id"
                :analytic="analytic"
            />
            <li v-if="!analytics.length" class="RunningAnalyticsList__placeholder">No items pending or processing</li>
        </ul>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex'

    import RunningAnalyticListItem from './RunningAnalyticListItem.vue'


    export default {
        components: {
            RunningAnalyticListItem,
        },

        computed: mapGetters({
            'analytics': 'runningAnalytics',
        }),
    }
</script>

<style>
    .RunningAnalyticsList {
        overflow: hidden;
    }

    .RunningAnalyticsList__header {
        padding: 15px;
        background-color: #333;
        text-transform: uppercase;
        font-size: 14px;
    }

    .RunningAnalyticsList__items {
        list-style: none;
        margin: 0;
        padding: 0;
    }

    .RunningAnalyticsList__placeholder {
        list-style: none;
        color: #333;
        background-color: #111;
        padding: 2em 0;
        text-align: center;
        font-size: 16px;
        font-weight: 100;
    }
</style>
