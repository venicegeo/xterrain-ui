<template>
    <div class="DateRange">
        <div class="DateRange__caption">Date Range</div>

        <div class="DateRange__durations">
            <span class="DateRange__duration" @click="duration = 'P100Y'" :class="{'DateRange__duration--active': duration === 'P100Y'}">All</span>
            <span class="DateRange__duration" @click="duration = 'TODAY'" :class="{'DateRange__duration--active': duration === 'TODAY'}">Today</span>
            <span class="DateRange__duration" @click="duration = 'PT24H'" :class="{'DateRange__duration--active': duration === 'PT24H'}">Last 24h</span>
            <span class="DateRange__duration" @click="duration = 'PT48H'" :class="{'DateRange__duration--active': duration === 'PT48H'}">Last 48h</span>
            <span class="DateRange__duration" @click="duration = 'PT72H'" :class="{'DateRange__duration--active': duration === 'PT72H'}">Last 72h</span>
            <span class="DateRange__duration" @click="duration = 'CUSTOM'" :class="{'DateRange__duration--active': duration === 'CUSTOM'}">Custom</span>
        </div>

        <div class="DateRange__dates" v-if="duration === 'CUSTOM'">
            <label>
                <span>From</span>
                <input v-model.lazy.trim="from" :class="{ 'invalid': !isFromValid }"/>
            </label>
            <label>
                <span>To</span>
                <input v-model.lazy.trim="to" :class="{ 'invalid': !isToValid }"/>
            </label>

            <ul class="DateRange__warnings">
                <li v-for="warning in warnings" class="DateRange__message DateRange__message--warning">
                    {{ warning }}
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
    import moment from 'moment'

    const DEFAULT_DURATION = 'P100Y'
    const FORMAT = 'MM/DD/YYYY HH:mm'

    export default {
        props: {
            onChange: Function,
        },
        mounted() {
            this.emitChange()
        },
        data() {
            return {
                duration: DEFAULT_DURATION,
                from: moment().utc().subtract(moment.duration(DEFAULT_DURATION)).startOf('date').format(FORMAT),
                to: moment().utc().endOf('date').format(FORMAT),
            }
        },
        computed: {
            isFromValid() {
                return parseTimestamp(this.from).isValid()
            },
            isToValid() {
                return parseTimestamp(this.to).isValid()
            },
            warnings() {
                const messages = []
                const from = parseTimestamp(this.from)
                const to = parseTimestamp(this.to)

                if (from.isValid() && to.isValid() && from.isAfter(to)) {
                    messages.push('"From" date cannot be after "To" date')
                }

                if (!from.isValid()) {
                    messages.push(`"From" date is not valid; please use the format "${FORMAT}"`)
                }

                if (!to.isValid()) {
                    messages.push(`"To" date is not valid; please use the format "${FORMAT}"`)
                }

                return messages
            },
        },
        watch: {
            duration(value) {
                if (value === 'CUSTOM') {
                    return
                }

                this.to = moment()
                    .utc()
                    .endOf('date')
                    .format(FORMAT)

                if (value === 'TODAY') {
                    this.from = moment()
                        .utc()
                        .startOf('date')
                        .format(FORMAT)
                }
                else {
                    this.from = moment()
                        .utc()
                        .subtract(moment.duration(value))
                        .startOf('hour')
                        .format(FORMAT)
                }
            },
            from() {
                this.emitChange()
            },
            to() {
                this.emitChange()
            },
        },
        methods: {
            emitChange() {
                if (this.warnings.length) {
                    return
                }
                this.onChange(
                    moment.utc(this.from, FORMAT).toISOString(),
                    moment.utc(this.to, FORMAT).toISOString()
                )
            },
        },
    }

    /**
     * @param {string} timestamp -
     * @returns {moment.Moment} -
     */
    function parseTimestamp(timestamp) {
        return moment(timestamp, FORMAT, true)
    }
</script>

<style>
    .DateRange {

    }

    .DateRange__durations {
        display: inline-block;
        margin-top: 10px;
        background-color: #00BCD4;
        border: 1px solid #00BCD4;
        border-radius: 3px;
        overflow: hidden;

        /*
          2017-02-17 -- Using 0-sized font to collapse whitespace because of
          requirement to support IE; if that's dropped, switch to flexbox.
         */
        font-size: 0;
    }

    .DateRange__duration {
        display: inline-block;
        padding: 5px 9px;
        border: 0;
        font: 12px 'Open Sans';
        background-color: #263238;
        color: #757575;
        outline: none;
        cursor: pointer;
    }

    .DateRange__duration:hover {
        background-color: #00838F;
        color: white;
    }

    .DateRange__duration + .DateRange__duration {
        margin-left: 1px;
    }

    .DateRange__duration--active {
        background-color: #00BCD4;
        color: white;
    }

    .DateRange__dates {
        margin-top: 1em;
    }

    .DateRange__dates label {
        display: block;
        padding-left: 3em;
        color: #E0F7FA;
    }

    .DateRange__dates label + label {
        margin-top: 5px;
    }

    .DateRange__dates span {
        display: inline-block;
        min-width: 4em;
    }

    .DateRange__dates input {
        width: 150px;
    }

    .DateRange__warnings {
        font-size: 12px;
        color: #D84315;
    }
</style>
