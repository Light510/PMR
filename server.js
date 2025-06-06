// --- server.js ---
const express = require("express");
const fs = require("fs");
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"));

const DATA_FILE = "./data.json";

function readData() {
  if (!fs.existsSync(DATA_FILE)) return [];
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

app.get("/api/students", (req, res) => {
  res.json(readData());
});

app.post("/api/students", (req, res) => {
  const data = readData();
  const { name, angkatan, tgl } = req.body;

  if (!name) return res.status(400).json({ error: "Nama wajib diisi" });

  const newStudent = {
    id: Date.now(),
    name,
    angkatan: angkatan || "41",
    tglList: tgl ? [tgl] : [],
    count: 1
  };

  data.push(newStudent);
  writeData(data);
  res.json(newStudent);
});

app.put("/api/students/:id", (req, res) => {
  const data = readData();
  const student = data.find(s => s.id == req.params.id);
  if (!student) return res.status(404).json({ error: "Siswa tidak ditemukan" });

  if (req.body.count !== undefined) student.count = req.body.count;

  if (req.body.tgl !== undefined) {
    if (!student.tglList) student.tglList = [];
    if (!student.tglList.includes(req.body.tgl)) student.tglList.push(req.body.tgl);
  }

  writeData(data);
  res.json(student);
});

app.delete("/api/students/:id", (req, res) => {
  const data = readData();
  const newData = data.filter(s => s.id != req.params.id);
  if (newData.length === data.length) return res.status(404).json({ error: "Siswa tidak ditemukan" });

  writeData(newData);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`✅ Server berjalan di http://localhost:${PORT}`);
});