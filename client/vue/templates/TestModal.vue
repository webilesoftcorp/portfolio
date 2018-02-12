<template>
    <div class="test-modal">
        <span>{{ data.message }}</span>
        <button @click="$emit('close')">
            Close Modal
        </button>
    </div>
</template>
<script src="./component.js"/>
<style lang="scss" scoped>
    @import './style.scss';
</style>
