<script setup>
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import Navigation from "./components/Navigation.vue"
</script>

<template>

    <!-- <div class="col-12">
          <div id="nav">
              <router-link to="/">Home</router-link> |
              <router-link to="/class-settings">Class Settings</router-link>
          </div>
      </div> -->

    <Navigation>
        <router-view :key="$route.path" />
    </Navigation>



</template>

<style scoped>

</style>
