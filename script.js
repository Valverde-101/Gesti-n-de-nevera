const FOOD_KEY = 'items';
const GROUP_KEY = 'groups';
let items = JSON.parse(localStorage.getItem(FOOD_KEY) || '[]');
let groups = JSON.parse(localStorage.getItem(GROUP_KEY) || '[]');

const foodsCatalog = [
  { name: 'Manzana', icon: '🍎', group: 'Frutas' },
  { name: 'Banana', icon: '🍌', group: 'Frutas' },
  { name: 'Zanahoria', icon: '🥕', group: 'Verduras' },
  { name: 'Lechuga', icon: '🥬', group: 'Verduras' }
];

const currentLocation = document.body.dataset.location || 'Nevera';

function save() {
  localStorage.setItem(FOOD_KEY, JSON.stringify(items));
  localStorage.setItem(GROUP_KEY, JSON.stringify(groups));
}

function loadFoodsList() {
  const select = document.getElementById('food-name');
  foodsCatalog.forEach(f => {
    const opt = document.createElement('option');
    opt.value = f.name;
    opt.textContent = `${f.icon} ${f.name}`;
    select.appendChild(opt);
  });
}

function loadGroups() {
  const data = document.getElementById('groups');
  if (!data) return;
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
  if (!container) return;
  container.innerHTML = '';
  items.filter(it => it.location === currentLocation).forEach(item => {
    const div = document.createElement('div');
    div.className = 'item';

    const nameSpan = document.createElement('span');
    nameSpan.className = 'name';
    nameSpan.textContent = `${item.icon || ''} ${item.name}`;
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
    qty.textContent = `${item.quantity} ${item.unit}`;
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

    container.appendChild(div);
  });
}

function renderShopping() {
  const ul = document.getElementById('shopping-list');
  if (!ul) return;
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

const addButton = document.getElementById('add-button');
const modal = document.getElementById('add-modal');
if (addButton && modal) {
  addButton.onclick = () => modal.classList.remove('hidden');
  document.getElementById('cancel-button').onclick = () => modal.classList.add('hidden');
}

document.getElementById('add-form')?.addEventListener('submit', e => {
  e.preventDefault();
  const name = document.getElementById('food-name').value;
  const foodData = foodsCatalog.find(f => f.name === name) || {};
  const quantity = parseInt(document.getElementById('food-quantity').value, 10) || 1;
  const unit = document.getElementById('food-unit').value;
  const location = document.getElementById('food-location').value;
  const expiration = document.getElementById('food-expiration').value;
  const item = { id: Date.now(), name, icon: foodData.icon, quantity, unit, location, group: foodData.group, expiration, shopping: false };
  items.push(item);
  if (foodData.group && !groups.includes(foodData.group)) {
    groups.push(foodData.group);
    save();
    loadGroups();
  } else {
    save();
  }
  e.target.reset();
  modal.classList.add('hidden');
  render();
});

loadFoodsList();
loadGroups();
render();
