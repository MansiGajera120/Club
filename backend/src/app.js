import express from 'express';
import { configureExpress } from './loaders/express.js';

/**
 * Build and return the configured Express application. Kept free of any
 * network/DB side effects so it can be imported directly in tests.
 *
 * @returns {import('express').Express}
 */
export const createApp = () => configureExpress(express());

export default createApp;
