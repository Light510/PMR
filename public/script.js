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

    const isAdmin = localStorage.getItem("admin") === "true"; // ✅ Tambahkan ini

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
            ${isAdmin ? `<button onclick="deleteStudent(${s.id})" class="bg-red-500 text-white px-2 py-1">Hapus</button>` : ''}
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
  const name = document.getElementById("nameInput").value.trim();
  const angkatan = document.getElementById("angkatanInput").value.trim();
  const tglJaga = document.getElementById("tglJagaInput").value;

  if (!name) return;

  try {
    const res = await fetch("/api/students");
    const students = await res.json();
    const existingStudent = students.find(s => s.name === name && s.angkatan === angkatan);

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

    document.getElementById("nameInput").value = "";
    document.getElementById("angkatanInput").value = "";
    document.getElementById("tglJagaInput").value = "";

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
    title: "Apakah Kamu Yakin?",
    text: "Kamu tidak bisa mengembalikan ini!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Ya, hapus!",
    cancelButtonText: "Batal",
    reverseButtons: true
  });

  if (result.isConfirmed) {
    try {
      await fetch(`/api/students/${id}`, { method: "DELETE" });
      swalWithBootstrapButtons.fire("Berhasil!", "Data siswa telah dihapus.", "success");
      fetchStudents();
    } catch (err) {
      console.error("Gagal menghapus siswa:", err);
      Swal.fire("Error", "Terjadi kesalahan saat menghapus siswa.", "error");
    }
  } else if (result.dismiss === Swal.DismissReason.cancel) {
    swalWithBootstrapButtons.fire("Dibatalkan", "Data siswa tidak jadi dihapus", "error");
  }
}

// ------------------- Admin Handling --------------------

function showLogin() {
  const form = document.getElementById("loginForm");
  if (form) form.classList.remove("hidden");
}

function adminLogin() {
  const password = document.getElementById("adminPassword")?.value;
  if (password === "pmradmin123") {
    localStorage.setItem("admin", "true");
    const isAdminPage = window.location.pathname.includes("admin.html");
    if (!isAdminPage) window.location.href = "/admin.html";
    else {
      setAdminUI(true);
    }
  } else {
    alert("Password salah");
  }
}

function Logout() {
  localStorage.removeItem("admin");
  setAdminUI(false);
  setTimeout(() => {
    window.location.href = "/index.html";
  }, 1000);
}

function checkAdmin() {
  const isAdmin = localStorage.getItem("admin") === "true";
  setAdminUI(isAdmin);
}

function setAdminUI(isAdmin) {
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const adminForm = document.getElementById("admin-form");

  if (loginBtn) loginBtn.classList.toggle("hidden", isAdmin);
  if (logoutBtn) logoutBtn.classList.toggle("hidden", !isAdmin);
  if (adminForm) adminForm.classList.toggle("hidden", !isAdmin);
}

// ------------------- Init --------------------

window.addEventListener("DOMContentLoaded", () => {
  checkAdmin();
  fetchStudents();
});
