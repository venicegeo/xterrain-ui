<template>
    <div class="LoadingMask" :class="{ 'LoadingMask--small': small }">
        <div class="LoadingMask__content">
            <div class="LoadingMask__animation">
                <img src="../images/spinner_white_small.gif" v-if="small"/>
                <img src="../images/spinner_white.gif" v-else/>
            </div>
            <div class="LoadingMask__caption" v-if="caption">{{ caption }}</div>
        </div>
    </div>
</template>

<script>
    export default {
        props: {
            'caption': String,
            'small': Boolean,
        },
    }
</script>

<style>
    .LoadingMask {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        background-color: hsla(200, 80%, 10%, 0.93);  /* Based on LimedSpruce */
        font-size: 20px;
        font-weight: 100;
    }

    .LoadingMask--small {
        font-size: 14px;
    }

    .LoadingMask__content {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        max-width: 60%;
    }
</style>
