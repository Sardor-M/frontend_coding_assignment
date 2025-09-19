const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

let projects = [
    {
        id: 'project-1',
        name: 'Lorem Ipsum Dolor Sit Amet Consectetur Adipiscing Elit Sed',
        created_at: new Date('2025-04-25').toISOString(),
        uuid: uuidv4(),
    },
    {
        id: 'project-2',
        name: 'Sed Do Eiusmod Tempor Incididunt Ut Labore Et Dolore Magna Aliqua',
        created_at: new Date('2025-04-26').toISOString(),
        uuid: uuidv4(),
    },
    {
        id: 'project-3',
        name: 'Ut Enim Ad Minim Veniam Quis Nostrud Exercitation Ullamco Laboris',
        created_at: new Date('2025-04-27').toISOString(),
        uuid: uuidv4(),
    },
    {
        id: 'project-4',
        name: 'Duis Aute Irure Dolor In Reprehenderit In Voluptate Velit Esse Cillum',
        created_at: new Date('2025-04-28').toISOString(),
        uuid: uuidv4(),
    },
    {
        id: 'project-5',
        name: 'Excepteur Sint Occaecat Cupidatat Non Proident Sunt In Culpa Qui Officia',
        created_at: new Date('2025-04-29').toISOString(),
        uuid: uuidv4(),
    },
];

router.get('/', (req, res) => {
    try {
        res.json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ error: 'Server internal error' });
    }
});

router.post('/', (req, res) => {
    const { name } = req.body;
    const newProject = {
        id: `project-${uuidv4()}`,
        name,
        created_at: new Date().toISOString(),
        uuid: uuidv4(),
    };
    projects.unshift(newProject);
    res.status(201).json(newProject);
});

router.patch('/', (req, res) => {
    const { id, name } = req.body;
    if (!id || !name) {
        return res.status(400).json({ message: 'Project id and name are required' });
    }
    const projectIndex = projects.findIndex((p) => p.id === id);
    if (projectIndex !== -1) {
        projects[projectIndex].name = name;
        res.json(projects[projectIndex]);
    } else {
        res.status(404).json({ message: 'Project not found' });
    }
});

router.delete('/', (req, res) => {
    const { id } = req.body;
    if (!id) {
        return res.status(400).json({ message: 'Project id is required' });
    }
    const projectIndex = projects.findIndex((p) => p.id === id);
    if (projectIndex !== -1) {
        const deleted = projects.splice(projectIndex, 1)[0];
        res.json(deleted);
    } else {
        res.status(404).json({ message: 'Project not found' });
    }
});

module.exports = router;
