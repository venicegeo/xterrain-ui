<template>
    <nav class="Navigation">
        <div class="Navigation__left">
            <span class="Navigation__title">xTERRAIN</span>
            <span class="Navigation__subtitle">A GEOINT Services Capability</span>
        </div>
        <div class="Navigation__right" v-if="user.isLoggedIn">
            <span class="Navigation__username">{{ user.name || '???' }}</span> |
            <a href="/auth/logout" class="Navigation__logout">Log Out</a>
        </div>
    </nav>
</template>

<script>
    import { mapState } from 'vuex'

    export default {
        computed: mapState(['user']),
    }
</script>

<style>
    .Navigation {
        z-index: 4;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 50px;
        overflow: hidden;
        background-color: #263238;
        border-bottom: 1px solid #444;
        color: white;
        font-size: 14px;
    }

    /*
      2017-02-15 -- Using absolute positioning for the internals because of
      requirement to support IE; if that's dropped, switch to flexbox.
     */
    .Navigation__left,
    .Navigation__right {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 50%;
        line-height: 50px;
    }

    .Navigation__left {
        left: 0;
        padding-left: 1em;
    }

    .Navigation__right {
        right: 0;
        padding-right: 1em;
        text-align: right;
    }

    .Navigation__title {
        font: 500 18px 'Open Sans';
        line-height: 50px;
    }

    .Navigation__username {
        font-weight: bold;
    }

    .Navigation__logout {
        display: inline-block;
        line-height: 50px;
        color: #607D8B;
    }

    .Navigation__subtitle {
        color: #757575;
        font-size: 12px;
    }

    .Navigation__subtitle:before {
        content: '|';
        margin: 0 .5em;
    }
</style>
