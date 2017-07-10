<template>
    <div class="UnknownOperation">
        <SidePanel>
            <div class="UnknownOperation__placeholder">
                <h1>No such operation as <code>"{{ operation }}"</code></h1>
                <p>
                    It is possible that the operation either never existed or has been removed/renamed.
                    Please contact the XTerrain team for technical support if needed.
                </p>
            </div>
        </SidePanel>
    </div>
</template>

<script>
    import SidePanel from './SidePanel.vue'

    export default {
        components: {
            SidePanel,
        },

        data() {
            return {
                operation: this.$store.state.operation,
            }
        },
    }
</script>

<style>
    .UnknownOperation__placeholder {
        padding: 100px 15px;
        background-color: #D84315;
        text-shadow: 1px 1px rgba(0,0,0, .1);
    }

    .UnknownOperation__placeholder h1 {
        font-size: 30px;
        line-height: 30px;
        margin-bottom: .5em;
        font-weight: 100;
    }

    .UnknownOperation__placeholder p {
        font-size: 16px;
        line-height: 24px;
        opacity: .5;
    }
</style>
