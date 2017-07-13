<template>
    <button class="BigButton" @click="emitClick">
        <slot/>
    </button>
</template>

<script>
    export default {
        props: {
            'onClick': Function,
        },

        methods: {
            emitClick() {
                if (!this.onClick) {
                    console.warn('[BigButton] No `onClick` handler is registered...')
                    return
                }

                this.onClick()
            }
        },
    }
</script>

<style>
    .BigButton {
        display: block;
        margin: 0 auto;
        padding: .75em;
        width: 85%;
        background-color: #00BCD4;
        border: none;
        color: white;
        border-radius: 2px;
        box-shadow:
            0 3px #00838F,
            0 -1px hsl(187, 100%, 45%);  /* Based on PacificBlue */
        font-size: 20px;
        font-family: inherit;
        text-transform: uppercase;
        letter-spacing: .1em;
        cursor: pointer;
        outline: none;
    }

    .BigButton:hover {
        background-color: hsl(187, 100%, 45%);  /* Based on PacificBlue */
    }

    .BigButton:active {
        background-color: #00838F;
        box-shadow: 0 -2px hsl(185, 100%, 18%);  /* Based on BlueLagoon */
        transform: translateY(2px);
    }

    .BigButton:disabled {
        background-color: #333;
        color: #888;
        box-shadow: none;
        transform: none;
        cursor: not-allowed;
    }
</style>
