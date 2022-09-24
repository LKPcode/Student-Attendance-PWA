<template>
  <div class="m-4 mb-20">
    <h1 class="text-2xl text-center">Class Settings</h1>

    <div class="form-control mt-4">
      <div class="input-group">
        <input v-model="newStudent" type="text" placeholder="Student Name" class="input input-bordered grow" />
        <button class="btn btn-primary btn-square" @click="createNewStudent">Add</button>
      </div>
    </div>

    <ul class="menu  w-full p-2 mt-8 rounded-box bg-primary/20">
      <li class="menu-title">
        <span>Students</span>
      </li>

      <div v-for="student in students" :key="student" class="form-control mt-2">
        <div class="input-group">
          <span>{{student.id}}</span>
          <input :value="student.fullname" type="text" placeholder="Student Name" class="input input-bordered grow " />
          <button class="btn btn-primary btn-square text-lg " @click="deleteStudent(student.id)">x</button>
        </div>
      </div>




    </ul>
    <!-- <button class="btn btn-primary mt-4 w-full">Save Changes</button> -->

  </div>
</template>


<script setup>
import useSupabase from "@/composables/UseSupabase";
import { onMounted, ref } from "vue"
import useAuthUser from "@/composables/UseAuthUser";
import { useRoute } from 'vue-router'


const { supabase } = useSupabase()
const { user } = useAuthUser()
const route = useRoute()



const classID = route.params.id
console.log("Class id: ", classID)



const students = ref([])
const getStudents = async () => {
  try {
    const { data, error } = await supabase.from("students").select("*").eq("class_id", classID)
    if (error) throw error
    console.log(data, error)
    students.value = data
  }
  catch (error) {
    console.log("Error on getStudents: ", error)
  }


}
getStudents()


const newStudent = ref("")
const createNewStudent = async () => {
  try {
    const { data, error } = await supabase.from("students").insert([{
      fullname: newStudent.value,
      class_id: classID
    }])
    if (error) throw error
    console.log(data, error)
    students.value.push(data[0])
    newStudent.value = ""
  }
  catch (error) {
    console.log("Error on createNewStudent: ", error)

  }
}

const deleteStudent = async (student_id) => {
  try {
    const { data, error } = await supabase
      .from('students')
      .delete()
      .match({ id: student_id })
    if (error) throw error
    console.log(data, error)
    students.value = students.value.filter(student => (student.id != student_id))
  }
  catch (error) {
    console.log("Error on createNewStudent: ", error)

  }
}

onMounted(() => {
  getStudents()
})


</script>