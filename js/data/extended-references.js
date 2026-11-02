import { HEALTH_REFERENCES, HEALTH_REFERENCE_GROUPS } from './health-reference-groups.js';
import { LAB_REFERENCES } from './lab-references.js';
import { SPECIALIST_REFERENCES } from './specialist-references.js';
import { PROTOCOL_MAPPINGS } from './protocol-measurement-mappings.js';

// One demand-loaded catalogue for Home and Health's reference-only search links.
export const EXTENDED_REFERENCES = [...new Map([...HEALTH_REFERENCES, ...LAB_REFERENCES, ...SPECIALIST_REFERENCES].map(item => [item.id, { ...item, groupId: item.groupId || HEALTH_REFERENCE_GROUPS.find(group => group.ids.includes(item.id))?.id, aliases: [item.label, ...(item.aliases ? [item.aliases] : [])] }])).values()];
const byId = new Map(EXTENDED_REFERENCES.map(item => [item.id, item]));
for (const [name, targets] of PROTOCOL_MAPPINGS) for (const id of [targets].flat()) {
  const reference = byId.get(id);
  if (!reference) throw new Error(`Unresolved protocol destination: ${name} → ${id}`);
  reference.aliases.push(name);
}
