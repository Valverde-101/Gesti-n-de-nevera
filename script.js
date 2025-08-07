const FOOD_KEY = 'items';
const GROUP_KEY = 'groups';
let items = JSON.parse(localStorage.getItem(FOOD_KEY) || '[]');
let groups = JSON.parse(localStorage.getItem(GROUP_KEY) || '[]');

function save() {
  localStorage.setItem(FOOD_KEY, JSON.stringify(items));
  localStorage.setItem(GROUP_KEY, JSON.stringify(groups));
}

function loadFoodsList() {
  fetch('foods.json').then(r => r.json()).then(list => {
    const data = document.getElementById('food-list');
    list.forEach(name => {
      const opt = document.createElement('option');
      opt.value = name;
      data.appendChild(opt);
    });
  });
}

function loadGroups() {
  const data = document.getElementById('groups');
  data.innerHTML = '';
  groups.forEach(g => {
    const opt = document.createElement('option');
    opt.value = g;
    data.appendChild(opt);
  });
}

function expirationClass(date) {
  if (!date) return '';
  const diff = (new Date(date) - new Date()) / 86400000;
  if (diff < 0) return 'expired';
  if (diff < 3) return 'soon';
  return '';
}

function renderInventory() {
  const container = document.getElementById('inventory');
  container.innerHTML = '';
  const locations = ['Nevera', 'Congelador', 'Despensa'];
  locations.forEach(loc => {
    const locDiv = document.createElement('div');
    locDiv.className = 'location';
    const h3 = document.createElement('h3');
    h3.textContent = loc;
    locDiv.appendChild(h3);
    items.filter(it => it.location === loc).forEach(item => {
      const div = document.createElement('div');
      div.className = 'item';

      const nameSpan = document.createElement('span');
      nameSpan.className = 'name';
      nameSpan.textContent = item.name;
      div.appendChild(nameSpan);

      const minus = document.createElement('button');
      minus.textContent = '-';
      minus.onclick = () => {
        if (item.quantity > 1) {
          item.quantity--;
          save();
          render();
        }
      };
      div.appendChild(minus);

      const qty = document.createElement('span');
      qty.textContent = item.quantity;
      div.appendChild(qty);

      const plus = document.createElement('button');
      plus.textContent = '+';
      plus.onclick = () => {
        item.quantity++;
        save();
        render();
      };
      div.appendChild(plus);

      const exp = document.createElement('span');
      exp.className = 'expiration ' + expirationClass(item.expiration);
      if (item.expiration) {
        exp.textContent = new Date(item.expiration).toLocaleDateString();
      }
      div.appendChild(exp);

      const shop = document.createElement('input');
      shop.type = 'checkbox';
      shop.checked = item.shopping;
      shop.onchange = () => {
        item.shopping = shop.checked;
        save();
        renderShopping();
      };
      div.appendChild(shop);

      locDiv.appendChild(div);
    });
    container.appendChild(locDiv);
  });
}

function renderShopping() {
  const ul = document.getElementById('shopping-list');
  ul.innerHTML = '';
  items.filter(i => i.shopping).forEach(item => {
    const li = document.createElement('li');
    li.textContent = item.name;
    ul.appendChild(li);
  });
}

function render() {
  renderInventory();
  renderShopping();
}

document.getElementById('add-form').addEventListener('submit', e => {
  e.preventDefault();
  const name = document.getElementById('food-name').value.trim();
  const quantity = parseInt(document.getElementById('food-quantity').value, 10) || 1;
  const location = document.getElementById('food-location').value;
  const group = document.getElementById('food-group').value.trim();
  const expiration = document.getElementById('food-expiration').value;
  const item = { id: Date.now(), name, quantity, location, group, expiration, shopping: false };
  items.push(item);
  if (group && !groups.includes(group)) {
    groups.push(group);
    save();
    loadGroups();
  } else {
    save();
  }
  e.target.reset();
  render();
});

loadFoodsList();
loadGroups();
render();
