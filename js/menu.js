// -------------------------------------------------------------------------
// 「別の形を試す」「別の色を試す」：候補のパネルを開け閉めする
//
// ・同時に開くのは1つだけ（色を開いたら形は閉じる）
// ・選んでも閉じない（つづけて試せる）
// ・外側をクリック / Esc キーで閉じる
// ※ lastInput は controls.js にある変数（放置デモに切り替わらないようにするため）
// -------------------------------------------------------------------------
const menus = [
  {
    button: document.getElementById("shapeBtn"),
    panel: document.getElementById("shapes"),
  },
  {
    button: document.getElementById("themeBtn"),
    panel: document.getElementById("themes"),
  },
];

function setMenu(menu, open) {
  menu.panel.hidden = !open;
  menu.button.setAttribute("aria-expanded", String(open));
}

function closeMenus() {
  for (const menu of menus) setMenu(menu, false);
}

for (const menu of menus) {
  menu.button.addEventListener("click", () => {
    const willOpen = menu.panel.hidden;
    closeMenus();
    setMenu(menu, willOpen);
    lastInput = performance.now();
  });
}

document.addEventListener("click", (event) => {
  if (!event.target.closest(".menu")) closeMenus();
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  closeMenus();
  if (!modal.hidden) closeModal(); // modal / closeModal は share.js にある
});
