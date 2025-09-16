const guardrailConfig = require('../config/GUARDRAIL_SYSTEM.json');

/**
 * GuardrailService handles query safety checks using local rules
 * and optional external model validation.
 * It includes caching and logging of blocked queries.
 */
class GuardrailService {
    constructor() {
        this.cache = new Map();
        this.maxCacheSize = 100;
    }

    /**
     * Check if a query is safe using local validation
     * @param {string} query - User query to check
     * @returns {Promise<boolean>} - True if safe, false otherwise
     */
    async checkQuerySafety(query) {
        if (this.cache.has(query)) {
            return this.cache.get(query);
        }

        const isSafe = this.performLocalSafetyChecks(query);

        if (process.env.USE_EXTERNAL_GUARDRAIL === 'true') {
            const externalCheck = await this.checkWithExternalModel(query);
            const finalResult = isSafe && externalCheck;
            this.addToCache(query, finalResult);
            return finalResult;
        }

        this.addToCache(query, isSafe);
        return isSafe;
    }

    /**
     * Perform local safety checks
     * @param {string} query
     * @returns {boolean}
     */
    performLocalSafetyChecks(query) {
        const lowerQuery = query.toLowerCase();

        const dangerousPatterns = [
            /\b(hack|crack|exploit|bypass|circumvent)\s+(system|security|password)/i,
            /\b(illegal|crime|fraud|launder|evade)\b/i,
            /\b(steal|theft|rob)\s+(money|data|identity)/i,

            /\b(kill|murder|assassinate|harm|hurt|torture)\s+(someone|people|myself)/i,
            /\b(suicide|self[\s-]harm|end\s+my\s+life)/i,
            /\b(weapon|bomb|explosive|poison)\s+(make|create|build)/i,

            /\b(dox|doxx|stalk|harass|blackmail)/i,
            /\b(private|personal)\s+(information|data)\s+(without|steal|hack)/i,
            /\b(phishing|social\s+engineering)/i,

            /\b(meth|cocaine|heroin|fentanyl)\s+(make|create|synthesize)/i,
            /\b(chemical\s+weapons?|biological\s+weapons?)/i,

            /\b(child|minor|underage)\s+(porn|sexual|abuse)/i,
            /\b(revenge\s+porn|non[\s-]consensual)/i,
            /\b(human\s+trafficking|sex\s+trafficking)/i,
        ];

        for (const pattern of dangerousPatterns) {
            if (pattern.test(lowerQuery)) {
                console.log(`Blocked query matching pattern: ${pattern}`);
                return false;
            }
        }

        const suspiciousWords = [
            'illegal',
            'harmful',
            'dangerous',
            'weapon',
            'exploit',
            'hack',
            'crack',
            'bypass',
            'steal',
            'fraud',
        ];

        let suspiciousCount = 0;
        for (const word of suspiciousWords) {
            if (lowerQuery.includes(word)) {
                suspiciousCount++;
            }
        }

        if (suspiciousCount >= 3) {
            console.log(`Blocked query with ${suspiciousCount} suspicious words`);
            return false;
        }

        return true;
    }

    /**
     * Check with external model
     * @param {string} query
     * @returns {Promise<boolean>}
     */
    async checkWithExternalModel(query) {
        try {
            const axios = require('axios');
            const response = await axios.post(
                `${process.env.OLLAMA_URL}/api/generate`,
                {
                    /* using a small, fast model for guardrail checks */
                    model: 'mistral:7b-instruct',
                    prompt: `${JSON.stringify(guardrailConfig.system, null, 2)}\n\nQuery to analyze: "${query}"\n\nResponse:`,
                    stream: false,
                    options: {
                        temperature: 0.1,
                        max_tokens: 10,
                    },
                },
                { timeout: 5000 }
            );

            const result = response.data.response.trim();
            return result === '1';
        } catch (error) {
            console.error('External guardrail check failed:', error.message);
            return true;
        }
    }

    /**
     * Add result to cache with size limit
     * @param {string} query
     * @param {boolean} isSafe
     */
    addToCache(query, isSafe) {
        if (this.cache.size >= this.maxCacheSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        this.cache.set(query, isSafe);
    }

    /**
     * Log blocked queries for monitoring
     * @param {string} query
     * @param {string} reason
     */
    logBlockedQuery(query, reason) {
        const timestamp = new Date().toISOString();
        console.log(
            `[GUARDRAIL BLOCKED] ${timestamp} - Reason: ${reason} - Query: ${query.substring(0, 100)}...`
        );

        /* in production, i will setup the logger adn then save to database */
        // await loggingService.log('guardrail_block', { query, reason, timestamp });
    }
}

module.exports = new GuardrailService();
