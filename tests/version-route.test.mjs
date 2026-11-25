import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import ts from 'typescript';

const source = readFileSync(new URL('../src/app/api/version/route.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
});
const { GET, dynamic } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);

test('version returns the current commit or null without caching', async () => {
  const key = 'VERCEL_GIT_COMMIT_SHA';
  const original = process.env[key];
  const sha = '0123456789abcdef0123456789abcdef01234567';

  assert.equal(dynamic, 'force-dynamic');
  try {
    for (const commit of [sha, null]) {
      if (commit === null) delete process.env[key];
      else process.env[key] = commit;

      const response = await GET();
      assert.equal(response.status, 200);
      assert.equal(response.headers.get('cache-control'), 'no-store');
      assert.deepEqual(await response.json(), { ok: true, commit });
    }
  } finally {
    if (original === undefined) delete process.env[key];
    else process.env[key] = original;
  }
});
