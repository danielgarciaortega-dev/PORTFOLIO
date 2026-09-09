import assert from 'node:assert/strict';
import test from 'node:test';

import { technologyIcons } from '../src/data/technology-icons.ts';

test('REST API icon mapping supports the Spanish and English labels', () => {
  const restApiIcon = 'images/technologies/rest-api.svg';

  assert.equal(technologyIcons['APIs REST'], restApiIcon);
  assert.equal(technologyIcons['REST APIs'], restApiIcon);
});
