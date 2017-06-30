<template>
    <li
        class="RunningAnalyticListItem"
        :class="{
            'RunningAnalyticsListItem--success': analytic.status === 'Ready',
            'RunningAnalyticsListItem--error': analytic.status === 'Error',
            'RunningAnalyticsListItem--pending': analytic.status === 'Pending',
            'RunningAnalyticsListItem--running': analytic.status === 'Processing',
        }"
        @click="isExpanded = !isExpanded"
    >
        <div class="RunningAnalyticsListItem__header">
            <span class="RunningAnalyticsListItem__statusOrb"/>
            <div class="RunningAnalyticsListItem__name">{{ analytic.name }}</div>
            <div class="RunningAnalyticsListItem__details">
                <span class="RunningAnalyticsListItem__status">{{ analytic.status }}</span>
                <span class="RunningAnalyticsListItem__age" :title="analytic.created_on">{{ analytic.created_on | age }}</span>
            </div>
            <span class="RunningAnalyticsListItem__chevron">
                <i class="fa fa-chevron" :class="isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'"/>
            </span>
        </div>
        <div class="RunningAnalyticsListItem__progressbar">
            <span class="RunningAnalyticsListItem__progressbarPuck" :style="progressbarStyle"/>
        </div>
        <ul v-if="isExpanded" class="RunningAnalyticsListItem__layers">
            <li class="RunningAnalyticsListItem__layer" v-for="layer in analytic.layers">
                <span class="RunningAnalyticsListItem__layerName">{{ layer.name }}</span>
                <span class="RunningAnalyticsListItem__layerStatus">{{ layer.status }}</span>
            </li>
        </ul>
    </li>
</template>

<script>
    import moment from 'moment'

    export default {
        props: {
            'analytic': Object,
        },

        data() {
            return {
                isExpanded: false,
            }
        },

        filters: {
            'age'(timestamp) {
                return moment(timestamp).fromNow()
            }
        },

        computed: {
            progressbarStyle() {
                return {
                    width: ((this.analytic.layers.filter(l => l.status === 'Ready').length / this.analytic.layers.length) * 100) + '%'
                }
            },
        },
    }
</script>

<style>
    .RunningAnalyticListItem {
        position: relative;
        background-color: #222;
        border-bottom: 1px solid #333;
        cursor: pointer;
    }

    .RunningAnalyticsListItem__header {
        padding: 15px 45px 15px 30px;
    }

    .RunningAnalyticsListItem__statusOrb {
        position: absolute;
        top: 22px;
        left: 15px;
        display: inline-block;
        vertical-align: baseline;
        width: .65em;
        height: .65em;
        border-radius: 50%;
        background-color: currentColor;
    }

    .RunningAnalyticsListItem--success .RunningAnalyticsListItem__statusOrb {
        background-color: #4CAF50;
    }

    .RunningAnalyticsListItem--error .RunningAnalyticsListItem__statusOrb,
    .RunningAnalyticsListItem--timedOut .RunningAnalyticsListItem__statusOrb {
        background-color: #D84315;
    }

    .RunningAnalyticsListItem--pending .RunningAnalyticsListItem__statusOrb,
    .RunningAnalyticsListItem--running .RunningAnalyticsListItem__statusOrb {
        background-color: #FDD835;
        animation: alternate infinite forwards RunningAnalyticsListItem__orbBlink 2s;
    }

    @keyframes RunningAnalyticsListItem__orbBlink {
        0%, 35% {
            opacity: 1;
        }
        100% {
            opacity: 0;
        }
    }

    .RunningAnalyticsListItem__chevron {
        position: absolute;
        top: 15px;
        right: 15px;
        color: #444;
    }

    .RunningAnalyticsListItem__name {
        font-size: 17px;
        font-weight: 200;
    }

    .RunningAnalyticsListItem__details {
        position: relative;
        margin-top: 5px;
        font-size: 12px;
        color: #757575;
    }

    .RunningAnalyticsListItem__status {
        text-transform: uppercase;
    }

    .RunningAnalyticsListItem__age {
        cursor: help;
        position: absolute;
        top: 0;
        right: 0;
        text-align: right;
    }

    .RunningAnalyticsListItem__layers {
        list-style: none;
        margin: 0;
        padding: 0;
        background-color: #111;
        color: #777;
        font-size: 12px;
    }

    .RunningAnalyticsListItem__layer {
        padding: 5px 5px 5px 30px;
    }

    /* HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK */
    /* HACK -- clearfix for IE */
    .RunningAnalyticsListItem__layer:after {
        clear: both;
        content: '';
        display: block;
    }
    /* HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK */

    .RunningAnalyticsListItem__layerStatus {
        float: right;
    }

    .RunningAnalyticsListItem__layer + .RunningAnalyticsListItem__layer {
        border-top: 1px solid #222;
    }

    .RunningAnalyticsListItem__progressbar {
        position: relative;
        width: 100%;
        height: 2px;
        background-color: #222;
    }

    .RunningAnalyticsListItem__progressbarPuck {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        width: 50%;
        background-color: #00BCD4;
        transition: width linear 1s;
    }
</style>
