const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const ACCESS_TOKEN = "gS+xc4XUsv3CA+iURw0b3H8gEit0VDlk"; 
let latestMessage = null; 

app.use(bodyParser.json());

app.use((req, res, next) => {
  const token = req.headers["authorization"];
  if (token !== `Bearer ${ACCESS_TOKEN}`) {
    return res.status(403).send("Unauthorized");
  }
  next();
});

app.post("/receive", (req, res) => {
  console.log("Data received:", req.body);
  latestMessage = req.body; 
  res.status(200).send("Data processed and stored");
});

app.get("/receiver", (req, res) => {
  if (!latestMessage) {
    return res.status(404).send("No message available");
  }
  res.status(200).json(latestMessage); 
});

app.listen(8000, () => console.log("External adapter running on port 8000"));
