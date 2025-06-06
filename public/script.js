// --- public/script.js ---
async function fetchStudents() {
  try {
    const res = await fetch("/api/students");
    const students = await res.json();
    const tbody = document.getElementById("studentTable");

    const count39 = students.filter(s => s.angkatan === '39').length;
    const count40 = students.filter(s => s.angkatan === '40').length;
    const count41 = students.filter(s => s.angkatan === '41').length;

    document.getElementById('count-39').innerText = count39;
    document.getElementById('count-40').innerText = count40;
    document.getElementById('count-41').innerText = count41;

    let html = "";
    students.forEach(s => {
      const tanggalOptions = (s.tglList || []).slice().reverse().map(t => `<option>${t}</option>`).join('') || '<option>-</option>';
      html += `
        <tr>
          <td class="border p-2">${s.name}</td>
          <td class="border p-2">
            <select class="border p-1">${tanggalOptions}</select>
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

async function addStudent() {
  const nameInput = document.getElementById("nameInput");
  const angkatanInput = document.getElementById("angkatanInput");
  const tglJagaInput = document.getElementById("tglJagaInput");
  const name = nameInput.value.trim();
  const angkatan = angkatanInput.value.trim();
  const tglJaga = tglJagaInput.value;

  if (!name) return;

  try {
    const res = await fetch("/api/students");
    const students = await res.json();
    const existingStudent = students.find(student => student.name === name && student.angkatan === angkatan);

    if (existingStudent) {
      await fetch(`/api/students/${existingStudent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          count: existingStudent.count + 1,
          tgl: tglJaga
        })
      });
    } else {
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

async function deleteStudent(id) {
  const swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: "btn btn-success",
      cancelButton: "btn btn-danger"
    },
    buttonsStyling: false
  });

  const result = await swalWithBootstrapButtons.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "No, cancel!",
    reverseButtons: true
  });

  if (result.isConfirmed) {
    try {
      await fetch(`/api/students/${id}`, { method: "DELETE" });
      swalWithBootstrapButtons.fire({
        title: "Deleted!",
        text: "Siswa telah dihapus.",
        icon: "success"
      });
      fetchStudents();
    } catch (err) {
      console.error("Gagal menghapus siswa:", err);
      Swal.fire("Error", "Terjadi kesalahan saat menghapus siswa.", "error");
    }
  } else if (result.dismiss === Swal.DismissReason.cancel) {
    swalWithBootstrapButtons.fire({
      title: "Cancelled",
      text: "Data siswa tidak jadi dihapus.",
      icon: "error"
    });
  }
}


function checkAdmin() {
  const params = new URLSearchParams(window.location.search);
  const isAdmin = params.get("admin") === "true";

  const formEl = document.getElementById("admin-form");
  if (!isAdmin && formEl) {
    formEl.style.display = "none";
  }
}

checkAdmin();
fetchStudents();
