// server.js
const express = require("express");
const db = require("./db");
const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.json());
app.use(express.static("public"));

// Get semua data
app.get("/api/students", (req, res) => {
  db.all("SELECT * FROM students", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const students = rows.map(s => ({
      ...s,
      tglList: s.tglList ? JSON.parse(s.tglList) : []
    }));

    res.json(students);
  });
});

// Tambah / update siswa
app.post("/api/students", (req, res) => {
  const { name, angkatan, tgl } = req.body;
  if (!name) return res.status(400).json({ error: "Nama wajib diisi" });

  db.get(
    "SELECT * FROM students WHERE name = ? AND angkatan = ?",
    [name, angkatan || '41'],
    (err, student) => {
      if (student) {
        const tglList = student.tglList ? JSON.parse(student.tglList) : [];
        if (tgl && !tglList.includes(tgl)) tglList.push(tgl);

        db.run(
          "UPDATE students SET count = ?, tglList = ? WHERE id = ?",
          [student.count + 1, JSON.stringify(tglList), student.id],
          err => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ updated: true });
          }
        );
      } else {
        db.run(
          "INSERT INTO students (name, angkatan, tglList, count) VALUES (?, ?, ?, ?)",
          [name, angkatan || '41', tgl ? JSON.stringify([tgl]) : "[]", 1],
          function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID });
          }
        );
      }
    }
  );
});

// Update count / tanggal
app.put("/api/students/:id", (req, res) => {
  const { count, tgl } = req.body;
  db.get("SELECT * FROM students WHERE id = ?", [req.params.id], (err, student) => {
    if (!student) return res.status(404).json({ error: "Siswa tidak ditemukan" });

    const tglList = student.tglList ? JSON.parse(student.tglList) : [];
    if (tgl && !tglList.includes(tgl)) tglList.push(tgl);

    db.run(
      "UPDATE students SET count = ?, tglList = ? WHERE id = ?",
      [count ?? student.count, JSON.stringify(tglList), student.id],
      err => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ updated: true });
      }
    );
  });
});

// Hapus siswa
app.delete("/api/students/:id", (req, res) => {
  db.run("DELETE FROM students WHERE id = ?", [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Siswa tidak ditemukan" });
    res.json({ success: true });
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server berjalan di http://localhost:${PORT}`);
});
