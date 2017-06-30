<template>
    <span
        class="SortCaret"
        :class="{
            'SortCaret--isActive': isActive,
            'SortCaret--isAscending': isAscending,
            'SortCaret--isDescending': isDescending,
        }">
        <i class="fa fa-sort-asc"/>
        <i class="fa fa-sort-desc"/>
    </span>

</template>

<script>
    export default {
        props: {
            'sort': Object,
            'activeWhen': String,
        },
        computed: {
            isActive() {
                return this.sort.field === this.activeWhen
            },
            isAscending() {
                return this.isActive && this.sort.ascending
            },
            isDescending() {
                return this.isActive && !this.sort.ascending
            },
        },
    }
</script>

<style>
    .SortCaret {
        display: inline-block;
        vertical-align: middle;
        position: relative;
        width: 1em;
        height: 1em;
        font-size: 1em;
        color: rgba(255, 255, 255, .2);
    }

    .SortCaret--isActive {
        color: rgba(255, 255, 255, .5);
    }

    .SortCaret .fa {
        position: absolute;
        top: 50%;
        left: 50%;
        text-align: center;
        transform: translate(-50%, -50%);
    }

    .SortCaret--isAscending .fa-sort-asc {
        color: white;
    }

    .SortCaret--isDescending .fa-sort-desc {
        color: white;
    }
</style>
