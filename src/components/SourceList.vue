<template>
    <label class="SourceList">
        <span class="SourceList__caption">Data Source</span>
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
    </label>
</template>

<script>
    import { mapGetters, mapMutations } from 'vuex'

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
                this.onChange(this.internalValue)
            },
        },

        methods: {
            checkInternalValue() {
                if (!this.internalValue && this.firstAvailableSource) {
                    this.internalValue = this.firstAvailableSource.id
                }
            },
        },
    }
</script>
