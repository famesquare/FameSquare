// script.js

const grid = document.getElementById('grid');
const container = document.querySelector('.grid-container');
const targetSquares = 32 * 32;
let squareSize = window.innerWidth <= 768 ? 40 : 65;

function updateGridLayout() {
  grid.style.gridTemplateColumns = `repeat(32, ${squareSize}px)`;
  grid.style.gridTemplateRows = `repeat(32, ${squareSize}px)`;
  document.querySelectorAll('.square').forEach(square => {
    square.style.width = `${squareSize}px`;
    square.style.height = `${squareSize}px`;
  });
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

fetch('users.json')
  .then(res => res.json())
  .then(users => {
    // UI elements
    const reservedCount = document.getElementById('reserved-count');
    const input        = document.getElementById('search-input');
    const searchBtn    = document.getElementById('search-btn');
    const infoBox      = document.getElementById('info-container');
    const userBox      = document.getElementById('user-info');
    const userDisplay  = document.getElementById('user-display');
    const backBtn      = document.getElementById('back-btn');

    // update reservation count
    reservedCount.textContent = users.length;

    // showUser helper
    function showUser(user) {
      infoBox.style.display = 'none';
      userBox.style.display = 'block';
      userDisplay.innerHTML = `
        <h2>Square #${user.square}</h2>
        <img src="images/${user.image}" style="width:100%; max-height:300px; object-fit:cover; border-radius:10px;" />
        <p><strong>Name:</strong> ${user.name}</p>
        <p><strong>Link:</strong> <a href="${user.link}" target="_blank">${user.link}</a></p>
      `;
    }

    // build grid
    for (let i = 1; i <= targetSquares; i++) {
      const square = document.createElement('div');
      square.className = 'square';
      square.dataset.number = i;

      const user = users.find(u => u.square === i);
      if (user) {
        const img = new Image();
        img.src = `images/${user.image}`;
        img.onload = () => {
          square.style.backgroundImage = `url('${img.src}')`;
          square.textContent = '';
        };
        img.onerror = () => {
          square.textContent = i;
        };
      } else {
        square.textContent = i;
      }

      // click handler
      square.addEventListener('click', () => {
        if (user) showUser(user);
        else alert('This square is free. Contact us at famesquareofficial@gmail.com to buy it now!');
      });

      grid.appendChild(square);
    }

    // initial pan to center
    updateGridLayout();
    const initialPanX = (grid.offsetWidth - container.offsetWidth) / 2;
    const initialPanY = (grid.offsetHeight - container.offsetHeight) / 2;
    grid.style.transform = `translate(-${initialPanX}px, -${initialPanY}px)`;

    // panning logic
    let lastMove = 0, delay = 20;
    function onMove(clientX, clientY) {
      const now = Date.now();
      if (now - lastMove < delay) return;
      lastMove = now;
      const rect = container.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const rawX = (x / container.offsetWidth) * (grid.offsetWidth - container.offsetWidth);
      const rawY = (y / container.offsetHeight) * (grid.offsetHeight - container.offsetHeight);
      const clampedX = clamp(rawX, 0, grid.offsetWidth - container.offsetWidth);
      const clampedY = clamp(rawY, 0, grid.offsetHeight - container.offsetHeight);
      grid.style.transform = `translate(-${clampedX}px, -${clampedY}px)`;
    }

    container.addEventListener('mousemove', e => onMove(e.clientX, e.clientY));
    container.addEventListener('touchmove', e => {
      onMove(e.touches[0].clientX, e.touches[0].clientY);
      e.preventDefault();
    });

    // search button
    searchBtn.addEventListener('click', () => {
      const num = parseInt(input.value);
      if (isNaN(num) || num < 1 || num > targetSquares) {
        return alert('Enter a number between 1 and ' + targetSquares);
      }
      const user = users.find(u => u.square === num);
      if (user) showUser(user);
      else alert('This square is free. Contact us at famesquareofficial@gmail.com to buy it now!');
    });

    // back button
    backBtn.addEventListener('click', () => {
      userBox.style.display = 'none';
      infoBox.style.display = 'block';
    });
  })
  .catch(err => console.error('Error loading users:', err));
