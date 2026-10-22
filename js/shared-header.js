/**
 * Exact Header markup from app/components/Header.tsx (mobile + desktop).
 */
(function () {
  const A = 'assets';
  const mask = (file) =>
    [
      `-webkit-mask-image:url(${A}/${file})`,
      '-webkit-mask-size:contain',
      '-webkit-mask-position:center',
      '-webkit-mask-repeat:no-repeat',
      `mask-image:url(${A}/${file})`,
      'mask-size:contain',
      'mask-position:center',
      'mask-repeat:no-repeat',
    ].join(';');

  const searchSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" class="xl:w-7 xl:h-7 lg:w-6 lg:h-6 w-6 h-6 text-[#333] group-hover:text-[#cf254a] transition-colors" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>`;
  const bagSvg = (cls) =>
    `<svg class="${cls} text-[#333] group-hover:text-[#cf254a] transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true"><path d="M6 6h15l-1.5 9h-12z"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/><path d="M6 6L5 3H2"/></svg>`;
  const menuSvg = `<svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>`;
  const loginSvg = `<svg class="xl:w-7 xl:h-7 lg:w-6 lg:h-6 w-6 h-6 text-[#333] group-hover:text-[#cf254a] transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>`;

  const navItems = [
    'Jewelry',
    'Gold',
    'Diamond',
    'Earrings',
    'Rings',
    'Necklace',
    'Muhurat',
    'Collection',
    'Occasion',
    'Price Range',
    'More',
  ];

  const html = `
  <!-- MOBILE header — Header.tsx lg:hidden -->
  <header class="lg:hidden w-full sticky top-0 z-50">
    <div class="relative w-full">
      <div class="bg-[#e8e4d1] pt-2.5 pb-2 py-2">
        <div class="flex items-center justify-around">
          <button type="button" class="group flex flex-col items-center text-[#202020] hover:text-[#650827] cursor-pointer" aria-label="Open search">
            <div class="relative flex justify-center translate-y-[6px] translate-x-[7px]">${searchSvg}</div>
            <span class="text-[12px] font-serif text-transparent select-none">Search</span>
          </button>
          <button type="button" class="group flex flex-col items-center text-[#202020] relative cursor-pointer hover:text-[#650827]" aria-label="Wishlist">
            <div class="relative flex justify-center">
              <div class="bg-[#333] group-hover:bg-[#cf254a] transition-colors xl:w-7 xl:h-7 lg:w-6 lg:h-6 w-6 h-6" style="${mask('heart.svg')}"></div>
            </div>
            <span class="text-[12px] font-serif">Wishlist</span>
          </button>
          <a href="#" class="group flex flex-col items-center text-[#202020] hover:text-[#650827]">
            <div class="bg-[#333] group-hover:bg-[#cf254a] transition-colors xl:w-7 xl:h-7 lg:w-6 lg:h-6 w-6 h-6" style="${mask('store.svg')}"></div>
            <span class="text-[12px] font-serif">Store</span>
          </a>
          <a href="cart.html" class="group relative flex flex-col items-center text-[#202020] hover:text-[#650827] cursor-pointer" aria-label="Cart">
            <div class="relative flex justify-center">
              ${bagSvg('w-6 h-6')}
              <span data-cart-badge class="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-[#cf254a] text-white text-[10px] leading-4 font-serif text-center" style="display:none">0</span>
            </div>
            <span class="text-[12px] font-serif">Cart</span>
          </a>
          <button type="button" data-login-cta class="group relative flex flex-col items-center text-center transition cursor-pointer hover:text-[#cf254a] bg-transparent border-0 p-0">
            ${loginSvg}
            <span data-login-label class="text-[12px] font-serif">Login</span>
          </button>
        </div>
      </div>

      <div class="bg-[#650827] px-4 py-2">
        <div class="relative flex items-center justify-center">
          <button type="button" class="absolute left-0 text-white" aria-label="Toggle menu">${menuSvg}</button>
          <a href="index.html">
            <img src="${A}/kalyanLogo.svg" alt="Kalyan Jewellers logo" width="94" height="86" class="h-[86px] mx-auto" />
          </a>
        </div>
      </div>
    </div>
  </header>

  <!-- DESKTOP header — Header.tsx hidden lg:block -->
  <div class="hidden lg:block bg-[#650827]">
    <div class="flex justify-between items-start">
      <a href="index.html" class="xl:mt-8 pt-3 lg:mt-4 ml-[5.6vw] xl:mb-[1.4rem] lg:mb-[1.3rem]">
        <img src="${A}/kalyanLogo.svg" alt="Kalyan Jewellers logo" width="110" height="100" class="mx-auto translate-x-[2px] translate-y-[2px]" style="width:110px" />
      </a>
      <div class="flex-1 mr-[5.5vw]">
        <div class=" mb-8">
          <nav class="header-ctas max-w-[33vw] flex items-center justify-between bg-[#e8e4d1] lg:py-4 lg:pt-2 lg:px-4 xl:rounded-b-4xl lg:rounded-b-3xl" role="navigation">
            <form action="plp.html" method="get" class="relative flex-1 mx-1 flex items-center rounded-full">
              <input name="q" type="search" placeholder="Search entire store here..." aria-label="Search entire store"
                class="header-search-input px-4 py-2.5 pr-10 bg-white rounded-full w-full 2xl:h-[35px] xl:h-[30px] lg:h-[25px] font-serif font-normal text-[14px] outline-none placeholder:text-gray-300" />
              <button type="submit" aria-label="Search" class="absolute right-1 p-2 text-gray-600 hover:text-black font-serif cursor-pointer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="text-gray-400"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
              </button>
            </form>
            <div class="flex items-center xl:gap-5 lg:gap-4">
              <button type="button" class="group flex flex-col 2xl:space-x-2 xl:space-x-1.5 lg:space-x-1 text-center transition cursor-pointer hover:text-[#650827]" aria-label="Wishlist">
                <div class="relative flex justify-center ">
                  <div class="bg-[#333] group-hover:bg-[#cf254a] transition-colors xl:w-7 xl:h-7 lg:w-6 lg:h-6 w-6 h-6" style="${mask('heart.svg')}"></div>
                </div>
                <p class="text-center text-[#333] 2xl:text-[12px] xl:text-[11px] lg:text-[9px] font-serif">Wishlist</p>
              </button>
              <a href="#" class="group flex flex-col items-center space-x-2 text-center transition cursor-pointer hover:text-[#cf254a]">
                <div class="flex justify-center ">
                  <div class="bg-[#333] group-hover:bg-[#cf254a] transition-colors xl:w-7 xl:h-7 lg:w-6 lg:h-6 w-6 h-6" style="${mask('store.svg')}"></div>
                </div>
                <p class="text-center text-[#333] 2xl:text-[12px] xl:text-[11px] lg:text-[9px] font-serif">Store</p>
              </a>
              <a href="cart.html" class="group relative flex flex-col items-center text-[#202020] hover:text-[#650827] cursor-pointer" aria-label="Cart">
                <div class="relative flex justify-center">
                  ${bagSvg('xl:w-7 xl:h-7 lg:w-6 lg:h-6 w-6 h-6')}
                  <span data-cart-badge class="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-[#cf254a] text-white text-[10px] leading-4 font-serif text-center" style="display:none">0</span>
                </div>
                <span class="text-center text-[#333] 2xl:text-[12px] xl:text-[11px] lg:text-[9px] font-serif">Cart</span>
              </a>
              <button type="button" data-login-cta class="group relative flex flex-col items-center text-center transition cursor-pointer hover:text-[#cf254a] bg-transparent border-0 p-0">
                ${loginSvg}
                <span data-login-label class="text-center text-[#333] 2xl:text-[12px] xl:text-[11px] lg:text-[10px] font-serif">Login</span>
              </button>
            </div>
          </nav>
        </div>
        <div class=" bg-[#650827] relative">
          <div class="flex justify-end">
            <div class="w-auto">
              <nav class="header-menu-desktop flex items-center" role="navigation"
                style="font-size:.83333vw;line-height:1.09375vw;padding:.52083vw 0;display:flex;align-items:center;gap:2vw">
                ${navItems
                  .map(
                    (t) =>
                      `<div class="group relative"><a class="text-white font-serif font-normal tracking-[0.01em] whitespace-nowrap" style="color:#fff" href="plp.html">${t}</a></div>`,
                  )
                  .join('')}
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  `;

  const mount = document.getElementById('site-header');
  if (mount) mount.innerHTML = html;

  window.DemoHeader = {
    syncBadges(count) {
      document.querySelectorAll('[data-cart-badge]').forEach((el) => {
        el.textContent = String(count > 99 ? '99+' : count);
        el.style.display = count > 0 ? 'block' : 'none';
      });
    },
  };
})();
