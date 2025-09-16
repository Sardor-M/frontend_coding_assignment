const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

let projects = [
    {
        id: 'project-1',
        name: 'Lorem Ipsum Dolor Sit Amet Consectetur Adipiscing Elit Sed',
        createdAt: new Date('2025-04-25').toISOString(),
    },
    {
        id: 'project-2',
        name: 'Sed Do Eiusmod Tempor Incididunt Ut Labore Et Dolore Magna Aliqua',
        createdAt: new Date('2025-04-26').toISOString(),
    },
    {
        id: 'project-3',
        name: 'Ut Enim Ad Minim Veniam Quis Nostrud Exercitation Ullamco Laboris',
        createdAt: new Date('2025-04-27').toISOString(),
    },
    {
        id: 'project-4',
        name: 'Duis Aute Irure Dolor In Reprehenderit In Voluptate Velit Esse Cillum',
        createdAt: new Date('2025-04-28').toISOString(),
    },
    {
        id: 'project-5',
        name: 'Excepteur Sint Occaecat Cupidatat Non Proident Sunt In Culpa Qui Officia',
        createdAt: new Date('2025-04-29').toISOString(),
    },
];

router.get('/', (req, res) => {
    try {
        const formattedProjects = projects.map(({ createdAt, ...rest }) => ({
            ...rest,
            created_at: createdAt,
            uuid: uuidv4(),
        }));
        res.json(formattedProjects);
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
    };
    projects.unshift(newProject);
    res.status(201).json({ id: newProject.id });
});

router.patch('/', (req, res) => {
    const { id, name } = req.body;
    if (!id || !name) {
        return res.status(400).json({ message: 'Project id and name are required' });
    }
    const projectIndex = projects.findIndex((p) => p.id === id);
    if (projectIndex !== -1) {
        projects[projectIndex].name = name;
        res.json({ message: 'Project updated successfully' });
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
        projects.splice(projectIndex, 1);
        res.json({ message: 'Project deleted successfully' });
    } else {
        res.status(404).json({ message: 'Project not found' });
    }
});

module.exports = router;
