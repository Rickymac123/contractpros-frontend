import fs from 'node:fs';
import assert from 'node:assert/strict';
import ts from 'typescript';
const source=fs.readFileSync(new URL('../src/lib/match-filters.ts',import.meta.url),'utf8');
const js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;
const {filterMatches,emptyMatchFilters}=await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
const items=[{score:90,talent_name:'Alex Morgan',talent_skills:'PLC, welding',talent_location:'Cardiff',talent_postcode:'CF10 1AA',talent_industry:'Food',talent_experience_level:'senior',talent_ir35_preference:'either',talent_rate_type:'day',talent_day_rate:400,talent_cv_url:'/api/uploads/cv/1'},
{score:60,talent_name:'Sam Green',talent_skills:'PLC',talent_location:'London',talent_industry:'Food',talent_experience_level:'junior',talent_ir35_preference:'outside',talent_rate_type:'hour',talent_hourly_rate:50},
{score:30,talent_name:'Unknown Details',talent_location:'Cardiff'}];
const names=filters=>filterMatches(items,{...emptyMatchFilters,...filters}).map(i=>i.talent_name);
assert.deepEqual(names({query:'  ALEX plc '}),['Alex Morgan']);
assert.deepEqual(names({location:'cf10'}),['Alex Morgan']);
assert.deepEqual(names({maxRate:'400'}),['Alex Morgan']);
assert.deepEqual(names({maxRate:'399'}),[]);
assert.deepEqual(names({rateType:'hour',maxRate:'50'}),['Sam Green']);
assert.deepEqual(names({experience:'senior'}),['Alex Morgan']);
assert.deepEqual(names({ir35:'inside'}),['Alex Morgan']);
assert.deepEqual(names({industry:'food',minScore:'75',cvOnly:true}),['Alex Morgan']);
assert.deepEqual(names({query:'%'}),[]);
assert.equal(names({}).length,3);
console.log('10 matching filter checks passed');
