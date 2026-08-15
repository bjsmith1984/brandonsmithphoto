// Mobile nav overlay, shared by every page.
// Include with <script src="menu.js"></script> at the end of the body.
document.addEventListener("DOMContentLoaded", function () {
  const hamburger = document.querySelector(".hamburger");
  const modalMenu = document.querySelector(".mobile-nav-overlay");
  const closeBtn = document.querySelector(".mobile-nav-close");

  if (!hamburger || !modalMenu || !closeBtn) return;

  hamburger.addEventListener("click", function () {
    modalMenu.classList.add("open");
  });

  closeBtn.addEventListener("click", function () {
    modalMenu.classList.remove("open");
  });
});
