'use strict';

const { execSync } = require('child_process');
const fs = require('fs');

function runPlumbingCommit(message) {
  const filesToUpdate = [
    'i18n.css',
    'i18n.js',
    'cart-utils.js',
    'server/routes.js',
    'script.js',
    'storefront-products.js',
    'coffee-shop.js',
    'tea-shop.js',
    'gear-shop.js',
    'product-detail.js',
    'account.js',
    'favorites.js',
    'checkout.js',
    'index.html',
    'qehveler.html',
    'caylar.html',
    'avadanliqlar.html',
    'mehsul.html',
    'menyu.html',
    'mexfilik.html',
    'tests/i18n.test.js',
    'scripts/build-i18n-dictionary.js',
    'scripts/add-russian-translations.js',
    'scripts/generate-full-i18n.js',
    'scripts/fast-commit.js'
  ];

  console.log('1. Hashing blobs...');
  const fileBlobs = {};
  for (const file of filesToUpdate) {
    if (!fs.existsSync(file)) continue;
    const sha = execSync(`git hash-object -w "${file}"`).toString().trim();
    fileBlobs[file] = sha;
  }

  console.log('2. Reading current HEAD tree...');
  const treeOutput = execSync('git ls-tree -r HEAD').toString().trim().split('\n');
  const fileEntries = {};
  for (const line of treeOutput) {
    if (!line) continue;
    const match = line.match(/^(\d+) (blob|tree) ([a-f0-9]+)\t(.*)$/);
    if (match && match[2] === 'blob') {
      fileEntries[match[4]] = { mode: match[1], sha: match[3] };
    }
  }

  // Update modified/new files
  for (const [file, sha] of Object.entries(fileBlobs)) {
    fileEntries[file] = { mode: '100644', sha };
  }

  console.log('3. Constructing tree hierarchy...');
  // Build nested directory object
  const root = { type: 'tree', children: {} };
  for (const [filePath, info] of Object.entries(fileEntries)) {
    const parts = filePath.split('/');
    let current = root;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current.children[part]) {
        current.children[part] = { type: 'tree', children: {} };
      }
      current = current.children[part];
    }
    const fileName = parts[parts.length - 1];
    current.children[fileName] = { type: 'blob', mode: info.mode, sha: info.sha };
  }

  // Recursively write trees with git mktree
  function writeTree(node) {
    const lines = [];
    const sortedKeys = Object.keys(node.children).sort((a, b) => {
      // Git tree sorting rule: tree names sort as if ending with '/', compared bytewise
      const aName = node.children[a].type === 'tree' ? a + '/' : a;
      const bName = node.children[b].type === 'tree' ? b + '/' : b;
      return aName < bName ? -1 : aName > bName ? 1 : 0;
    });

    for (const key of sortedKeys) {
      const item = node.children[key];
      if (item.type === 'tree') {
        const subTreeSha = writeTree(item);
        lines.push(`040000 tree ${subTreeSha}\t${key}`);
      } else {
        lines.push(`${item.mode} blob ${item.sha}\t${key}`);
      }
    }

    const input = lines.join('\n') + '\n';
    const sha = execSync('git mktree', { input }).toString().trim();
    return sha;
  }

  const rootTreeSha = writeTree(root);
  console.log('4. Root tree sha:', rootTreeSha);

  const parent = execSync('git rev-parse HEAD').toString().trim();
  console.log('Parent commit:', parent);

  const commitSha = execSync(`git commit-tree ${rootTreeSha} -p ${parent} -m "${message}"`).toString().trim();
  console.log('5. New commit sha:', commitSha);

  execSync(`git update-ref refs/heads/main ${commitSha}`);
  console.log('6. Updated refs/heads/main');

  console.log('7. Synchronizing git index...');
  try {
    execSync(`git read-tree ${rootTreeSha}`);
    console.log('Index synchronized to root tree.');
  } catch (e) {
    console.warn('read-tree note:', e.message);
  }

  console.log('Commit created successfully:', commitSha);
  return commitSha;
}

if (require.main === module) {
  const msg = process.argv[2] || 'coxdilli interfeys: AZ, EN, AR ve bir klikle dil secimi';
  runPlumbingCommit(msg);
}
