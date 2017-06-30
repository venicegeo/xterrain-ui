<template>
    <label class="SourceList">
        <span class="SourceList__caption">Source</span>
        <select ref="select" @change="emitChange">
            <optgroup label="Digital Elevation Model" v-if="includesElevation">
                <option value="ASTER">ASTER</option>
                <option value="NED">NED</option>
                <option value="SRTM">SRTM</option>
            </optgroup>
            <optgroup label="High Resolution Elevation" v-if="includesHiResElevation">
                <option value="HAITI_LIDAR">HAITI LIDAR</option>
                <option value="CALTECH_LIDAR">CALTECH LIDAR</option>
                <option value="HALFDOME_LIDAR">HALFDOME LIDAR</option>
                <option value="EUGENE_LIDAR">EUGENE LIDAR</option>
                <option value="VRICON_RIO">VRICON - RIO</option>
                <option value="VRICON_DC">VRICON - DC</option>
                <option value="VRICON_NY">VRICON - NY</option>
            </optgroup>
            <optgroup label="Friction Surface" v-if="includesFriction">
                <option value="TOBLER1">TOBLER1</option>
                <option value="TOBLER2">TOBLER2</option>
                <option value="TOBLER3">TOBLER3</option>
                <option value="TOBLER4">TOBLER4</option>
                <option value="TOBLER5">TOBLER5</option>
            </optgroup>
        </select>
    </label>
</template>

<script>
    import {
        SOURCE_ELEVATION,
        SOURCE_HI_RES_ELEVATION,
        SOURCE_FRICTION_SURFACE,
    } from '../constants'

    export default {
        props: {
            groups: Array,
            onChange: Function,
        },
        mounted() {
            this.emitChange()
        },
        computed: {
            includesElevation() {
                return this.groups.indexOf(SOURCE_ELEVATION) !== -1
            },
            includesHiResElevation() {
                return this.groups.indexOf(SOURCE_HI_RES_ELEVATION) !== -1
            },
            includesFriction() {
                return this.groups.indexOf(SOURCE_FRICTION_SURFACE) !== -1
            },
        },
        methods: {
            emitChange() {
                this.onChange(this.$refs.select.value)
            }
        },
    }
</script>
