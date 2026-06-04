const fs = require('fs');
const path = require('path');

const text = fs.readFileSync(path.join(__dirname, '..', '..', 'коорд.txt'), 'utf8');

function parseDms(s) {
  s = s.trim().replace(/,/g, '.').replace(/[′']/g, "'").replace(/[″"]/g, '"');
  const re = /^(\d+(?:\.\d+)?)\s*°?\s*(?:(\d+(?:\.\d+)?)\s*'?\s*)?(?:(\d+(?:\.\d+)?)\s*"?\s*)?$/;
  const m = s.match(re);
  if (!m) return null;
  return parseFloat(m[1]) + (m[2] ? parseFloat(m[2]) / 60 : 0) + (m[3] ? parseFloat(m[3]) / 3600 : 0);
}

function extractCoords(str) {
  const dmsPair = str.match(/(\d+°[\d′'".]+(?:″|")?)\s*с\.?\s*ш\.?,?\s*(\d+°[\d′'".]+(?:″|")?)/i);
  if (dmsPair) {
    const lat = parseDms(dmsPair[1]);
    const lng = parseDms(dmsPair[2]);
    if (lat != null && lng != null) return { lat, lng };
  }

  const decPair = str.match(/([\d.]+)\s*°?\s*с\.?\s*ш\.?\s*(?:и\s*)?([\d.]+)\s*°?\s*(?:в\.?\s*д\.?)?/i);
  if (decPair) return { lat: parseFloat(decPair[1]), lng: parseFloat(decPair[2]) };

  const comma = str.match(/([\d.]+)\s*,\s*([\d.]+)/);
  if (comma) return { lat: parseFloat(comma[1]), lng: parseFloat(comma[2]) };

  return null;
}

function splitNameAndCoords(line) {
  const parts = line.split(/[-–—]\s*(?=[\d°])/);
  if (parts.length < 2) return null;
  const name = parts[0].trim();
  const rest = parts.slice(1).join('-').trim();
  const coords = extractCoords(rest);
  if (!coords) return null;
  return { name, ...coords };
}

const lines = text.split(/\r?\n/).filter((l) => l.trim());
const results = [];
let pendingName = null;

for (const line of lines) {
  const trimmed = line.trim();
  if (!trimmed) continue;

  if (trimmed.startsWith('-') && pendingName) {
    const coords = extractCoords(trimmed);
    if (coords) {
      results.push({ name: pendingName, ...coords });
      pendingName = null;
    }
    continue;
  }

  const parsed = splitNameAndCoords(trimmed);
  if (parsed) {
    results.push(parsed);
    pendingName = null;
    continue;
  }

  if (!extractCoords(trimmed)) {
    pendingName = trimmed.replace(/[-–—]\s*$/, '').trim();
  }
}

const outPath = path.join(__dirname, '..', 'public', 'data', 'coordinates.json');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(results, null, 2), 'utf8');
console.log(`Wrote ${results.length} entries to ${outPath}`);
