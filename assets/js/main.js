// Sidebar Toggle
const sidebar = document.querySelector('aside.sidebar');
const menuTrigger = document.querySelector('button.menu-trigger');
const menuTriggerClose = document.querySelector('button.menu-trigger-close');
const menuOpacity = document.querySelector('div.menu-overlay');

const toggleSidebar = () => {
  if (sidebar.classList.contains('!translate-x-0')) {
    sidebar.classList.remove('!translate-x-0')
    menuOpacity.classList.add('hidden')
  } else {
    sidebar.classList.add('!translate-x-0')
    menuOpacity.classList.remove('hidden')
  }
}

menuTrigger.addEventListener('click', toggleSidebar)
menuTriggerClose.addEventListener('click', toggleSidebar)
menuOpacity.addEventListener('click', toggleSidebar)

// Blog Page Scroll restoration
const scrollElement = document.querySelector('.scroll-area');
const scrollElementStateKey = "ScrollElementPosition";
window.onbeforeunload = function () {
  if (!scrollElement) return;
  const scrollPos = scrollElement.scrollTop;
  if (scrollPos) {
    localStorage.setItem(scrollElementStateKey, scrollPos)
  }
}
window.onload = function () {
  const scrollPos = localStorage.getItem(scrollElementStateKey)
  localStorage.removeItem(scrollElementStateKey);
  if (scrollElement) {
    scrollElement.scrollTop = scrollPos
  }
}

// Dark mode
const darkModeToggle = document.querySelector('.dark-mode-toggle');
const darkModeStateKey = "DarkMode";
const isDark = JSON.parse(localStorage.getItem(darkModeStateKey) || 'false')
if (isDark) {
  document.documentElement.classList.add('dark');
}
darkModeToggle.addEventListener('click', () => {
  if (document.documentElement.classList.contains('dark')) {
    document.documentElement.classList.remove('dark');
    localStorage.setItem(darkModeStateKey, false)
  } else {
    document.documentElement.classList.add('dark');
    localStorage.setItem(darkModeStateKey, true)

  }
})


// Navigation active state management
function updateNavigationState() {
  const urlParams = new URLSearchParams(window.location.search);
  const currentTag = urlParams.get('tag');
  const currentPath = window.location.pathname;
  
  // Remove active class from all nav items
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('bg-slate-800', 'text-white', 'dark:bg-slate-50', 'dark:text-slate-800', 'dark:selection:bg-slate-400');
  });
  
  let activeItem = null;
  
  if (currentTag) {
    // If there's a tag query parameter, find the matching tag nav item
    activeItem = document.querySelector(`[data-tag="${currentTag}"]`);
  } else if (currentPath.startsWith('/articles')) {
    // If on articles page without tag, activate "All Articles"
    activeItem = document.querySelector('[data-section="articles"]');
  } else if (currentPath === '/') {
    // If on home page, activate "Home"
    activeItem = document.querySelector('[data-section="home"]');
  } else if (currentPath.startsWith('/tags/')) {
    // If on a tag page directly, extract tag from path
    const tagFromPath = currentPath.replace('/tags/', '').replace('/', '');
    activeItem = document.querySelector(`[data-tag="${tagFromPath}"]`);
  }
  
  if (activeItem && !activeItem.classList.contains('cursor-default')) {
    activeItem.classList.add('bg-slate-800', 'text-white', 'dark:bg-slate-50', 'dark:text-slate-800', 'dark:selection:bg-slate-400');
  }
}

// Run on page load and URL changes
document.addEventListener('DOMContentLoaded', updateNavigationState);
window.addEventListener('popstate', updateNavigationState);