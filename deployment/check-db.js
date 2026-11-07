// Opt-in, read-only hosted connectivity check using the same private file as startup.
import { launch } from './runtime.js';
await launch('check-db');
