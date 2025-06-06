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
      // Menyusun dropdown dengan semua tanggal jaga yang pernah dilakukan
      const dateOptions = s.tgl.map(date => `<option value="${date}">${date}</option>`).join('');
      
      html += `
        <tr>
          <td class="border p-2">${s.name}</td>
          <td class="border p-2">
            <select class="p-1 border" disabled>
              ${dateOptions || '<option>-</option>'}
            </select>
          </td>
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
  const angkatanInput = document.getElementById("angkatanInput");
  const tglJagaInput = document.getElementById("tglJagaInput");
  const name = nameInput.value.trim();
  const angkatan = angkatanInput.value.trim();
  const tglJaga = tglJagaInput.value;

  if (!name) return;

  try {
    // Cek apakah siswa sudah ada
    const res = await fetch("/api/students");
    const students = await res.json();
    const existingStudent = students.find(student => student.name === name && student.angkatan === angkatan);

    if (existingStudent) {
      // Update count dan tanggal jaga jika sudah ada
      await fetch(`/api/students/${existingStudent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          count: existingStudent.count + 1,
          tgl: tglJaga
        })
      });
    } else {
      // Tambah siswa baru jika belum ada
      await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, angkatan, tgl: tglJaga })
      });
    }

    nameInput.value = "";
    angkatanInput.value = "";
    tglJagaInput.value = "";
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
