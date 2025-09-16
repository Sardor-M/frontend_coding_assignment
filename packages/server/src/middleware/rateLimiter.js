const rateLimit = new Map();

/**
 * Simple in-memory rate limiter
 * Options:
 *  - windowMs: Time window in milliseconds - 1 minute
 *  - max: Max number of requests per window
 */
class RateLimiter {
    constructor(options = {}) {
        this.windowMs = options.windowMs || 60000;
        this.max = options.max || 20;
    }

    check(identifier) {
        const now = Date.now();
        const userLimits = rateLimit.get(identifier) || {
            count: 0,
            resetTime: now + this.windowMs,
        };

        if (now > userLimits.resetTime) {
            userLimits.count = 0;
            userLimits.resetTime = now + this.windowMs;
        }

        userLimits.count++;
        rateLimit.set(identifier, userLimits);

        if (userLimits.count > this.max) {
            const retryAfter = Math.ceil((userLimits.resetTime - now) / 1000);
            return {
                allowed: false,
                retryAfter,
                message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
            };
        }

        return {
            allowed: true,
            remaining: this.max - userLimits.count,
        };
    }
}

module.exports = RateLimiter;
