'use strict';

/**
 * memory controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::memory.memory');