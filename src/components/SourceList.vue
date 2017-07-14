<template>
    <label class="SourceList">
        <span class="SourceList__caption">Data Source</span>
        <span class="SourceList__controls">
            <select v-model="internalValue">
                <optgroup label="Digital Elevation Model" v-if="includesElevation">
                    <option
                        v-for="source in elevationSources"
                        :key="source.id"
                        :value="source.id">
                        {{ source.name }}
                    </option>
                </optgroup>
                <optgroup label="Friction Surface" v-if="includesFriction">
                    <option
                        v-for="source in frictionSources"
                        :key="source.id"
                        :value="source.id">
                        {{ source.name }}
                    </option>
                </optgroup>
            </select>
            <button
                :class="{
                    'SourceList__showFootprintButton': true,
                    'SourceList__showFootprintButton--isActive': isShowingFootprint,
                }"
                :disabled="!internalValue"
                @click="toggleFootprint"
                :title="`Click to ${isShowingFootprint ? 'hide' : 'show'} coverage area for this data source`">
                <i class="fa" :class="isShowingFootprint ? 'fa-eye-slash' : 'fa-eye'"/>
            </button>
        </span>
    </label>
</template>

<script>
    import axios from 'axios'
    import { mapMutations } from 'vuex'

    import {
        getSourceFootprintId,
        setSourceFootprint,
        clearSourceFootprint,
    } from '../primary-map'

    import {
        SOURCE_GROUP_ELEVATION,
        SOURCE_GROUP_FRICTION,
    } from '../constants'

    export default {
        props: {
            'groups': Array,
            'onChange': Function,
        },

        data() {
            return {
                internalValue: null,
                isShowingFootprint: !!getSourceFootprintId(),
            }
        },

        mounted() {
            this.checkInternalValue()
        },

        computed: {
            allSources() {
                return this.$store.state.sources.items
            },

            elevationSources() {
                return this.allSources.filter(s => s.group_id === SOURCE_GROUP_ELEVATION)
            },

            frictionSources() {
                return this.allSources.filter(s => s.group_id === SOURCE_GROUP_FRICTION)
            },

            firstAvailableSource() {
                return this.allSources
                    .filter(s => this.groups.indexOf(s.group_id) !== -1)
                    .shift()
            },

            includesElevation() {
                return this.groups.indexOf(SOURCE_GROUP_ELEVATION) !== -1
            },

            includesFriction() {
                return this.groups.indexOf(SOURCE_GROUP_FRICTION) !== -1
            },
        },

        watch: {
            allSources() {
                this.checkInternalValue()
            },

            internalValue() {
                if (this.isShowingFootprint) {
                    this.toggleFootprint()
                }
                this.onChange(this.internalValue)
            },
        },

        methods: {
            ...mapMutations({
                'onError': 'APPEND_ERROR',
            }),

            checkInternalValue() {
                if (!this.internalValue && this.firstAvailableSource) {
                    this.internalValue = this.firstAvailableSource.id
                }
            },

            toggleFootprint() {
                const sourceId = this.internalValue

                if (sourceId === getSourceFootprintId()) {
                    clearSourceFootprint()
                    this.isShowingFootprint = false
                    return
                }

                axios.get(`/api/sources/${sourceId}`)
                    .then(response => {
                        setSourceFootprint({
                            sourceId,
                            geojson: response.data,
                            className: 'SourceList',
                        })
                        this.isShowingFootprint = true
                    })
                    .catch(err => {
                        const {response} = err
                        this.onError({
                            heading: 'Could not fetch and render data source footprint',
                            message: response
                                ? `A server error prevents the retrieval of the footprint for
                                   this data source (HTTP ${response.status}${response.data.error ? ': ' + response.data.error : ''}).`
                                : `An application error prevents the retrieval and/or rendering
                                  of the footprint for this data source (${err})`
                        })
                    })
            },
        },
    }
</script>

<style>
    .SourceList__controls {
        display: block;
        position: relative;
        padding-right: 30px;
    }

    .SourceList__showFootprintButton {
        position: absolute;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
        border: none;
        background-color: rgba(255,255,255, .1);
        font-size: 16px;
        color: white;
        border-radius: 3px;
        width: 30px;
        height: 30px;
    }

    .SourceList__showFootprintButton:hover {
        background-color: rgba(255,255,255, .2);
    }

    .SourceList__showFootprintButton--isActive {
        background-color: #FDD835;
        color: rgba(0,0,0, .7);
    }

    .SourceList__showFootprintButton--isActive:hover {
        background-color: hsl(49, 98%, 45%);  /* Based on BrightSun */
        color: black;
    }
</style>
