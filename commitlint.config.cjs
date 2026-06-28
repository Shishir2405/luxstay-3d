/**
 * Conventional Commits enforcement.
 * Allowed types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
 * Example: feat(rooms): add seasonal pricing rules engine
 */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      1,
      'always',
      [
        'root',
        'api',
        'web',
        'shared',
        'auth',
        'rooms',
        'bookings',
        'payments',
        'rsvp',
        'events',
        'menu',
        'customer',
        'dashboard',
        'content',
        'analytics',
        'security',
        '3d',
        'ui',
        'deps',
        'ci',
      ],
    ],
    'subject-case': [0],
  },
};
