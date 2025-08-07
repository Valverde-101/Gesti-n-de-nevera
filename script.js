const STORAGE_KEY = 'items';
let items = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
let selectedFood = null;
let editingId = null;



function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function render() {
  const container = document.getElementById('items');
  if (!container) return;
  container.innerHTML = '';
  const location = document.body.dataset.location;
  const byCategory = {};
  items.filter(i => i.location === location).forEach(item => {
    (byCategory[item.category] ||= []).push(item);
  });
  Object.entries(byCategory).forEach(([cat, list]) => {
    const title = document.createElement('h2');
    title.textContent = cat;
    container.appendChild(title);
    list.forEach(item => {
      const div = document.createElement('div');
      div.className = 'item';
      const img = document.createElement('img');
      img.src = item.icon;
      img.alt = item.name;
      div.appendChild(img);
      const name = document.createElement('span');
      name.textContent = `${item.name} - ${item.quantity} ${item.unit || ''}`;
      div.appendChild(name);
      const actions = document.createElement('div');
      actions.className = 'actions';
      const editBtn = document.createElement('button');
      editBtn.textContent = 'Editar';
      editBtn.onclick = () => openModal(true, item);
      const delBtn = document.createElement('button');
      delBtn.textContent = 'Eliminar';
      delBtn.onclick = () => {
        items = items.filter(i => i.id !== item.id);
        save();
        render();
      };
      actions.appendChild(editBtn);
      actions.appendChild(delBtn);
      div.appendChild(actions);
      container.appendChild(div);
    });
  });
}

function openModal(edit = false, item = null) {
  selectedFood = null;
  editingId = null;
  const form = document.getElementById('add-form');
  form.classList.add('hidden');
  document.getElementById('food-qty').value = '1';
  document.getElementById('food-unit').value = 'unidades';
  document.getElementById('food-exp').value = '';

  const grid = document.getElementById('icon-grid');
  grid.innerHTML = '';
  Object.entries(ICON_CATEGORIES).forEach(([cat, foods]) => {
    const header = document.createElement('h3');
    header.textContent = cat;
    grid.appendChild(header);
    const wrap = document.createElement('div');
    wrap.className = 'category-grid';
    foods.forEach(food => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'icon-btn';
      btn.innerHTML = `<img src="${food.icon}" alt="${food.name}"><span>${food.name}</span>`;
      btn.onclick = () => selectFood({ ...food, category: cat });
      wrap.appendChild(btn);
    });
    grid.appendChild(wrap);
  });

  if (edit && item) {
    editingId = item.id;
    selectFood({ name: item.name, icon: item.icon, category: item.category });
    document.getElementById('food-qty').value = item.quantity;
    document.getElementById('food-unit').value = item.unit;
    document.getElementById('food-exp').value = item.expiration;
  }

  document.getElementById('add-modal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('add-modal').classList.add('hidden');
}

function selectFood(food) {
  selectedFood = food;
  document.getElementById('selected-icon').src = food.icon;
  document.getElementById('selected-name').textContent = food.name;
  document.getElementById('add-form').classList.remove('hidden');
}

document.getElementById('add-btn')?.addEventListener('click', () => openModal());
document.getElementById('close-modal')?.addEventListener('click', closeModal);

document.getElementById('add-form')?.addEventListener('submit', e => {
  e.preventDefault();
  if (!selectedFood) return;
  const quantity = parseInt(document.getElementById('food-qty').value, 10) || 1;
  const unit = document.getElementById('food-unit').value;
  const expiration = document.getElementById('food-exp').value;
  const location = document.body.dataset.location;
  if (editingId) {
    const idx = items.findIndex(i => i.id === editingId);
    if (idx > -1) {
      items[idx] = { ...items[idx], name: selectedFood.name, icon: selectedFood.icon, quantity, unit, expiration, category: selectedFood.category };
    }
  } else {
    const item = { id: Date.now(), name: selectedFood.name, icon: selectedFood.icon, quantity, unit, expiration, location, category: selectedFood.category };
    items.push(item);
  }
  save();
  closeModal();
  render();
});

render();
