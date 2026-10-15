import type { Messages } from "./types";

export const en: Messages = {
  meta: {
    title: "NOIR — Coffee, Beyond Ordinary",
    description:
      "NOIR is a premium coffee atelier. Single-origin beans, slow craft, and a cinematic tasting experience. Demo menu — no real orders are processed.",
    ogTitle: "NOIR — Coffee, Beyond Ordinary",
    ogDescription:
      "A cinematic, scroll-driven coffee atelier experience. Demo menu and cart.",
    keywords: [
      "coffee",
      "specialty coffee",
      "espresso",
      "cold brew",
      "coffee atelier",
      "NOIR",
    ],
  },

  a11y: {
    skipToMenu: "Skip to menu",
    primaryNav: "Primary",
    home: "NOIR home",
    openCart: (count) => `Open cart, ${count} ${count === 1 ? "item" : "items"}`,
    cart: "Cart",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    productIllustration: (title) => `${title} illustration`,
    language: "Language",
    switchLanguage: "Switch language",
  },

  nav: {
    origin: "Origin",
    craft: "Craft",
    signature: "Signature",
    menu: "Menu",
    cart: "Cart",
  },

  story: {
    hero: {
      brandLine: "Noir Coffee Atelier — Est. 2016",
      title: ["Coffee,", "Beyond Ordinary"],
      lead: "A cinematic journey from single-origin soil to the final pour. Sourced in shadow, roasted in small batches, and served with quiet precision.",
      exploreMenu: "Explore the menu",
      theStory: "The story",
      scroll: "Scroll",
      introLabel: "Introduction",
    },
    beats: {
      origin: {
        index: "01",
        label: "Origin",
        title: ["Grown in shadow,", "ground to order"],
        body: "At 2,050 metres on the Guji highlands, slow-ripening cherries develop the density and sweetness we chase. Every cherry is hand-picked at peak, then roasted and ground the moment you order — never a second sooner.",
      },
      prep: {
        index: "02",
        label: "The Dose",
        title: ["Eighteen grams,", "level and true"],
        body: "The fresh grounds settle into the basket and are tamped flat with an even hand. A level bed is the difference between a channel of bitterness and a shot worth drinking slowly.",
      },
      lock: {
        index: "03",
        label: "The Lock",
        title: ["Locked in,", "nine bars held"],
        body: "The portafilter seats into the group head with a quarter turn and the pump takes over. Nine bars of pressure, ninety-two degrees — a bench dialled in twice daily against the same exacting standard.",
        items: [
          "Nine bars of extraction pressure",
          "Ninety-two degrees, held steady",
          "Tuned twice daily against a refractometer",
        ],
      },
      extract: {
        index: "04",
        label: "The Extract",
        title: ["Twenty-seven", "deliberate seconds"],
        body: "A warm stream settles into the cup, the crema drawing a fine caramel line across the surface. The shot you receive at noon tastes identical to the one we dial in at dawn.",
        items: [
          "A twenty-seven second extraction window",
          "Crema drawn fine and even",
          "Poured the instant the pump stops",
        ],
      },
      cup: {
        index: "05",
        label: "The Cup",
        title: ["Yours,", "beyond ordinary"],
        body: "From soil to shadow to the cup held in your hands. Choose a signature pour below and the room rearranges itself around it.",
      },
    },
  },

  signature: {
    index: "06",
    label: "Signature",
    title: "The signature pours",
    lead: "Four drinks that define the bar. Choose one and the room rearranges itself around it.",
    from: "From",
    addToCart: "Add to cart",
    addToCartAria: (name) => `Add ${name} to cart`,
    region: "Signature drinks",
    drinks: {
      espresso: {
        alias: "The Single Origin",
        line: "One origin, one shot, nothing to hide behind.",
        notes: ["Cocoa", "Hazelnut", "Brown sugar"],
      },
      cappuccino: {
        alias: "The Velvet Hour",
        line: "Microfoam so fine it folds like silk.",
        notes: ["Malted milk", "Almond", "Cocoa dust"],
      },
      "caffe-latte": {
        alias: "The Rosetta",
        line: "A long pour, pulled slow, finished by hand.",
        notes: ["Vanilla", "Caramel", "Steamed milk"],
      },
      "cold-brew": {
        alias: "Midnight Steep",
        line: "Eighteen hours cold, served over a single clear cube.",
        notes: ["Cane sugar", "Black walnut", "Fig"],
      },
    },
  },

  menu: {
    index: "04",
    label: "The Menu",
    title: "Order like you mean it",
    lead: "A working demo menu. Prices are illustrative and no payment is processed — your cart lives entirely in this browser.",
    count: (n) => `${n} ${n === 1 ? "item" : "items"}`,
    add: "Add",
    details: "Details",
    viewDetails: (name) => `View details for ${name}`,
    price: "Price",
    chooseSize: "Choose a size",
    addToCart: "Add to cart",
    closeDetails: "Close product details",
    region: "Menu",
    filters: {
      all: "Everything",
      hot: "Hot Coffee",
      cold: "Iced & Cold Brew",
      bakery: "Bakery & Desserts",
    },
    categoryLabel: {
      hot: "Hot Coffee",
      cold: "Iced & Cold Brew",
      bakery: "Bakery & Desserts",
    },
  },

  cart: {
    heading: "Cart",
    yourOrder: "Your order",
    empty:
      "Your cart is empty. Choose something from the menu and it will appear here.",
    browseMenu: "Browse the menu",
    dialogLabel: "Shopping cart",
    close: "Close cart",
    decrease: (name) => `Decrease quantity of ${name}`,
    increase: (name) => `Increase quantity of ${name}`,
    quantity: "Quantity",
    remove: "Remove",
    subtotal: "Subtotal",
    demoNote: "Demo checkout. No payment is processed and no order is placed.",
    checkout: "Checkout unavailable in demo",
    clear: "Clear cart",
  },

  footer: {
    tagline: "Coffee, Beyond Ordinary",
    disclaimer:
      "A demonstration coffee atelier built as a scroll-driven 3D experience. All products, prices and locations shown are fictional sample data.",
    visit: "Visit",
    address: ["14 Roast Lane, Suite 2", "Old Quarter District", "Demo City, 00000"],
    illustrative: "Illustrative address only",
    hours: "Opening hours",
    hoursRows: [
      { day: "Mon — Thu", time: "07:00 — 19:00" },
      { day: "Fri — Sat", time: "07:00 — 22:00" },
      { day: "Sunday", time: "08:00 — 17:00" },
    ],
    copyright: (year) => `© ${year} NOIR Atelier — Demo build`,
    builtWith: "Built with Next.js, React Three Fiber & GSAP",
  },

  loading: {
    preparing: "Preparing your cup",
    servingWithout3d: "Serving without 3D",
  },

  products: {
    espresso: {
      name: "Espresso",
      description:
        "A dense 25ml shot pulled from our house blend — a syrupy, cocoa-forward base with a hazelnut finish and a thick, tiger-striped crema.",
      notes: ["Cocoa", "Hazelnut", "Brown sugar"],
      origin: "House blend · Brazil / Colombia",
    },
    americano: {
      name: "Americano",
      description:
        "Two ristretto shots lengthened with soft-filtered hot water, preserving clarity and body without the bitterness of over-extraction.",
      notes: ["Dark chocolate", "Toffee", "Citrus oil"],
      origin: "House blend · Brazil / Colombia",
    },
    cappuccino: {
      name: "Cappuccino",
      description:
        "Equal parts espresso, steamed milk and a lofty microfoam cap. Velvet-textured, balanced, and finished with a dusting of cocoa.",
      notes: ["Milk chocolate", "Malted milk", "Almond"],
      origin: "House blend · Brazil / Colombia",
    },
    "caffe-latte": {
      name: "Caffè Latte",
      description:
        "A long, silky pour of steamed milk over a double shot, folded into a delicate rosetta. Round, sweet and endlessly drinkable.",
      notes: ["Vanilla", "Caramel", "Steamed milk"],
      origin: "House blend · Brazil / Colombia",
    },
    mocha: {
      name: "Mocha",
      description:
        "Single-origin dark cocoa ganache layered with espresso and microfoam, crowned with a whisper of sea salt and shaved chocolate.",
      notes: ["Bittersweet cocoa", "Sea salt", "Cream"],
      origin: "House blend · Brazil / Colombia",
    },
    "cold-brew": {
      name: "Cold Brew",
      description:
        "Steeped for eighteen hours in cold spring water, then filtered twice. Naturally sweet, low-acid and remarkably smooth over a single clear cube.",
      notes: ["Cane sugar", "Black walnut", "Fig"],
      origin: "Single origin · Ethiopia Guji",
    },
    "iced-latte": {
      name: "Iced Latte",
      description:
        "A double shot poured over chilled milk and slow-melting ice, kept deliberately lean so the espresso stays bright and present.",
      notes: ["Milk chocolate", "Red apple", "Cane sugar"],
      origin: "House blend · Brazil / Colombia",
    },
    "butter-croissant": {
      name: "Butter Croissant",
      description:
        "Laminated over three days with cultured French butter, baked to a shattering, honeyed crust and a soft, open crumb.",
      notes: ["Cultured butter", "Honey", "Toasted wheat"],
    },
    "almond-croissant": {
      name: "Almond Croissant",
      description:
        "Yesterday's croissant reborn — soaked in orange-blossom syrup, filled with frangipane and finished with toasted flakes.",
      notes: ["Frangipane", "Orange blossom", "Toasted almond"],
    },
    tiramisu: {
      name: "Tiramisu",
      description:
        "Espresso-soaked savoiardi under clouds of mascarpone cream, dusted to order with single-origin cocoa.",
      notes: ["Mascarpone", "Espresso", "Cocoa"],
    },
    brownie: {
      name: "Dark Chocolate Brownie",
      description:
        "A fudgy, crackle-topped brownie built on 72% single-origin chocolate, served slightly warm with a pinch of espresso salt.",
      notes: ["70% cocoa", "Espresso salt", "Vanilla"],
    },
    "basque-cheesecake": {
      name: "Pistachio Basque Cheesecake",
      description:
        "Burnt on purpose — a caramelised, custardy Basque cheesecake swirled with Sicilian pistachio and a hint of orange zest.",
      notes: ["Pistachio", "Burnt caramel", "Orange zest"],
    },
  },

  sizeLabels: {
    small: "Small · 8oz",
    medium: "Medium · 12oz",
    regular: "Regular · 12oz",
    large: "Large · 16oz",
  },
};
