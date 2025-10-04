import { register } from '@hermeslabs/observability-otel/node';

import { version } from '../package.json';

register({ version });
