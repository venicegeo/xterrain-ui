<template>
    <div class="LayerPicker">
        <div class="LayerPicker__button" @click="toggleOpen" :class="{'LayerPicker__button--isActive': isOpen}">
            <svg class="LayerPicker__buttonIcon" preserveAspectRatio="xMinYMin" viewBox="0 0 40 40">
                <g transform="translate(0 4)">
                    <polygon points="36.4644661 17.3228873 40 19.5276993 20 32 0 19.5276993 3.53553391 17.3228873 20 27.5903758 36.4644661 17.3228873"/>
                    <polygon points="40 12.4723007 20 24.9446013 0 12.4723007 20 0"/>
                </g>
            </svg>
            <span v-if="hasNewItems" class="LayerPicker__newItemsOrb" title="New layers available!"/>
        </div>
        <div class="LayerPicker__menu" v-if="isOpen">
            <h2>Basemaps</h2>
            <ul class="LayerPicker__list LayerPicker__list--basemaps">
                <li
                    v-for="basemap in basemaps"
                    :key="basemap.id"
                    @click="changeBasemap(basemap)"
                    class="LayerPicker__listItem LayerPicker__listItem--basemap"
                    :class="{'LayerPicker__listItem--isActive': isActiveBasemap(basemap)}">
                    <span class="LayerPicker__radio"/>
                    <span class="LayerPicker__layerName">{{ basemap }}</span>
                </li>
            </ul>

            <h2>My Analytics</h2>
            <ul class="LayerPicker__list LayerPicker__list--analytics">
                <li
                    v-for="analytic in analytics"
                    :key="analytic.id"
                    :title="analytic.name"
                    @click="toggleAnalyticActivation(analytic)"
                    class="LayerPicker__listItem LayerPicker__listItem--analytic"
                    :class="{
                        'LayerPicker__listItem--isActive': isActiveAnalytic(analytic),
                        'LayerPicker__listItem--isPartiallyActive': isPartiallyActiveAnalytic(analytic),
                    }">
                    <span class="LayerPicker__checkbox"/>
                    <span class="LayerPicker__layerName">{{ analytic.name }}</span>

                    <ul class="LayerPicker__list LayerPicker__list--analyticLayers">
                        <li
                            v-for="layer in analytic.layers"
                            :key="layer.id"
                            :title="layer.name"
                            @click.stop="onLayerClicked(layer)"
                            class="LayerPicker__listItem LayerPicker__listItem--analyticLayer"
                            :class="{
                                'LayerPicker__listItem--isActive': isActiveLayer(layer),
                            }">
                            <span class="LayerPicker__checkbox"/>
                            <span class="LayerPicker__layerName">{{ layer.name }}</span>
                            <a
                                class="LayerPicker__downloadButton LayerPicker__downloadButton--tiff"
                                :href="createUrlforTIFF(layer)"
                                target="_blank"
                                :title="'Download GeoTIFF for ' + layer.name"
                                @click.stop>
                                <i class="fa fa-image"/>
                            </a>
                            <a
                                class="LayerPicker__downloadButton LayerPicker__downloadButton--kmz"
                                :href="createUrlforKMZ(layer)"
                                target="_blank"
                                :title="'Download KMZ for ' + layer.name"
                                @click.stop>
                                <i class="fa fa-archive"/>
                            </a>
                        </li>
                    </ul>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex'
    import {
        getBasemaps,
        getBasemap,
        setBasemap,
        toggleWmsLayer,
        addWmsLayer,
        getWmsLayers,
        subscribeToWmsLayerChanges,
    } from '../primary-map'

    export default {
        data() {
            return {
                activeBasemap: getBasemap(),
                activeWMS:     getWmsLayers(),
                basemaps:      getBasemaps(),
                isOpen:        false,
                hasNewItems:   false,
            }
        },

        mounted() {
            this._unsubscribeWMS = subscribeToWmsLayerChanges(() => {
                console.debug('[LayerPicker] Notified of WMS change')
                this.activeWMS = getWmsLayers()
            })
        },

        beforeDestroy() {
            this._unsubscribeWMS()
        },

        watch: {
            analytics() {
                this.subscriptions.forEach(analytic => {
                    if (analytic.status === 'Ready') {
                        console.debug('[LayerPicker] Rendering watched analytic "%s"', analytic.id)

                        // Notify the user that something has been added
                        if (!this.isOpen) {
                            this.hasNewItems = true
                        }

                        this.toggleAnalyticActivation(analytic)

                        this.$store.commit('ANALYTIC_UNSUBSCRIBED', analytic.id)
                    }
                })
            },
        },

        computed: mapGetters({
            analytics: 'completedAnalytics',
            subscriptions: 'subscribedAnalytics',
        }),

        methods: {
            createUrlforTIFF(layer) {
                return `/api/${layer.operation}/downloads/${layer.id}.TIF`
            },

            createUrlforKMZ(layer) {
                return `/api/${layer.operation}/downloads/${layer.id}.KMZ`
            },

            isActiveAnalytic(analytic) {
                return analytic.layers.every(l => this.isActiveLayer(l))
            },

            isActiveBasemap(basemap) {
                return this.activeBasemap === basemap
            },

            isActiveLayer(layer) {
                return this.activeWMS.includes(`${layer.operation}:${layer.geoserver_id}`)
            },

            isPartiallyActiveAnalytic(analytic) {
                return analytic.layers.some(l => this.isActiveLayer(l))
            },

            onLayerClicked(layer) {
                toggleWmsLayer(layer.operation, layer.geoserver_id)
            },

            changeBasemap(basemap) {
                setBasemap(basemap)
                this.activeBasemap = basemap
            },

            toggleAnalyticActivation(analytic) {
                if (!this.isActiveAnalytic(analytic)) {
                    // Turn all on at the same time
                    analytic.layers.forEach(l => addWmsLayer(l.operation, l.geoserver_id))
                    return
                }

                analytic.layers.forEach(l => toggleWmsLayer(l.operation, l.geoserver_id))
            },

            toggleOpen() {
                this.isOpen = !this.isOpen

                // Dismiss "new items" notification
                if (this.isOpen && this.hasNewItems) {
                    this.hasNewItems = false
                }
            },
        },
    }
</script>

<style>
    .LayerPicker {
        pointer-events: none;
        z-index: 999;
        position: absolute;
        top: 10px;
        right: 10px;
        bottom: 25px;
        width: 400px;
    }

    /* =========================================================================
       Button
       ========================================================================= */

    .LayerPicker__button {
        pointer-events: auto;
        cursor: pointer;
        position: absolute;
        top: 0;
        right: 0;
        width: 30px;
        height: 30px;
        background-color: #fff;
        box-shadow: 2px 2px 10px rgba(0,0,0, .3);
        color: #00BCD4;
    }

    .LayerPicker__button:hover {
        background-color: #E0F7FA;
    }

    .LayerPicker__button--isActive {
        background-color: #00BCD4 !important;
        color: white !important;
    }

    .LayerPicker__buttonIcon {
        position: absolute;
        top: 5px;
        left: 5px;
        width: 20px;
        height: 20px;
        fill: currentColor;
    }

    .LayerPicker__newItemsOrb {
        position: absolute;
        display: inline-block;
        bottom: -10px;
        left: -10px;
        width: 20px;
        height: 20px;
        background-color: #D84315;
        border: 2px solid white;
        border-radius: 50%;
        animation: infinite alternate LayerPicker__orbPulse ease-in 2s;
    }

    @keyframes LayerPicker__orbPulse {
        0%, 85% { transform: scale(1.0); }
        100% { transform: scale(1.4); }
    }

    /* =========================================================================
       Menu
       ========================================================================= */

    .LayerPicker__menu {
        pointer-events: auto;
        cursor: default;
        position: absolute;
        top: 0;
        right: 40px;
        left: 0;
        bottom: 0;
        background-color: #333;
        color: #ccc;
        font-size: 13px;
        box-shadow: 2px 2px 10px rgba(0,0,0, .3);
        overflow-y: auto;
    }

    .LayerPicker__menu h2 {
        padding: 10px;
        font-size: 1em;
        text-transform: uppercase;
        background-color: #444;
        color: white;
    }

    /* =========================================================================
       Layers
       ========================================================================= */

    .LayerPicker__list {
        list-style: none;
        margin: 0;
        padding: 0;
    }

    .LayerPicker__listItem {
        cursor: pointer;
        position: relative;
    }

    .LayerPicker__listItem:hover {
        background-color: rgba(255,255,255,.02);
    }

    .LayerPicker__listItem--isActive {
        background-color: #00BCD4 !important;
        color: white !important;
    }

    .LayerPicker__listItem--isActive + .LayerPicker__listItem--isActive,
    .LayerPicker__listItem--isPartiallyActive + .LayerPicker__listItem--isActive {
        box-shadow: 0 -1px rgba(0,0,0, .15);
    }

    .LayerPicker__radio,
    .LayerPicker__checkbox {
        position: absolute;
        top: 8px;
        left: 25px;
        display: inline-block;
        border: 1px solid;
        background-color: transparent;
        width: 1em;
        height: 1em;
        vertical-align: middle;
    }

    .LayerPicker__radio {
        border-radius: 50%;
    }

    .LayerPicker__listItem--isPartiallyActive > .LayerPicker__checkbox {
        background: linear-gradient(315deg, transparent 50%, currentColor 50%);
    }

    .LayerPicker__listItem--isActive .LayerPicker__radio,
    .LayerPicker__listItem--isActive .LayerPicker__checkbox {
        box-shadow: 1px 1px rgba(0,0,0,.1);
        background-color: currentColor;
    }

    .LayerPicker__listItem--isActive .LayerPicker__layerName {
        text-shadow: 1px 1px rgba(0,0,0,.1);
    }

    .LayerPicker__layerName {
        display: block;
        text-overflow: ellipsis;
        overflow: hidden;
        padding: 5px 60px 5px 45px;
    }

    .LayerPicker__downloadButton,
    .LayerPicker__downloadButton:visited {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        width: 30px;
        background-color: transparent;
        color: inherit;
    }

    .LayerPicker__downloadButton--tiff {
        position: absolute;
        top: 0;
        right: 30px;
        bottom: 0;
        width: 30px;
    }

    .LayerPicker__downloadButton:hover {
        background-color: #00BCD4;
        color: white;
    }

    .LayerPicker__listItem--isActive .LayerPicker__downloadButton:hover {
        background-color: white;
        color: #00BCD4;
    }

    .LayerPicker__downloadButton .fa {
        position: absolute;
        top: 50%;
        right: 8px;
        transform: translateY(-50%);
    }

    /* Layers: Analytics
       ========================================================================= */

    .LayerPicker__listItem--isActive .LayerPicker__listItem--analyticLayer {
        background-color: rgba(0,0,0,.3) !important;
    }

    .LayerPicker__listItem--isActive .LayerPicker__listItem--analyticLayer:first-of-type {
        box-shadow: 0 -1px rgba(0,0,0, .4);
    }

    .LayerPicker__listItem--analyticLayer {
        color: #555;
    }

    .LayerPicker__listItem--analyticLayer .LayerPicker__layerName {
        padding-left: 65px;
    }

    .LayerPicker__listItem--analyticLayer .LayerPicker__checkbox {
        left: 45px;
    }
</style>
