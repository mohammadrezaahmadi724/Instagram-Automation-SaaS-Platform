import tseslint from 'typescript-eslint';

const restricted = {
  '@directora/core': {
    patterns: [
      {
        group: ['@directora/*', 'next', 'next/*', 'react', 'react-dom', '@prisma/*'],
        message: 'core must not depend on a framework or another workspace package (ADR-012).',
      },
    ],
  },
  '@directora/ui': {
    patterns: [
      {
        group: [
          '@directora/db',
          '@directora/db/*',
          '@directora/instagram',
          '@directora/instagram/*',
        ],
        message: 'ui must not depend on db or instagram (ADR-012).',
      },
    ],
  },
};

export function createConfig(packageName) {
  const rule = restricted[packageName];
  return tseslint.config(
    {
      ignores: [
        '.next/**',
        'dist/**',
        'src/generated/**',
        'test-results/**',
        'playwright-report/**',
        'eslint.config.mjs',
      ],
    },
    ...tseslint.configs.strict,
    {
      rules: {
        '@typescript-eslint/no-explicit-any': 'error',
        ...(rule ? { 'no-restricted-imports': ['error', { patterns: rule.patterns }] } : {}),
      },
    },
  );
}

export default createConfig('@directora/config');
