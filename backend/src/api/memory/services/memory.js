'use strict';

/**
 * memory service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::memory.memory');