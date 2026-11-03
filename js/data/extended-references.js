import { HEALTH_REFERENCES, HEALTH_REFERENCE_GROUPS } from './health-reference-groups.js';
import { PHYSICAL_REFERENCES } from './physical-measurements.js';
import { LAB_REFERENCES } from './lab-references.js';
import { SPECIALIST_REFERENCES } from './specialist-references.js';
import { PROTOCOL_MAPPINGS } from './protocol-measurement-mappings.js';
import { LAB_INTERVALS } from './lab-intervals.js';
import { withLabInterval } from './core-lab-intervals.js';

// One demand-loaded catalogue for Home and Health's reference-only search links.
const referenceGroup = new Map(HEALTH_REFERENCE_GROUPS.flatMap(group => [...group.ids, ...(group.extendedIds || [])].map(id => [id, group.id])));
export const EXTENDED_REFERENCES = [...new Map([...HEALTH_REFERENCES, ...PHYSICAL_REFERENCES, ...LAB_REFERENCES, ...SPECIALIST_REFERENCES].map(item => [item.id, {
  ...withLabInterval(item, LAB_INTERVALS),
  groupId: item.groupId || referenceGroup.get(item.id),
  familyId: item.familyId || 'additional-context',
  familyLabel: item.familyLabel || 'Additional context',
  aliases: [item.label, ...(item.aliases ? [item.aliases] : [])],
}])).values()];
const byId = new Map(EXTENDED_REFERENCES.map(item => [item.id, item]));
for (const [name, targets] of PROTOCOL_MAPPINGS) for (const id of [targets].flat()) {
  const reference = byId.get(id);
  if (!reference) throw new Error(`Unresolved protocol destination: ${name} → ${id}`);
  reference.aliases.push(name);
}
