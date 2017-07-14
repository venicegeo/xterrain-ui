<template>
    <div class="PrimaryMap" tabindex="1">
        <div class="PrimaryMap__map" ref="map"/>
        <img class="PrimaryMap__watermark" src="../images/gs_banner.png"/>
        <LayerPicker/>
    </div>
</template>

<script>
    import 'leaflet-draw/dist/leaflet.draw.css'

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

    /* =========================================================================
       Leaflet
       ========================================================================= */

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
        box-sizing: content-box;
    }

    .leaflet-bar a:hover {
        background-color: #E0F7FA !important;
    }

    .leaflet-tooltip {
        padding: 5px 15px !important;
        font-size: 14px !important;
    }

    /* Leaflet: leaflet-draw
       ========================================================================= */

    .leaflet-draw-toolbar a {
        background-image: url(../images/leaflet_draw_toolbar_sprites.svg) !important;
    }

    .leaflet-draw-toolbar .leaflet-disabled,
    .leaflet-draw-toolbar .leaflet-disabled:hover {
        opacity: .35 !important;
        background-color: white !important;
        cursor: not-allowed;
    }

    .leaflet-draw-actions a {
        height: 30px !important;
        line-height: 30px !important;
        background-color: #607D8B;
        color: #ECEFF1;
        border-color: white;
        font-family: inherit;
    }

    .leaflet-draw-actions a:hover {
        background-color: #00BCD4;
        color: white;
    }

    .leaflet-draw-guide-dash {
        width: 3px;
        height: 3px;
        background-color: white !important;
        box-shadow: 1px 1px rgba(0,0,0, .35);
        opacity: .8 !important;
    }

    .leaflet-editing-icon {
        border-radius: 50%;
        background-color: #00BCD4;
        border: 2px solid white;
        box-shadow: 1px 1px rgba(0,0,0, .35);
    }

    .leaflet-draw-tooltip {
        background-color: white;
        color: black;
        font-family: inherit;
        font-size: 14px;
        opacity: .7;
    }

    .leaflet-draw-tooltip:before {
        border-right-color: white;
    }

    .leaflet-draw-tooltip-subtext {
        color: #607D8B;
    }
</style>
