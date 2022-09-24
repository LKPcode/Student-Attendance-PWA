<template>

  <div>
    <!-- NAVBAR -->
    <div class="navbar bg-base-100">
      <div class="flex-1">

        <label for="my-drawer" class="btn btn-ghost normal-case text-xl">
          Attendance
        </label>


      </div>
      <div class="flex-none">
        <label for="my-drawer" class="btn btn-square btn-ghost">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
            class="inline-block w-5 h-5 stroke-current">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z">
            </path>
          </svg>
        </label>

      </div>
    </div>

    <!-- SIDEBAR DRAWER -->
    <div class="drawer fixed ">
      <input id="my-drawer" type="checkbox" class="drawer-toggle" />
      <div class="drawer-content">
        <slot>
          <!-- Page content here -->
        </slot>
      </div>
      <div class="drawer-side ">
        <label for="my-drawer" class="drawer-overlay"></label>
        <ul class="menu flex-col p-4 overflow-y-auto w-80 bg-base-100 text-base-content mb-16">
          <!-- Sidebar content here -->

          <li v-for="_class in classes" :key="_class.id" class="flex-row justify-between items-center">
            <router-link class="grow" :to="'/class/'+ _class.id"> {{_class.name}} </router-link>
            <router-link class="btn btn-square btn-ghost" :to="'/class-settings/'+ _class.id">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                class="inline-block w-5 h-5 stroke-current">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z">
                </path>
              </svg>
            </router-link>
          </li>

          <!-- CREATE NEW CLASS -->
          <div class="grow"></div>
          <div class="divider">New Class</div>
          <input v-model="newClass" type="text" placeholder="Insert new class Name"
            class="input input-bordered input-primary w-full max-w-xs" />
          <button class="btn btn-primary mt-4" @click="createNewClass()">Create Class</button>

        </ul>


      </div>
    </div>
  </div>
</template>


<script setup>
import useSupabase from "@/composables/UseSupabase";
import { ref } from "vue"
import useAuthUser from "@/composables/UseAuthUser";

const { supabase } = useSupabase()
const { user } = useAuthUser()



const classes = ref([])
const getClasses = async () => {
  try {
    const { data, error } = await supabase.from("classes").select()
    if (error) throw error
    console.log(data, error)
    classes.value = data
  }
  catch (error) {
    console.log("Error on getClasses: ", error)
  }

}
getClasses()


const newClass = ref([])
const createNewClass = async () => {
  try {
    const { data, error } = await supabase.from("classes").insert([{
      name: newClass.value,
      user_id: user._rawValue.id
    }])
    if (error) throw error
    console.log(data, error)
    classes.value.push(data[0])
  }
  catch (error) {
    console.log("Error on createNewClass: ", error)

  }
}

</script>