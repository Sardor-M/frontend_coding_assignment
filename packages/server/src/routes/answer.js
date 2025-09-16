const express = require('express');
const router = express.Router();
const ollamaService = require('../services/ollama');
const guardrailService = require('../middleware/guardrail');
const RateLimiter = require('../middleware/rateLimiter');

const rateLimiter = new RateLimiter({
    windowMs: 120000,
    max: 20,
});

const checkRateLimit = (req, res, next) => {
    const identifier = req.ip || req.connection.remoteAddress;
    const result = rateLimiter.check(identifier);

    if (!result.allowed) {
        return res.status(429).json({
            error: 'Too many requests',
            message: result.message,
            retryAfter: result.retryAfter,
        });
    }

    res.setHeader('X-RateLimit-Remaining', result.remaining);
    next();
};

/* we check guardrails first, then stream if safe */
router.post('/', checkRateLimit, async (req, res) => {
    const { query } = req.body;

    if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Query is required and must be a string' });
    }

    const sanitizedQuery = query.trim().substring(0, 1000);

    console.info(`Checking guardrails for query: ${sanitizedQuery.substring(0, 50)}...`);

    try {
        const isSafe = await guardrailService.checkQuerySafety(sanitizedQuery);

        if (!isSafe) {
            guardrailService.logBlockedQuery(sanitizedQuery, 'Failed safety check');
            return res.status(400).json({
                error: 'Query blocked',
                message:
                    'Your query contains content that violates our safety guidelines. Please rephrase your question.',
            });
        }
    } catch (error) {
        console.error('Guardrail check error:', error);
        return res.status(500).json({
            error: 'Safety check failed',
            message: 'Unable to process your request at this time.',
        });
    }

    /* process safe query */
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
        'Access-Control-Allow-Origin': '*',
    });

    try {
        console.info(`Processing safe query: ${sanitizedQuery.substring(0, 50)}...`);

        const safePrompt = `Please provide helpful, accurate, and safe information for: ${sanitizedQuery}`;

        for await (const chunk of ollamaService.streamResponse(safePrompt)) {
            const eventData = JSON.stringify({ text: chunk });
            res.write(`data: ${eventData}\n\n`);
        }

        res.write('event: done\ndata: {"text": "Stream complete"}\n\n');
    } catch (error) {
        console.error('Streaming error:', error);
        const errorData = JSON.stringify({
            text: 'An error occurred while generating the response. Please try again.',
        });
        res.write(`data: ${errorData}\n\n`);
    } finally {
        res.end();
    }
});

router.get('/', checkRateLimit, async (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ error: 'Query parameter is required' });
    }

    const sanitizedQuery = decodeURIComponent(query).trim().substring(0, 1000);

    try {
        const isSafe = await guardrailService.checkQuerySafety(sanitizedQuery);

        if (!isSafe) {
            guardrailService.logBlockedQuery(sanitizedQuery, 'Failed safety check');
            return res.status(400).json({
                error: 'Query blocked',
                message: 'Your query contains content that violates our safety guidelines.',
            });
        }
    } catch (error) {
        console.error('Guardrail check error:', error);
        return res.status(500).json({ error: 'Safety check failed' });
    }

    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
        'Access-Control-Allow-Origin': '*',
    });

    try {
        const safePrompt = `Please provide helpful, accurate, and safe information for: ${sanitizedQuery}`;

        for await (const chunk of ollamaService.streamResponse(safePrompt)) {
            const eventData = JSON.stringify({ text: chunk });
            res.write(`data: ${eventData}\n\n`);
        }

        res.write('event: done\ndata: {"text": "Stream complete"}\n\n');
    } catch (error) {
        console.error('Streaming error:', error);
        const errorData = JSON.stringify({ text: 'Error generating response' });
        res.write(`data: ${errorData}\n\n`);
    } finally {
        res.end();
    }
});

module.exports = router;
