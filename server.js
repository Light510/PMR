const express = require("express");
const fs = require("fs");
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"));

const DATA_FILE = "./data.json";

// Baca data dari file
function readData() {
  if (!fs.existsSync(DATA_FILE)) return [];
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
}

// Tulis data ke file
function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Ambil semua siswa
app.get("/api/students", (req, res) => {
  res.json(readData());
});

// Tambah siswa baru
app.post("/api/students", (req, res) => {
  const data = readData();
  const { name, angkatan } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Nama wajib diisi" });
  }

  const newStudent = {
    id: Date.now(),
    name,
    angkatan: angkatan || "41", // default angkatan jika tidak dikirim
    tgl: "",
    count: 0
  };

  data.push(newStudent);
  writeData(data);
  res.json(newStudent);
});

// Update jumlah jaga siswa
app.put("/api/students/:id", (req, res) => {
  const data = readData();
  const student = data.find(s => s.id == req.params.id);

  if (!student) {
    return res.status(404).json({ error: "Siswa tidak ditemukan" });
  }

  if (req.body.count !== undefined) {
    student.count = parseInt(req.body.count);
  }

  writeData(data);
  res.json(student);
});

// Hapus siswa
app.delete("/api/students/:id", (req, res) => {
  const data = readData();
  const newData = data.filter(s => s.id != req.params.id);

  if (newData.length === data.length) {
    return res.status(404).json({ error: "Siswa tidak ditemukan" });
  }

  writeData(newData);
  res.json({ success: true });
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`✅ Server berjalan di http://localhost:${PORT}`);
});
