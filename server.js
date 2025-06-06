const express = require("express");
const fs = require("fs");
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"));

const DATA_FILE = "./data.json";

function readData() {
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
  const newStudent = {
    id: Date.now(),
    name: req.body.name,
    count: 0
  };
  data.push(newStudent);
  writeData(data);
  res.json(newStudent);
});

app.put("/api/students/:id", (req, res) => {
  const data = readData();
  const student = data.find(s => s.id == req.params.id);
  if (student) {
    student.count = req.body.count;
    writeData(data);
    res.json(student);
  } else {
    res.status(404).json({ error: "Not found" });
  }
});

app.delete("/api/students/:id", (req, res) => {
  let data = readData();
  data = data.filter(s => s.id != req.params.id);
  writeData(data);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
