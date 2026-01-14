        // Game state - stored in memory
        let gameState = {
            level: 1,
            xp: 0,
            xpToNextLevel: 100,
            totalWorkouts: 0,
            streak: 0,
            completedToday: [],
            achievements: {
                firstWorkout: false,
                tenWorkouts: false,
                levelFive: false,
                streakThree: false
            }
        };

        // Exercise database
        const exercises = [
            { id: 1, name: 'Bench Press', sets: '4x8', xp: 25 },
            { id: 2, name: 'Overhead Press', sets: '4x12', xp: 30 },
            { id: 3, name: 'Cardio', sets: '15min', xp: 20 },
            { id: 4, name: 'Tri Pushdown', sets: '2x10', xp: 25 },
            { id: 5, name: 'Peck Fly', sets: '3x8', xp: 35 },
            { id: 6, name: 'Mountain Climbers', sets: '3x20', xp: 30 }
        ];

        // Achievement definitions
        const achievementDefs = [
            { id: 'firstWorkout', name: 'First Steps', icon: '🎯', desc: 'Complete your first workout' },
            { id: 'tenWorkouts', name: 'Dedicated', icon: '💪', desc: 'Complete 10 total workouts' },
            { id: 'levelFive', name: 'Rising Warrior', icon: '⚔️', desc: 'Reach level 5' },
            { id: 'streakThree', name: 'On Fire', icon: '🔥', desc: 'Complete 3 workouts in one day' }
        ];

        // Load saved data on start
        function loadGame() {
            const saved = localStorage.getItem('workoutRPG');
            if (saved) {
                const data = JSON.parse(saved);
                gameState = { ...gameState, ...data };
                // Reset daily progress if it's a new day
                const lastPlayed = localStorage.getItem('lastPlayed');
                const today = new Date().toDateString();
                if (lastPlayed !== today) {
                    gameState.completedToday = [];
                    gameState.streak = 0;
                }
            }
            updateUI();
        }

        // Save game state
        function saveGame() {
            localStorage.setItem('workoutRPG', JSON.stringify(gameState));
            localStorage.setItem('lastPlayed', new Date().toDateString());
        }

        // Render exercises
        function renderExercises() {
            const container = document.getElementById('exercises');
            container.innerHTML = exercises.map(ex => {
                const completed = gameState.completedToday.includes(ex.id);
                return `
                    <div class="exercise-item">
                        <div class="exercise-info">
                            <h3>${ex.name}</h3>
                            <div class="exercise-reward">${ex.sets} • +${ex.xp} XP</div>
                        </div>
                        <button 
                            class="complete-btn ${completed ? 'completed' : ''}" 
                            onclick="completeExercise(${ex.id})"
                            ${completed ? 'disabled' : ''}
                        >
                            ${completed ? '✓ Done' : 'Complete'}
                        </button>
                    </div>
                `;
            }).join('');
        }

        // Complete an exercise
        function completeExercise(id) {
            const exercise = exercises.find(e => e.id === id);
            if (!exercise || gameState.completedToday.includes(id)) return;

            gameState.completedToday.push(id);
            gameState.xp += exercise.xp;
            gameState.totalWorkouts++;
            gameState.streak++;

            // Check for level up
            while (gameState.xp >= gameState.xpToNextLevel) {
                gameState.xp -= gameState.xpToNextLevel;
                gameState.level++;
                gameState.xpToNextLevel = Math.floor(gameState.xpToNextLevel * 1.5);
                showLevelUp();
            }

            checkAchievements();
            saveGame();
            updateUI();
        }

        // Show level up notification
        function showLevelUp() {
            const notification = document.getElementById('level-up-notification');
            notification.classList.add('show');
            setTimeout(() => {
                notification.classList.remove('show');
            }, 2000);
        }

        // Check and unlock achievements
        function checkAchievements() {
            if (!gameState.achievements.firstWorkout && gameState.totalWorkouts >= 1) {
                gameState.achievements.firstWorkout = true;
            }
            if (!gameState.achievements.tenWorkouts && gameState.totalWorkouts >= 10) {
                gameState.achievements.tenWorkouts = true;
            }
            if (!gameState.achievements.levelFive && gameState.level >= 5) {
                gameState.achievements.levelFive = true;
            }
            if (!gameState.achievements.streakThree && gameState.streak >= 3) {
                gameState.achievements.streakThree = true;
            }
        }

        // Render achievements
        function renderAchievements() {
            const container = document.getElementById('achievement-list');
            container.innerHTML = achievementDefs.map(ach => {
                const unlocked = gameState.achievements[ach.id];
                return `
                    <div class="achievement-item ${unlocked ? 'unlocked' : 'locked'}">
                        <div class="achievement-icon">${unlocked ? ach.icon : '🔒'}</div>
                        <div>
                            <div style="font-weight: bold;">${ach.name}</div>
                            <div style="font-size: 0.9em; opacity: 0.9;">${ach.desc}</div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // Update all UI elements
        function updateUI() {
            document.getElementById('level').textContent = gameState.level;
            document.getElementById('xp').textContent = `${gameState.xp} / ${gameState.xpToNextLevel}`;
            
            const xpPercent = Math.floor((gameState.xp / gameState.xpToNextLevel) * 100);
            document.getElementById('xp-bar').style.width = xpPercent + '%';
            document.getElementById('xp-percent').textContent = xpPercent + '%';
            
            document.getElementById('total-workouts').textContent = gameState.totalWorkouts;
            document.getElementById('streak').textContent = gameState.streak + ' 🔥';
            
            renderExercises();
            renderAchievements();
        }

        // Initialize game
        loadGame();
const CACHE_NAME = 'workout-rpg-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install event - cache files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registered successfully:', registration.scope);
      })
      .catch(error => {
        console.log('Service Worker registration failed:', error);
      });
  });
}