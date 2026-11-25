import next from 'eslint-config-next';
import { createConfig } from '@directora/config/eslint';

export default [...createConfig('@directora/web'), ...next];
