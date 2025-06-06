// Fetch dan tampilkan semua siswa
async function fetchStudents() {
  try {
    const res = await fetch("/api/students");
    const students = await res.json();
    const tbody = document.getElementById("studentTable");

    // Hitung jumlah berdasarkan angkatan
    const count39 = students.filter(s => s.angkatan === '39').length;
    const count40 = students.filter(s => s.angkatan === '40').length;
    const count41 = students.filter(s => s.angkatan === '41').length;

    // Update tampilan kotak statistik
    document.getElementById('count-39').innerText = count39;
    document.getElementById('count-40').innerText = count40;
    document.getElementById('count-41').innerText = count41;

    // Tampilkan siswa ke tabel
    let html = "";
    students.forEach(s => {
      html += `
        <tr>
          <td class="border p-2">${s.name}</td>
          <td class="border p-2">${s.tgl || '-'}</td>
          <td class="border p-2">
            <input type="number" value="${s.count ?? 0}" min="0"
              onchange="updateCount(${s.id}, this.value)" class="w-16 p-1 border" />
          </td>
          <td class="border p-2">
            <button onclick="deleteStudent(${s.id})" class="bg-red-500 text-white px-2 py-1">Hapus</button>
          </td>
        </tr>
      `;
    });
    tbody.innerHTML = html;

  } catch (err) {
    console.error("Gagal memuat data siswa:", err);
  }
}

// Tambah siswa baru (admin saja)
async function addStudent() {
  const nameInput = document.getElementById("nameInput");
  const name = nameInput.value.trim();
  if (!name) return;

  try {
    await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    });
    nameInput.value = "";
    fetchStudents();
  } catch (err) {
    console.error("Gagal menambahkan siswa:", err);
  }
}

// Update jumlah jaga
async function updateCount(id, count) {
  try {
    await fetch(`/api/students/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ count: parseInt(count) })
    });
  } catch (err) {
    console.error("Gagal memperbarui jumlah jaga:", err);
  }
}

// Hapus siswa
async function deleteStudent(id) {
  try {
    await fetch(`/api/students/${id}`, { method: "DELETE" });
    fetchStudents();
  } catch (err) {
    console.error("Gagal menghapus siswa:", err);
  }
}

// Sembunyikan form tambah jika bukan admin
function checkAdmin() {
  const params = new URLSearchParams(window.location.search);
  const isAdmin = params.get("admin") === "true";

  const formEl = document.getElementById("admin-form");
  if (!isAdmin && formEl) {
    formEl.style.display = "none";
  }
}

// Inisialisasi saat halaman dibuka
checkAdmin();
fetchStudents();
