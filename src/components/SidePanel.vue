<template>
    <div class="SidePanel">
        <OperationList class="SidePanel__row"/>
        <slot/>
    </div>
</template>

<script>
    import OperationList from './OperationList.vue'

    export default {
        components: {
            OperationList,
        },
    }
</script>

<style>
    .SidePanel {
        z-index: 3;
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        width: 400px;
        background-color: black;
        border-right: 1px solid #333;
        overflow-y: scroll;
    }

    .SidePanel__row {
        display: block;
        padding: 1em;
    }

    .SidePanel__row:nth-child(odd) {
        background-color: #222;
    }
</style>
