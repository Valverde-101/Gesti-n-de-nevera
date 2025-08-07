const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, 'icons');

function capitalize(str) {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}

const categories = {};

fs.readdirSync(iconsDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .forEach(dirent => {
    const dir = dirent.name;
    const files = fs.readdirSync(path.join(iconsDir, dir))
      .filter(f => f.endsWith('_icon.png'));
    categories[dir] = files.map(file => ({
      name: capitalize(file.replace('_icon.png', '').replace(/_/g, ' ')),
      icon: `icons/${dir}/${file}`
    }));
  });

fs.writeFileSync(path.join(__dirname, 'icons.json'), JSON.stringify(categories, null, 2));

