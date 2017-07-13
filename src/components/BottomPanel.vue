<template>
    <div class="BottomPanel">
        <slot>BottomPanel</slot>
        <div class="BottomPanel__expandButton" @click="toggleExpanded">
            <i class="fa" :class="isExpanded ? 'fa-chevron-down' : 'fa-chevron-up'"/>
        </div>
    </div>
</template>

<script>
    import { triggerReflow } from '../primary-map'

    export default {
        data() {
            return {
                isExpanded: false,
            }
        },
        mounted() {
            document.body.classList.add('BottomPanel--isOpen')
            triggerReflow()
        },
        beforeDestroy() {
            document.body.classList.remove('BottomPanel--isOpen')
            document.body.classList.remove('BottomPanel--isExpanded')
            triggerReflow()
        },
        methods: {
            toggleExpanded() {
                this.isExpanded = !this.isExpanded
                document.body.classList.toggle('BottomPanel--isExpanded')
            },
        },
    }
</script>

<style>
    .BottomPanel {
        z-index: 2;
        position: absolute;
        bottom: 0;
        left: 400px;
        right: 0;
        background-color: #111;
        border-top: 1px solid #333;
        height: 25vh;
        transition: height ease .2s;
    }

    .BottomPanel--isOpen .PrimaryMap {
        bottom: 25vh !important;
    }

    .BottomPanel--isExpanded .PrimaryMap {
        bottom: 60vh !important;
    }

    .BottomPanel--isExpanded .BottomPanel {
        height: 60vh;
    }

    .BottomPanel__expandButton {
        z-index: 5;
        position: absolute;
        top: 5px;
        right: 5px;
        width: 24px;
        height: 24px;
        text-align: center;
        font-size: 14px;
        background-color: rgba(255,255,255, .15);
        border-radius: 2px;
        cursor: pointer;
    }

    .BottomPanel__expandButton:hover {
        background-color: rgba(255,255,255, .3);
    }
</style>
