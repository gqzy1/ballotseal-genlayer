import { writeFile } from 'node:fs/promises';
import { client } from '../sdk.js';
import { readSnapshot, buildAudit, EXAMPLE_REF, EXAMPLE_VIEWER } from '../audit.js';
const snapshot = await readSnapshot(client(),EXAMPLE_REF,EXAMPLE_VIEWER);
const analysis = await buildAudit(snapshot,1,snapshot.record.trail.length);
const evidence = {checked_at:new Date().toISOString(),source:'Stable Studionet read-only SDK',snapshot,analysis};
if(analysis.timeline[1].status!=='CARRIED'||analysis.timeline[2].status!=='EXPIRED'||analysis.timeline[3].status!=='EXACT')throw Error('Unexpected canonical example history.');
await writeFile('verification/audit-live.json',JSON.stringify(evidence,null,2)+'\n');
console.log('Source and full stored history verified; V1 carries to V2, expires at V3; V4 has an exact acknowledgement. No transactions sent.');
