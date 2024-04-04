<script setup>
import { ref, onMounted } from 'vue'
import axios from "axios";
const el = ref()

const students = ref([]);
let url = "http://localhost:5000"
onMounted(() => {
   axios.get(url + "/students",{
    headers:{
      "Accept":"application/json",
      "Content-Type":"application/json",
      'Access-Control-Allow-Origin': '*',
    }
  }).then(response=>{
     students.value = response.data; // Store the response data in students ref
  }).catch(error=>{
     console.log(error)
   });
})
</script>

<template>
  <div class="flex flex-col items-center">
    <h1 class="text-2xl font-semibold my-5">Students List</h1>
    <div class="w-full max-w-4xl">
      <table class="table-auto w-full">
        <thead>
        <tr class="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
          <th class="py-3 px-6 text-left">Name</th>
          <th class="py-3 px-6 text-left">Age</th>
          <th class="py-3 px-6 text-left">Gender</th>
          <th class="py-3 px-6 text-center">Grade</th>
        </tr>
        </thead>
        <tbody class="text-gray-600 text-sm font-light">
        <tr v-for="student in students" :key="student.id" class="border-b border-gray-200 hover:bg-gray-100">
          <td class="py-3 px-6 text-left whitespace-nowrap">{{ student.name }}</td>
          <td class="py-3 px-6 text-left">{{ student.age }}</td>
          <td class="py-3 px-6 text-left">{{ student.gender }}</td>
          <td class="py-3 px-6 text-center">{{ student.grade }}</td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>


<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>