const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");

let projects = [
  {
    id: "project-1",
    name: "Lorem Ipsum Dolor Sit Amet Consectetur Adipiscing Elit Sed",
    createdAt: new Date("2025-04-25").toISOString(),
  },
];

router.get("/", (req, res) => {
  res.json(projects);
});

router.post("/", (req, res) => {
  const { name } = req.body;
  const newProject = {
    id: `project-${uuidv4()}`,
    name,
    created_at: new Date().toISOString(),
  };
  projects.unshift(newProject);
  res.status(201).json({ id: newProject.id });
});

router.patch("/", (req, res) => {
  const { id, name } = req.body;
  const projectIndex = projects.findIndex((p) => p.id === id);
  if (projectIndex !== -1) {
    projects[projectIndex].name = name;
    res.json({ message: "Project updated successfully" });
  } else {
    res.status(404).json({ message: "Project not found" });
  }
});

router.delete("/", (req, res) => {
  const { id } = req.body;
  const projectIndex = projects.findIndex((p) => p.id === id);
  if (projectIndex !== -1) {
    projects.splice(projectIndex, 1);
    res.json({ message: "Project deleted successfully" });
  } else {
    res.status(404).json({ message: "Project not found" });
  }
});

module.exports = router;
