// Full-screen image modal, shared by index.html and the collection pages.
// Include with <script src="modal.js"></script> at the end of the body; the
// modal markup is built here, so pages only need their gallery links.
//
// Gallery order is the order the links appear in the page, so the main gallery
// pages through .justified-gallery and each collection pages through its own
// photos.
document.addEventListener("DOMContentLoaded", function () {
  const GALLERY_SELECTOR = document.querySelector(".justified-gallery")
    ? ".justified-gallery a"
    : ".collection a";

  // Width the carets need clear of the photo before we show them.
  const NAV_GUTTER = 72;
  const CLOSE_ICON = "https://brandonsmithphoto.s3.us-west-1.amazonaws.com/close.svg";

  if (!document.querySelector(GALLERY_SELECTOR)) return;

  const modal = document.createElement("div");
  modal.className = "image-modal";
  modal.id = "imageModal";
  modal.innerHTML =
    '<span class="modal-close" id="modalClose"><img src="' + CLOSE_ICON + '" alt="Close"></span>' +
    '<button class="modal-nav modal-nav-prev" id="modalPrev" type="button" aria-label="Previous photo">' +
    '<svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="15 4 7 12 15 20"></polyline></svg>' +
    '</button>' +
    '<img id="modalImg" src="" alt="Full image view">' +
    '<button class="modal-nav modal-nav-next" id="modalNext" type="button" aria-label="Next photo">' +
    '<svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="9 4 17 12 9 20"></polyline></svg>' +
    '</button>';
  document.body.appendChild(modal);

  const modalImg = modal.querySelector("#modalImg");
  const modalClose = modal.querySelector("#modalClose");
  const modalPrev = modal.querySelector("#modalPrev");
  const modalNext = modal.querySelector("#modalNext");

  let savedScrollY = 0;
  let galleryHrefs = [];
  let currentIndex = -1;

  function refreshGallery() {
    galleryHrefs = Array.from(document.querySelectorAll(GALLERY_SELECTOR))
      .map(a => a.href);
  }

  function showIndex(index) {
    if (!galleryHrefs.length) return;
    currentIndex = (index + galleryHrefs.length) % galleryHrefs.length;
    modalImg.src = galleryHrefs[currentIndex];
  }

  function hasFinePointer() {
    return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  }

  // Carets only on desktop-style pointers, and only when the photo leaves
  // enough white on both sides that they won't sit on top of it.
  function updateNavCarets() {
    const imgWidth = modalImg.getBoundingClientRect().width;
    const gutter = (modal.clientWidth - imgWidth) / 2;
    const show = hasFinePointer() && imgWidth > 0 && gutter >= NAV_GUTTER;
    modal.classList.toggle("has-nav", show);
  }

  function openModal(href) {
    refreshGallery();
    currentIndex = galleryHrefs.indexOf(href);
    savedScrollY = window.scrollY;
    modalImg.src = href;
    modal.style.display = "flex";
    document.body.style.top = -savedScrollY + "px";
    document.body.classList.add("modal-open");
    if (modalImg.complete) updateNavCarets();
  }

  function closeModal() {
    modal.style.display = "none";
    modal.classList.remove("has-nav");
    modalImg.src = "";
    document.body.classList.remove("modal-open");
    document.body.style.top = "";
    window.scrollTo(0, savedScrollY);
  }

  document.querySelectorAll(GALLERY_SELECTOR).forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      openModal(this.href);
    });
  });

  modalClose.onclick = closeModal;

  modalImg.addEventListener('load', updateNavCarets);
  window.addEventListener('resize', function () {
    if (modal.style.display === "flex") updateNavCarets();
  });

  modalPrev.addEventListener('click', function (e) {
    e.stopPropagation();
    showIndex(currentIndex - 1);
  });

  modalNext.addEventListener('click', function (e) {
    e.stopPropagation();
    showIndex(currentIndex + 1);
  });

  // Tap left third of the image = previous photo, right third = next photo.
  modalImg.addEventListener('click', function (e) {
    e.stopPropagation();
    const rect = modalImg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width / 3) {
      showIndex(currentIndex - 1);
    } else if (x > (rect.width * 2) / 3) {
      showIndex(currentIndex + 1);
    }
  });

  // Clicking the white area around the photo also pages: left half back,
  // right half forward. Close with the X or Escape.
  modal.onclick = function (e) {
    if (e.target !== modal) return;

    // On touch devices, keep tap-outside-to-close for the bands above and
    // below the photo; the sides still page.
    if (!hasFinePointer()) {
      const rect = modalImg.getBoundingClientRect();
      if (e.clientY < rect.top || e.clientY > rect.bottom) {
        closeModal();
        return;
      }
    }

    if (e.clientX < modal.clientWidth / 2) {
      showIndex(currentIndex - 1);
    } else {
      showIndex(currentIndex + 1);
    }
  };

  document.addEventListener("keydown", function (e) {
    if (modal.style.display !== "flex") return;
    if (e.key === "Escape") {
      closeModal();
    } else if (e.key === "ArrowLeft") {
      showIndex(currentIndex - 1);
    } else if (e.key === "ArrowRight") {
      showIndex(currentIndex + 1);
    }
  });
});
