// Opt-in real email check; the supplied recipient remains process.argv[2].
import { launch } from './runtime.js';
await launch('check-smtp');
