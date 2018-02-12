<template>
    <div class="modal-container" v-if="modals.length > 0">
        <div v-for="(modal, index) in modals">}
            <div v-bind:class="{ active: index === modals.length - 1 }" class="modal-shadow">
                <component
                        :is="modal.component"
                        :data="modal.data"
                        @close="closeModal"
                ></component>
            </div>
        </div>
    </div>
</template>
<script src="./component.js"/>
<style lang="scss" scoped>
    @import './style.scss';
</style>
