const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '../public/routes.html'), 'utf8');
const js = fs.readFileSync(path.join(__dirname, '../public/routes.js'), 'utf8');
const start = js.indexOf('const toursData = ');
const end = js.indexOf('};\n\nfunction renderMap');
const objCode = js.slice(start + 'const toursData = '.length, end + 1);
// eslint-disable-next-line no-eval
const toursData = eval('(' + objCode + ')');

const cardRe = /data-tour="([^"]+)"[\s\S]*?routes-tour-badge">([^<]*)<\/span>[\s\S]*?<h3>([^<]*)<\/h3>[\s\S]*?<p>([^<]*)<\/p>[\s\S]*?url\('([^']+)'\)/g;
const cardMap = {};
let m;
while ((m = cardRe.exec(html)) !== null) {
    cardMap[m[1]] = {
        card_badge: m[2].trim(),
        card_title: m[3].trim(),
        card_summary: m[4].trim(),
        card_image: m[5].trim()
    };
}

const order = ['rural', 'active', 'spiritual', 'winter', 'waterfalls', 'teaRoute', 'baikalRegatta', 'nomadic'];
const routes = order.map((slug, i) => {
    const t = toursData[slug];
    const c = cardMap[slug] || {};
    return {
        slug,
        name: t.name,
        theme_class: t.themeClass,
        duration: t.duration,
        description: t.description,
        card_title: c.card_title || t.name.split(' · ')[0],
        card_badge: c.card_badge || t.duration,
        card_summary: c.card_summary || t.description,
        card_image: c.card_image || (t.stages[0] && t.stages[0].img) || '',
        stages: t.stages,
        sort_order: i + 1
    };
});

const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const out = path.join(dataDir, 'routesSeed.js');
const content = `// Auto-generated from public/routes.js + routes.html\nmodule.exports = ${JSON.stringify(routes, null, 4)};\n`;
fs.writeFileSync(out, content);
console.log('Wrote', routes.length, 'routes to', out);
