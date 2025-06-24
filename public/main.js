(() => {
  // <stdin>
  var sidebar = document.querySelector("aside.sidebar");
  var menuTrigger = document.querySelector("button.menu-trigger");
  var menuTriggerClose = document.querySelector("button.menu-trigger-close");
  var menuOpacity = document.querySelector("div.menu-overlay");
  var toggleSidebar = () => {
    if (sidebar.classList.contains("!translate-x-0")) {
      sidebar.classList.remove("!translate-x-0");
      menuOpacity.classList.add("hidden");
    } else {
      sidebar.classList.add("!translate-x-0");
      menuOpacity.classList.remove("hidden");
    }
  };
  menuTrigger.addEventListener("click", toggleSidebar);
  menuTriggerClose.addEventListener("click", toggleSidebar);
  menuOpacity.addEventListener("click", toggleSidebar);
  var scrollElement = document.querySelector(".scroll-area");
  var scrollElementStateKey = "ScrollElementPosition";
  window.onbeforeunload = function() {
    if (!scrollElement)
      return;
    const scrollPos = scrollElement.scrollTop;
    if (scrollPos) {
      localStorage.setItem(scrollElementStateKey, scrollPos);
    }
  };
  window.onload = function() {
    const scrollPos = localStorage.getItem(scrollElementStateKey);
    localStorage.removeItem(scrollElementStateKey);
    if (scrollElement) {
      scrollElement.scrollTop = scrollPos;
    }
  };
  var darkModeToggle = document.querySelector(".dark-mode-toggle");
  var darkModeStateKey = "DarkMode";
  var isDark = JSON.parse(localStorage.getItem(darkModeStateKey) || "false");
  if (isDark) {
    document.documentElement.classList.add("dark");
  }
  darkModeToggle.addEventListener("click", () => {
    if (document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem(darkModeStateKey, false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem(darkModeStateKey, true);
    }
  });
  function updateNavigationState() {
    const urlParams = new URLSearchParams(window.location.search);
    const currentTag = urlParams.get("tag");
    const currentPath = window.location.pathname;
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.classList.remove("bg-slate-800", "text-white", "dark:bg-slate-50", "dark:text-slate-800", "dark:selection:bg-slate-400");
    });
    let activeItem = null;
    if (currentTag) {
      activeItem = document.querySelector(`[data-tag="${currentTag}"]`);
    } else if (currentPath.startsWith("/articles")) {
      activeItem = document.querySelector('[data-section="articles"]');
    } else if (currentPath === "/") {
      activeItem = document.querySelector('[data-section="home"]');
    } else if (currentPath.startsWith("/tags/")) {
      const tagFromPath = currentPath.replace("/tags/", "").replace("/", "");
      activeItem = document.querySelector(`[data-tag="${tagFromPath}"]`);
    }
    if (activeItem && !activeItem.classList.contains("cursor-default")) {
      activeItem.classList.add("bg-slate-800", "text-white", "dark:bg-slate-50", "dark:text-slate-800", "dark:selection:bg-slate-400");
    }
  }
  document.addEventListener("DOMContentLoaded", updateNavigationState);
  window.addEventListener("popstate", updateNavigationState);
})();
