<template>
  <div class="shell">
    <header>
      <h1>Vaktija TV - Administracija obavijesti</h1>
      <p>Uredi tekstove koji se prikazuju na TV ekranu.</p>
    </header>

    <section v-if="locked" class="card">
      <h2>Pristup</h2>
      <label>
        PIN
        <input v-model="pinInput" type="password" placeholder="Unesite PIN" />
      </label>
      <button @click="unlock">Otključaj</button>
      <p v-if="pinError" class="error">Pogrešan PIN.</p>
    </section>

    <section v-else class="card">
      <div class="toolbar">
        <h2>Obavijesti</h2>
        <div class="actions">
          <button @click="addItem">Dodaj obavijest</button>
          <button class="ghost" @click="reload">Osvježi</button>
        </div>
      </div>

      <div>
        <div v-for="(item, index) in announcements" :key="index" class="item">
          <input v-model="announcements[index]" />
          <button class="danger" @click="removeItem(index)">Obriši</button>
        </div>
      </div>

      <div class="footer">
        <button @click="save">Sačuvaj</button>
        <button class="ghost" @click="reload">Vrati zadano</button>
        <span class="status">{{ status }}</span>
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import config from "../config/appConfig";
import { fetchAnnouncements } from "../services/announcementService";

const locked = ref(true);
const pinInput = ref("");
const pinError = ref(false);
const status = ref("");
const announcements = ref([]);

const endpoint = config.announcements.endpoint;
const adminPin = config.announcements.adminPin;

const setStatus = (message) => {
  status.value = message;
  setTimeout(() => {
    if (status.value === message) status.value = "";
  }, 3000);
};

const loadAnnouncements = async () => {
  try {
    announcements.value = await fetchAnnouncements(endpoint);
  } catch {
    announcements.value = [];
  }
};

const unlock = async () => {
  pinError.value = false;
  if (adminPin && pinInput.value !== adminPin) {
    pinError.value = true;
    return;
  }
  locked.value = false;
  await loadAnnouncements();
};

const addItem = () => {
  announcements.value.push("");
};

const removeItem = (index) => {
  announcements.value.splice(index, 1);
};

const reload = async () => {
  await loadAnnouncements();
  setStatus("Osvježeno.");
};

const save = async () => {
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-pin": adminPin || ""
      },
      body: JSON.stringify({ announcements: announcements.value })
    });

    if (!response.ok) {
      throw new Error("Neuspješno snimanje");
    }

    setStatus("Sačuvano.");
  } catch {
    setStatus("Greška pri snimanju.");
  }
};

onMounted(() => {
  document.body.classList.add("admin-body");
});
</script>
