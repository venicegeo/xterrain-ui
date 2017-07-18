<template>
    <label class="NumberRange">
        <span class="NumberRange__caption">{{ caption }}</span>
        <span class="NumberRange__controls">
            <input class="NumberRange__slider"  type="range"  v-model="internalValue" :min="min" :step="step" :max="max"/>
            <input class="NumberRange__textbox" type="number" v-model="internalValue" :min="min" :step="step" :max="max"/>
        </span>
    </label>
</template>

<script>
    export default {
        props: {
            'caption': String,
            'value': Number,
            'max': Number,
            'min': Number,
            'onChange': Function,
            'step': {
                type: Number,
                default: 1,
            },
        },

        data() {
            return {
                internalValue: this.value,
            }
        },

        watch: {
            internalValue() {
                this.onChange(
                    Number.isInteger(this.step) && Number.isInteger(this.value)
                        ? parseInt(this.internalValue, 10)
                        : parseFloat(this.internalValue),
                )
            },
        },
    }
</script>

<style>
    .NumberRange {
        display: block;
    }

    .NumberRange__controls {
        position: relative;
        display: block;
        width: 100%;
        height: 2.3em;
    }

    .NumberRange__slider {
        position: absolute;
        top: .7em;
        left: 0;
        right: 0;
        width: calc(100% - 80px);
    }

    .NumberRange__textbox {
        position: absolute;
        top: 0;
        right: 0;
        width: 65px;
        text-align: right;
        opacity: .3;
    }

    .NumberRange__textbox:not(:focus) {
        background-color: transparent !important;
    }

    .NumberRange__textbox:hover,
    .NumberRange__textbox:focus {
        opacity: 1;
    }

</style>
