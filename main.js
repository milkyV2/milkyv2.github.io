let allPlayers = []; // Store all players for search

async function loadTierData() {
  try {
    const [tier1, tier2, tier3, tier4, tier5] = await Promise.all([
      fetch('data/tier1.json').then(res => res.json()),
      fetch('data/tier2.json').then(res => res.json()),
      fetch('data/tier3.json').then(res => res.json()),
      fetch('data/tier4.json').then(res => res.json()),
      fetch('data/tier5.json').then(res => res.json())
    ]);

    // Collect all players for search
    allPlayers = [
      ...tier1.map(p => ({ ...p, tierLevel: 1 })),
      ...tier2.map(p => ({ ...p, tierLevel: 2 })),
      ...tier3.map(p => ({ ...p, tierLevel: 3 })),
      ...tier4.map(p => ({ ...p, tierLevel: 4 })),
      ...tier5.map(p => ({ ...p, tierLevel: 5 })),
    ];

    return { tier1, tier2, tier3, tier4, tier5 };
  } catch (error) {
    console.error('Error loading tier data:', error);
    return null;
  }
}

function showInfoTab(name, tier, tierLevel, region) {
  // Remove any existing info tab and overlay
  const existingTab = document.querySelector('.info-tab');
  const existingOverlay = document.querySelector('.overlay');
  if (existingTab) existingTab.remove();
  if (existingOverlay) existingOverlay.remove();

  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'overlay';
  document.body.appendChild(overlay);

  // Create new info tab
  const infoTab = document.createElement('div');
  infoTab.className = 'info-tab';
  if (region) {
    infoTab.classList.add(`region-${region}`);
  }
  
  // Add profile picture
  const img = document.createElement('img');
  img.src = `https://render.crafty.gg/3d/bust/${name}`;
  img.alt = name;
  if (region) {
    img.classList.add(`region-${region}`);
  }
  infoTab.appendChild(img);
  
  // Add text content
  const text = document.createElement('div');
  const tierText = tier === 1 ? `HT${tierLevel}` : `LT${tierLevel}`;
  text.innerHTML = `
    ${name} is a <span class="tier-text tier-${tierText.toLowerCase()}">${tierText}</span>
    <br>Region: <span class="region-text-${region || 'unknown'}">${region || 'Unknown'}</span>
  `;
  infoTab.appendChild(text);

  // Add elements to body
  document.body.appendChild(infoTab);

  // Show elements with animations
  requestAnimationFrame(() => {
    overlay.style.display = 'block';
    infoTab.style.display = 'block';
    setTimeout(() => {
      overlay.classList.add('active');
      infoTab.classList.add('active');
    }, 10);
  });

  // Close on overlay click
  overlay.addEventListener('click', hideInfoTab);

  // Close on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      hideInfoTab();
    }
  });

  // Prevent closing when clicking inside the info tab
  infoTab.addEventListener('click', (e) => {
    e.stopPropagation();
  });
}

function hideInfoTab() {
  const overlay = document.querySelector('.overlay');
  const infoTab = document.querySelector('.info-tab');
  
  if (overlay && infoTab) {
    overlay.classList.remove('active');
    infoTab.classList.remove('active');
    setTimeout(() => {
      overlay.style.display = 'none';
      infoTab.style.display = 'none';
      overlay.remove();
      infoTab.remove();
    }, 300);
  }
}

function getRegionClass(region) {
  // Only allow known regions, otherwise return 'unknown'
  const knownRegions = ['NA', 'EU', 'AS', 'OC'];
  return knownRegions.includes(region) ? region : 'unknown';
}

async function initializeTable() {
  const data = await loadTierData();
  if (!data) return;

  // Sort each tier array so tier 1 players are above tier 0
  const sortTier = (tierArray) => tierArray.sort((a, b) => b.tier - a.tier);

  const tier1 = sortTier(data.tier1);
  const tier2 = sortTier(data.tier2);
  const tier3 = sortTier(data.tier3);
  const tier4 = sortTier(data.tier4);
  const tier5 = sortTier(data.tier5);

  const maxRows = Math.max(
    tier1.length,
    tier2.length,
    tier3.length,
    tier4.length,
    tier5.length
  );

  const tableHTML = `
    <table>
      <thead>
        <tr>
          <th>TIER 1 <img src="public/tiers/tier1.png" alt="Tier 1" style="height: 1em; vertical-align: middle;"></th>
          <th>TIER 2 <img src="public/tiers/tier2.png" alt="Tier 2" style="height: 1em; vertical-align: middle;"></th>
          <th>TIER 3 <img src="public/tiers/tier3.png" alt="Tier 3" style="height: 1em; vertical-align: middle;"></th>
          <th>TIER 4</th>
          <th>TIER 5</th>
        </tr>
      </thead>
      <tbody>
        ${Array.from({ length: maxRows }, (_, i) => `
          <tr>
            <td class="tier-${tier1[i]?.tier ?? ''} region-${getRegionClass(tier1[i]?.region)}" onclick="window.showInfo('${tier1[i]?.name ?? ''}', ${tier1[i]?.tier ?? 0}, 1, '${tier1[i]?.region ?? ''}')">${tier1[i]?.name ?? ''}</td>
            <td class="tier-${tier2[i]?.tier ?? ''} region-${getRegionClass(tier2[i]?.region)}" onclick="window.showInfo('${tier2[i]?.name ?? ''}', ${tier2[i]?.tier ?? 0}, 2, '${tier2[i]?.region ?? ''}')">${tier2[i]?.name ?? ''}</td>
            <td class="tier-${tier3[i]?.tier ?? ''} region-${getRegionClass(tier3[i]?.region)}" onclick="window.showInfo('${tier3[i]?.name ?? ''}', ${tier3[i]?.tier ?? 0}, 3, '${tier3[i]?.region ?? ''}')">${tier3[i]?.name ?? ''}</td>
            <td class="tier-${tier4[i]?.tier ?? ''} region-${getRegionClass(tier4[i]?.region)}" onclick="window.showInfo('${tier4[i]?.name ?? ''}', ${tier4[i]?.tier ?? 0}, 4, '${tier4[i]?.region ?? ''}')">${tier4[i]?.name ?? ''}</td>
            <td class="tier-${tier5[i]?.tier ?? ''} region-${getRegionClass(tier5[i]?.region)}" onclick="window.showInfo('${tier5[i]?.name ?? ''}', ${tier5[i]?.tier ?? 0}, 5, '${tier5[i]?.region ?? ''}')">${tier5[i]?.name ?? ''}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  document.querySelector('#app').innerHTML = tableHTML;

  // Add the showInfo function to the window object so it can be called from onclick
  window.showInfo = (name, tier, tierLevel, region) => {
    if (name) {
      showInfoTab(name, tier, tierLevel, region);
    }
  };

  // --- Search functionality ---
  const searchInput = document.getElementById('search-input');
  const errorMsg = document.getElementById('error-message');

  function searchPlayer() {
    const query = searchInput.value.trim().toLowerCase();
    errorMsg.textContent = '';
    if (!query) return;
  
    const player = allPlayers.find(
      p => p.name.toLowerCase() === query
    );
    if (player) {
      showInfoTab(player.name, player.tier, player.tierLevel, player.region);
    } else {
      errorMsg.textContent = 'Player not found';
    }
  }
  
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      searchPlayer();
    }
  });
}

initializeTable();

// Add this function to show kit info
function showKitInfo() {
  // Remove any existing info tab and overlay
  const existingTab = document.querySelector('.info-tab');
  const existingOverlay = document.querySelector('.overlay');
  if (existingTab) existingTab.remove();
  if (existingOverlay) existingOverlay.remove();

  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'overlay';
  document.body.appendChild(overlay);

  // Create new info tab
  const infoTab = document.createElement('div');
  infoTab.className = 'info-tab kit-tab';
  infoTab.style.padding = '0';
  infoTab.style.background = 'transparent';
  infoTab.style.border = 'none';
  infoTab.style.boxShadow = 'none';
  infoTab.style.backdropFilter = 'none';
  infoTab.style.webkitBackdropFilter = 'none';
  
  // Add kit image
  const img = document.createElement('img');
  img.src = 'public/kit.png';
  img.alt = 'Kit Information';
  img.className = 'kit-image';
  img.style.width = '100%';
  img.style.height = 'auto';
  img.style.maxHeight = 'calc(100vh - 200px)';
  img.style.objectFit = 'contain';
  infoTab.appendChild(img);

  // Add elements to body
  document.body.appendChild(infoTab);

  // Show elements with animations
  requestAnimationFrame(() => {
    overlay.style.display = 'block';
    infoTab.style.display = 'block';
    setTimeout(() => {
      overlay.classList.add('active');
      infoTab.classList.add('active');
    }, 10);
  });

  // Close on overlay click
  overlay.addEventListener('click', hideInfoTab);

  // Close on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      hideInfoTab();
    }
  });

  // Prevent closing when clicking inside the info tab
  infoTab.addEventListener('click', (e) => {
    e.stopPropagation();
  });
}

// Add to window object
window.showKitInfo = showKitInfo;