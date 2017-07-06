<template>
    <label class="OperationList">
        <span class="OperationList__caption">Operation</span>
        <select v-model="currentOperation" @change="onChangeOperation">
            <option
                v-for="operation in operations"
                :key="operation.key"
                :value="operation.key">
                {{ operation.label }}
            </option>
        </select>
    </label>
</template>

<script>
    import { getAvailableOperations } from './Operation'

    export default {
        data() {
            return {
                operations: getAvailableOperations(),
                currentOperation: this.$store.state.operation,
            }
        },

        methods: {
            onChangeOperation(event) {
                this.$store.commit('CHANGE_OPERATION', event.target.value)
            },
        },
    }
</script>
