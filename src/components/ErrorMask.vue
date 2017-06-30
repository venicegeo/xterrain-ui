<template>
    <div class="ErrorMask">
        <div class="ErrorMask__content">
            <h1><i class="fa fa-warning"/> {{ heading }}</h1>
            <p>{{ message }}</p>
            <button @click="onDismiss">{{ dismissText || 'Dismiss' }}</button>
        </div>
    </div>
</template>

<script>
    export default {
        props: {
            'dismissText': String,
            'heading': String,
            'message': String,
            'onDismiss': Function,
        },
    }
</script>

<style>
    .ErrorMask {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        background-color: hsla(14, 82%, 46%, .85);  /* Based on TiaMaria */
        overflow-y: auto;
    }

    .ErrorMask__content {
        position: absolute;
        top: 30%;
        left: 20%;
        right: 20%;
        max-width: 50em;
    }

    .ErrorMask h1 {
        margin: 0;
        font-weight: 100;
        font-size: 2em;
        text-transform: uppercase;
    }

    .ErrorMask p {
        margin: 2em 0;
        line-height: 2em;
    }

    .ErrorMask button {
        padding: .5em 1.5em;
        font-size: inherit;
        border-radius: 2px;
        outline: none;
        border: 0 solid hsl(14, 82%, 90%);  /* Based on TiaMaria */
        border-top-width: 1px;
        border-bottom-width: 3px;
        color: #d54215;
        background-color: white;
    }

    .ErrorMask button:hover {
        background-color: hsl(14, 82%, 97%);  /* Based on TiaMaria */
    }

    .ErrorMask button:active {
        background-color: hsl(14, 82%, 80%);  /* Based on TiaMaria */
        border-color: hsl(14, 82%, 70%);  /* Based on TiaMaria */
        border-top-width: 3px;
        border-bottom-width: 1px;
    }
</style>
