<template>
  <div class="m-2 mb-40">
    <!-- <h1 class="text-2xl text-center">Class View</h1> -->

    <div class="flex justify-center">
      <h1 class="font-bold text-center mt-2 text-2xl">
        {{selectedDate.toDateString()}}</h1>

    </div>

    <div class="flex justify-center mt-6">
      <Datepicker v-model="selectedDate" class="w-full" inline auto-apply :enable-time-picker="false"
        :highlight="highlightedDates" @update:modelValue="handleDate">

      </Datepicker>
    </div>



    <div v-if="dayIsRegistered==null" class="flex justify-center items-center mt-12">
      <div class="animate-ping  w-8 h-8 bg-primary rounded-full">

      </div>
    </div>

    <div v-if="dayIsRegistered!=null">

      <button v-if="dayIsRegistered==false" class="btn btn-seccondary my-4 w-full"
        @click.once="createDayAndAttendances()">Create Lesson</button>


      <div v-if="dayIsRegistered==true" class="mt-4">
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
                class="checkbox checkbox-primary btn px-6 btn-primary" @change="updateAttendance(student.id)" />
            </div>
          </div>
        </ul>

        <div class="m-2 flex justify-end">
          <div class="cursor-pointer underline text-sm text-red-400 text-left" @click="deleteDay()"> delete lesson</div>
        </div>

        <!-- <button class=" btn btn-primary mt-4 w-full" @click="updateAttendances()">Save Changes</button> -->
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
      .eq("days.date", bringDateToFormat(selectedDate.value))
      .order('id', { ascending: false });

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
    // dayIsRegistered.value = null
    const { data, error } = await supabase
      .from("days")
      .select(`
        *
      `)
      .eq("class_id", classID)
      .eq("date", bringDateToFormat(selectedDate.value));

    if (error) throw error;
    console.log("isDayRegistered: ", (data.length > 0));

    // dayIsRegistered.value =
    return (data.length > 0)
  } catch (error) {
    console.log("Error on isDayRegistered: ", error);
  }
}

const createDayAndAttendances = async () => {
  try {

    const { data, error } = await supabase
      .from("days").insert([{
        date: selectedDate.value.toISOString().split('T')[0],
        class_id: classID,
        user_id: user._rawValue.id
      }])
    if (error) throw error;
    dayID.value = data[0].id

    highlightedDates.value.push(bringDateToFormat(selectedDate.value))

    const res3 = await supabase
      .from("students")
      .select()
      .eq("class_id", classID);

    if (res3.error) throw res3.error;
    console.log("Students of Class: ", res3.data, "ClassID", classID)


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
    console.log("creating Attendances: ", res2.data)
    await getStudentsAndAttendances()
    dayIsRegistered.value = true
    // console.log("createDay: ", data, data2, error, error2);
  } catch (error) {
    console.log("Error on createDay: ", error);
  }
}

// const updateAttendances = async () => {
//   try {

//     const { data, error } = await supabase
//       .from('attendances')
//       .upsert(
//         students.value.map(x => {
//           return {
//             id: x.attendance_id,
//             class_id: classID,
//             day_id: dayID.value,
//             student_id: x.id,
//             attended: x.attended
//           }
//         })
//       )
//     if (error) throw error;
//     console.log("updateAttendances: ", data, error);

//     // dayIsRegistered.value = (data.length > 0)
//   } catch (error) {
//     console.log("Error on updateAttendances: ", error);
//   }
// }


const updateAttendance = async (changedID) => {
  try {

    const { data, error } = await supabase
      .from('attendances')
      .upsert(
        students.value.filter(x => x.id == changedID).map(x => {
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
    console.log("updateAttendance: ", data, error);

    // dayIsRegistered.value = (data.length > 0)
  } catch (error) {
    console.log("Error on updateAttendance: ", error);
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
    highlightedDates.value = highlightedDates.value.filter(date => (date != bringDateToFormat(selectedDate.value)))
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
      .eq("date", bringDateToFormat(selectedDate.value));

    if (error) throw error;
    console.log("getDateID: ", data, error);
    dayID.value = data[0].id;
  } catch (error) {
    console.log("Error on getDateID: ", error);
  }
};

const checkBeforeGetting = async () => {
  dayIsRegistered.value = null
  if (await isDayRegistered()) {
    await getDateID()
    await getStudentsAndAttendances();
    dayIsRegistered.value = true
  }
  else {
    dayIsRegistered.value = false
  }
}

const bringDateToFormat = (yourDate) => {
  const offset = yourDate.getTimezoneOffset()
  yourDate = new Date(yourDate.getTime() - (offset * 60 * 1000))
  return yourDate.toISOString().split('T')[0]
}

// console.log(bringDateToFormat(new Date("Sun Sep 25 2022 02:46:00 GMT+0300 (Eastern European Summer Time)")))

// Make sure to check modelData type here https://vue3datepicker.com/api/props/#modelvalue
const handleDate = (modelData) => {
  selectedDate.value = modelData;
  console.log(selectedDate.value);
  // isDayRegistered()

  console.log(selectedDate.value)
  console.log(bringDateToFormat(selectedDate.value));
  // isDayRegistered()
  // displayStudentList()

  dayIsRegistered.value = null
  students.value = []
  checkBeforeGetting()
  // getDates();

};
</script>
