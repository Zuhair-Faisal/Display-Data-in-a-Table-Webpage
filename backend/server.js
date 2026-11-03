const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 4000;

const data = require("./db.json");
let users = data.users;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello from my Express Server");
});

app.get("/users", (req, res) => {
  res.json(users);
});

app.get("/users/:id", (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ message: "ID must be a number" });
  }
  const user = users.find((u) => u.id === id);
  if (!user) {
    return res.status(404).json({ message: "User not Found" });
  }
  res.json(user);
});

app.delete("/users/:id", (req, res) => {
  const id = Number(req.params.id);
  const user = users.find((u) => u.id === id);
  if (!user) {
    return res.status(404).json({ message: "User not Found" });
  }
  users = users.filter((u) => u.id !== id);
  res.json({ message: "User Deleted" });
});

app.post("/users", (req, res) => {
  const newUser = req.body;
  if (!newUser || !newUser.email || !newUser.name) {
    return res.status(400).json({ message: "Name and Email are Required" });
  }
  const nextId = users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1;
  const createdUser = { id: nextId, ...newUser };
  users.push(createdUser);
  res.status(201).json(createdUser);
});

app.put("/users/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = users.findIndex((u) => u.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "User not Found" });
  }
  const newData = req.body;
  if (!newData || !newData.email || !newData.name) {
    return res.status(400).json({ message: "Name and Email are Required" });
  }
  const replacedUser = { ...newData, id: id };
  users[index] = replacedUser;
  res.json(replacedUser);
});

app.patch("/users/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = users.findIndex((u) => u.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "User not Found" });
  }
  const changes = req.body;
  if (!changes || Object.keys(changes).length === 0) {
    return res.status(400).json({ message: "No Changes Sent" });
  }
  const updatedUser = { ...users[index], ...changes, id: id };
  users[index] = updatedUser;
  res.json(updatedUser);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
