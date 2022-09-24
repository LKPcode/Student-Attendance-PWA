<template>
  <div class="m-2 mb-40">
    <!-- <h1 class="text-2xl text-center">Class View</h1> -->

    <div class="flex justify-center mt-6">
      <Datepicker v-model="selectedDate" class="w-full" inline auto-apply :enable-time-picker="false"
        :highlight="highlightedDates" @update:modelValue="handleDate">

      </Datepicker>
    </div>
    <div class="flex justify-center">
      <h1 class="text-lg font-bold text-center m-4 p-6 badge  badge-primary badge-outline">
        {{selectedDate.toDateString()}}</h1>

    </div>

    <div v-if="dayIsRegistered==null" class="flex justify-center items-center mt-12">
      <div class="animate-ping  w-8 h-8 bg-primary rounded-full">

      </div>
    </div>

    <div v-if="dayIsRegistered!=null">

      <button v-if="dayIsRegistered==false" class="btn btn-seccondary my-4 w-full"
        @click="createDayAndAttendances()">Create Lesson</button>


      <div v-if="dayIsRegistered==true">
        <ul class="menu w-full p-2  rounded-box bg-primary/20">
          <li class="menu-title">
            <span>Students</span>
          </li>

          <div v-for="student in students" :key="student.id" class="form-control mt-2">
            <!-- <div class="form-control mt-2"> -->
            <div class="input-group">
              <!-- <input type="checkbox" checked="checked" class="checkbox checkbox-primary btn px-6 btn-primary " /> -->

              <div class="
              text-center
              grow
              text-lg
              font-bold
              flex
              justify-center
              items-center
              bg-primary/20
            ">
                {{ student.fullname }}
              </div>

              <input v-model="student.attended" type="checkbox" checked="checked"
                class="checkbox checkbox-primary btn px-6 btn-primary" />
            </div>
          </div>
        </ul>

        <div class="m-2 flex justify-end">
          <div class="cursor-pointer underline text-sm text-red-400 text-left" @click="deleteDay()"> delete lesson</div>
        </div>

        <button class="btn btn-primary mt-4 w-full" @click="updateAttendances()">Save Changes</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import Datepicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";

import useSupabase from "@/composables/UseSupabase";
import useAuthUser from "@/composables/UseAuthUser";
import { useRoute } from "vue-router";

import addDays from 'date-fns/addDays';

const { supabase } = useSupabase();
const { user } = useAuthUser();
const route = useRoute();

const classID = route.params.id;
const dayID = ref("")

const selectedDate = ref(new Date());
const highlightedDates = ref([])
const dayIsRegistered = ref(false)
// const dayGettingCreated = ref(false)



const students = ref([]);


const getStudentsAndAttendances = async () => {
  try {
    const { data, error } = await supabase
      .from("attendances")
      .select(`
        *,
        students!inner(*),
        days!inner(*)
      `)
      .eq("class_id", classID)
      .eq("days.date", addDays(selectedDate.value, 1).toISOString().split('T')[0]);

    if (error) throw error;

    console.log("getStudentsAndAttendances: ", data, error);


    students.value = data.map(x => {
      return {
        id: x.students.id,
        fullname: x.students.fullname,
        attended: x.attended,
        attendance_id: x.id
      }
    });

  } catch (error) {
    console.log("Error on getStudentsAndAttendances: ", error);
  }
};

const getDates = async () => {
  try {
    const { data, error } = await supabase
      .from("days")
      .select(`
        *,
        classes!inner(*)
      `)
      .eq("class_id", classID);
    if (error) throw error;
    console.log("getDates: ", data, error);
    highlightedDates.value = data.map(day => day.date);
  } catch (error) {
    console.log("Error on getDates: ", error);
  }
};
getDates();

const isDayRegistered = async () => {
  try {
    dayIsRegistered.value = null
    const { data, error } = await supabase
      .from("days")
      .select(`
        *
      `)
      .eq("class_id", classID)
      .eq("date", addDays(selectedDate.value, 1).toISOString().split('T')[0]);

    if (error) throw error;
    console.log("isDayRegistered: ", (data.length > 0));

    dayIsRegistered.value = (data.length > 0)
    return dayIsRegistered.value
  } catch (error) {
    console.log("Error on isDayRegistered: ", error);
  }
}

const createDayAndAttendances = async () => {
  try {

    const { data, error } = await supabase
      .from("days").insert([{
        date: addDays(selectedDate.value, 1).toISOString().split('T')[0],
        class_id: classID,
        user_id: user._rawValue.id
      }])
    if (error) throw error;
    dayID.value = data[0].id


    const res3 = await supabase
      .from("students")
      .select()
      .eq("class_id", classID);

    if (res3.error) throw res3.error;
    console.log("Data3: ", res3.data, "ClassID", classID)


    highlightedDates.value.push(addDays(selectedDate.value, 1).toISOString().split('T')[0])
    const res2 = await supabase
      .from("attendances").insert(
        res3.data.map(x => {
          return {
            attended: true,
            class_id: classID,
            student_id: x.id,
            day_id: dayID.value
          }
        })
      )
    if (res2.error) throw res2.error;
    await getStudentsAndAttendances()
    dayIsRegistered.value = true
    // console.log("createDay: ", data, data2, error, error2);
  } catch (error) {
    console.log("Error on createDay: ", error);
  }
}

const updateAttendances = async () => {
  try {

    const { data, error } = await supabase
      .from('attendances')
      .upsert(
        students.value.map(x => {
          return {
            id: x.attendance_id,
            class_id: classID,
            day_id: dayID.value,
            student_id: x.id,
            attended: x.attended
          }
        })
      )
    if (error) throw error;
    console.log("updateAttendances: ", data, error);

    dayIsRegistered.value = (data.length > 0)
  } catch (error) {
    console.log("Error on updateAttendances: ", error);
  }
}


const deleteDay = async () => {
  try {

    console.log(students.value.map(x => x.attendance_id))
    const { data, error } = await supabase
      .from('attendances')
      .delete()
      .in('id', students.value.map(x => x.attendance_id))

    if (error) throw error;
    console.log("deleteDay: ", data, error);

    const res2 = await supabase
      .from('days')
      .delete()
      .in("id", [dayID.value])

    console.log(dayID.value)
    if (res2.error) throw res2.error;

    dayIsRegistered.value = false
    highlightedDates.value = highlightedDates.value.filter(date => (date != addDays(selectedDate.value, 1).toISOString().split('T')[0]))
  } catch (error) {
    console.log("Error on deleteDay: ", error);
  }
}


const getDateID = async () => {
  try {
    const { data, error } = await supabase
      .from("days")
      .select(`
        *
      `)
      .eq("date", addDays(selectedDate.value, 1).toISOString().split('T')[0]);

    if (error) throw error;
    console.log("getDateID: ", data, error);
    dayID.value = data[0].id;
  } catch (error) {
    console.log("Error on getDateID: ", error);
  }
};

const checkBeforeGetting = async () => {

  if (await isDayRegistered()) {
    await getDateID()
    getStudentsAndAttendances();
  }
}

// Make sure to check modelData type here https://vue3datepicker.com/api/props/#modelvalue
const handleDate = (modelData) => {
  selectedDate.value = modelData;
  console.log(selectedDate.value);
  // isDayRegistered()

  console.log(selectedDate.value)
  console.log(addDays(selectedDate.value, 1).toISOString().split('T')[0]);
  // isDayRegistered()
  // displayStudentList()
  dayIsRegistered.value = null
  students.value = []
  checkBeforeGetting()
  // getDates();

};
</script>
