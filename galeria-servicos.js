const dialog = document.querySelector(".service-gallery");
const title = dialog.querySelector("h2");
const display = dialog.querySelector(".gallery-image");
const status = dialog.querySelector(".gallery-status");
const previous = dialog.querySelector('[data-step="-1"]');
const next = dialog.querySelector('[data-step="1"]');
const extensions = ["jpg", "jpeg", "webp", "png"];

let currentGallery;
let position = 0;

async function findPhoto(folder, number) {
  const basename = String(number).padStart(2, "0");
  for (const extension of extensions) {
    const photo = new Image();
    photo.src = `assets/servicos/${folder}/${basename}.${extension}`;
    try {
      await photo.decode();
      return photo;
    } catch {
      // Try the next supported format for this number.
    }
  }
  return null;
}

async function loadGallery(gallery) {
  while (true) {
    const photo = await findPhoto(gallery.folder, gallery.photos.length + 1);
    if (!photo) break;
    gallery.photos.push(photo);
    if (dialog.open && currentGallery === gallery) renderPhoto();
  }
  gallery.loading = false;
  if (dialog.open && currentGallery === gallery) renderPhoto();
}

function renderPhoto() {
  const { name, photos, loading } = currentGallery;
  const source = photos[position].src;
  if (display.src !== source) display.src = source;
  display.alt = `${name} – foto ${position + 1}`;
  display.hidden = false;
  status.textContent = loading
    ? `Foto ${position + 1} · carregando`
    : `${position + 1} de ${photos.length}`;
  previous.disabled = position === 0;
  next.disabled = position + 1 >= photos.length;
}

function move(step) {
  position = Math.max(0, Math.min(position + step, currentGallery.photos.length - 1));
  renderPhoto();
}

previous.addEventListener("click", () => move(-1));
next.addEventListener("click", () => move(1));
dialog.addEventListener("keydown", (event) => {
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
  event.preventDefault();
  move(event.key === "ArrowLeft" ? -1 : 1);
});

async function addCover(card) {
  const folder = card.dataset.gallery;
  const photo = await findPhoto(folder, 1);
  if (!photo) return;

  const name = card.querySelector("h2").textContent;
  const gallery = { folder, name, photos: [photo], loading: true };
  const cover = document.createElement("button");
  cover.type = "button";
  cover.className = "service-cover";
  cover.setAttribute("aria-label", `Abrir galeria de ${name}`);
  photo.alt = "";
  cover.append(photo);
  cover.addEventListener("click", () => {
    currentGallery = gallery;
    position = 0;
    title.textContent = name;
    renderPhoto();
    dialog.showModal();
    if (gallery.photos.length === 1 && gallery.loading) {
      gallery.request ??= loadGallery(gallery);
    }
  });
  card.prepend(cover);
}

document.querySelectorAll("[data-gallery]").forEach(addCover);
