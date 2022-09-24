<script setup>
import useAuthUser from "@/composables/UseAuthUser";
// import ok from "../composables/test"
import { ref } from 'vue'

const { register } = useAuthUser()

const credentials = ref({
  email: "",
  password: ""
})

const eventSignup = () => {
  try {
    register(credentials.value)
  }
  catch (error) {
    console.log(error)
  }
}
</script>

<template>
  <div class="flex justify-center items-center ">
    <div class="mt-36">
      <h1 class="text-center font-bold text-[35px] m-4 ">Sign Up</h1>

      <div class="form-control">
        <label class="input-group">
          <span>Email</span>
          <input v-model="credentials.email" type="text" placeholder="e-mail" class="input input-bordered grow" />
        </label>
      </div>

      <div class="form-control mt-4">
        <label class="input-group">
          <span>Password</span>
          <input v-model="credentials.password" type="text" placeholder="password" class="input input-bordered grow" />
        </label>
      </div>
      <button class="btn btn-primary w-full mt-4" @click="eventSignup">Sign Up</button>
    </div>
  </div>
</template>
