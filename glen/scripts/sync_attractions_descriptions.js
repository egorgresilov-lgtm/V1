const fs = require('fs');
const path = require('path');
const repo = require('../repositories/destinationRepository');

const attractionsPath = path.join(__dirname, '../public/attractions.js');
let content = fs.readFileSync(attractionsPath, 'utf8');

const IDS = [25, 2501, 2502, 2503, 2504, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55];

async function main() {
    let updated = 0;
    for (const id of IDS) {
        const dest = await repo.findById(id);
        if (!dest?.full_description) continue;

        const escaped = dest.full_description.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
        const idPattern = new RegExp(
            `(\\{\\s*id:\\s*${id},[\\s\\S]*?full_description:\\s*)'(?:\\\\'|[^'])*'`,
            'm'
        );
        if (!idPattern.test(content)) {
            console.warn('No sample entry for id', id);
            continue;
        }
        content = content.replace(idPattern, `$1'${escaped}'`);
        updated++;
    }

    const newNorthern = `const NORTHERN_SPRINGS_FULL_DESCRIPTION = '${(await repo.findById(25)).full_description.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}';`;
    content = content.replace(
        /const NORTHERN_SPRINGS_FULL_DESCRIPTION = '(?:\\'|[^'])*';/,
        newNorthern
    );

    fs.writeFileSync(attractionsPath, content, 'utf8');
    console.log('Updated', updated, 'sample entries + NORTHERN_SPRINGS_FULL_DESCRIPTION');
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
