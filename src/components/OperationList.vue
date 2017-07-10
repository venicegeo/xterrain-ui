<template>
    <div
        :class="{
            'OperationList': true,
            'OperationList--isOpen': isOpen,
        }"
        @click="toggleOpen">
        <div class="OperationList__button" title="Click to choose an operation">
            <span class="OperationList__buttonIcon fa fa-flask"/>
            <span class="OperationList__buttonCaption">{{ caption }}</span>
            <span class="OperationList__buttonChevron fa" :class="isOpen ? 'fa-close' : 'fa-chevron-down'"/>
        </div>
        <ul v-if="isOpen" class="OperationList__items">
            <li
                v-for="op in operations"
                :key="op.key"
                :class="{
                    'OperationList__item': true,
                    'OperationList__item--isSelected': op.key === value,
                }"
                @click="onChange(op.key)">
                {{ op.label }}
            </li>
        </ul>
    </div>
</template>

<script>
    import { getAvailableOperations } from './Operation'

    export default {
        data() {
            return {
                isOpen: false,
                operations: getAvailableOperations()
                    .sort((a, b) => a.label < b.label ? -1 : 1),
            }
        },

        computed: {
            caption() {
                const op = getAvailableOperations().find(o => o.key === this.value)
                return op ? op.label : `?? (${this.value})`
            },

            value() {
                return this.$store.state.operation
            },
        },

        methods: {
            onChange(value) {
                this.$store.commit('CHANGE_OPERATION', value)
            },

            toggleOpen() {
                this.isOpen = !this.isOpen
            },
        },
    }
</script>

<style>
    .OperationList {
        position: relative;
        padding: 0 !important;
        border-bottom: 1px solid #333;
    }

    .OperationList__button {
        position: relative;
        padding: 1em 15px;
        font-size: 18px;
        font-weight: 100;
        background-color: hsl(200, 19%, 13%);  /* Based on LimedSpruce */
        color: white;
        cursor: pointer;
    }

    .OperationList__button:hover {
        background-color: hsl(200, 23%, 16%);  /* Based on LimedSpruce */
    }

    .OperationList--isOpen .OperationList__button {
        background-color: #00BCD4 !important;
    }

    .OperationList__buttonCaption {
        display: block;
        margin: 0 25px;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
    }

    .OperationList__buttonIcon,
    .OperationList__buttonChevron {
        position: absolute;
        bottom: calc(50% - .5em);
    }

    .OperationList__buttonIcon {
        left: 15px;
    }

    .OperationList__buttonChevron {
        right: 15px;
    }

    .OperationList__items {
        list-style: none;
        margin: 0;
        padding: 0;
        background-color: hsl(200, 19%, 13%);  /* Based on LimedSpruce */
        font-size: 13px;
    }

    .OperationList__item {
        padding: 15px 40px;
        cursor: pointer;
    }

    .OperationList__item:nth-child(odd) {
        background-color: rgba(0,0,0, .05);
    }

    .OperationList__item:hover {
        background-color: rgba(255,255,255, .05);
    }

    .OperationList__item--isSelected {
        background-color: #00BCD4 !important;
        text-shadow: 1px 1px rgba(0,0,0,.1);
        font-weight: bold;
    }

    .OperationList__item--isSelected:hover {
        background-color: hsl(187, 100%, 46%) !important;  /* Based on PacificBlue */
    }

    .OperationList__item--isSelected:first-child {
        box-shadow: inset 0 1px rgba(0,0,0,.2);
    }
</style>
