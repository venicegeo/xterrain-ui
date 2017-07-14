<template>
    <div class="PrimaryMap" tabindex="1">
        <div class="PrimaryMap__map" ref="map"/>
        <img class="PrimaryMap__watermark" src="../images/gs_banner.png"/>
        <LayerPicker/>
    </div>
</template>

<script>
    import LayerPicker from './LayerPicker.vue'
    import { init, triggerReflow } from '../primary-map'

    export default {
        components: {
            LayerPicker,
        },

        mounted() {
            init(this.$refs.map)
            setTimeout(triggerReflow, 200)  // Give transitions time to settle
        },
    }
</script>

<style>
    .PrimaryMap {
        z-index: 1;
        position: absolute;
        top: 0;
        left: 400px;
        bottom: 0;
        right: 0;
    }

    .PrimaryMap__map {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: transparent !important;
        font: inherit;
    }

    .PrimaryMap__watermark {
        z-index: 401;
        position: absolute;
        bottom: 15px;
        left: 15px;
        pointer-events: none;
        height: 45px;
        opacity: .4;
    }

    .PrimaryMap__sourceFootprint {
        fill: #FDD835;
        fill-opacity: .2;
        stroke: #FDD835;
        stroke-opacity: 1;
        stroke-width: 2;
        stroke-linecap: miter;
        cursor: inherit;
    }

    .leaflet-bar {
        border-radius: 0 !important;
        border: none !important;
        box-shadow: 2px 2px 10px rgba(0,0,0, .3) !important;
    }

    .leaflet-bar a {
        color: #00BCD4 !important;
        font-weight: 100 !important;
        font-size: 16px !important;
        font-family: monospace !important;
        border-radius: 0 !important;
    }

    .leaflet-bar a:hover {
        background-color: #E0F7FA !important;
    }

    .leaflet-tooltip {
        padding: 5px 15px !important;
        font-size: 14px !important;
    }
</style>
