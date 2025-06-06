async function fetchStudents() {
  const res = await fetch("/api/students");
  const students = await res.json();
  const tbody = document.getElementById("studentTable");
  tbody.innerHTML = "";
  students.forEach(s => {
    tbody.innerHTML += `
      <tr>
        <td class="border p-2">${s.name}</td>
        <td class="border p-2">
          <input type="number" value="${s.count}" min="0"
            onchange="updateCount(${s.id}, this.value)" class="w-16 p-1 border" />
        </td>
        <td class="border p-2">
          <button onclick="deleteStudent(${s.id})" class="bg-red-500 text-white px-2 py-1">Hapus</button>
        </td>
      </tr>
    `;
  });
}

async function addStudent() {
  const name = document.getElementById("nameInput").value;
  if (!name) return;
  await fetch("/api/students", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name })
  });
  document.getElementById("nameInput").value = "";
  fetchStudents();
}

async function updateCount(id, count) {
  await fetch(`/api/students/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ count: parseInt(count) })
  });
}

async function deleteStudent(id) {
  await fetch(`/api/students/${id}`, { method: "DELETE" });
  fetchStudents();
}

fetchStudents();
