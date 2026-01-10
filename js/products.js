// Products Database
export const products = [
    // DISPOSABLE - Liquid Diamonds 2G
    {
        id: "cart_runtz_candy",
        name: "RUNTZ CANDY",
        category: "Disposable",
        brand: "Pachis",
        type: "2g Liquid Diamonds",
        flavor: "Runtz Candy",
        image: "https://rizo7o6vttmkyalu.public.blob.vercel-storage.com/runtz_candy.png",
        terps: "7% (indica - fruity, tangy)",
        thcMg: "879.5/pkg",
        thcPercent: "88.0%",
        cbd: "0.0/pkg"
    },
    {
        id: "cart_bubblegum_tape",
        name: "BUBBLEGUM TAPE",
        category: "Disposable",
        brand: "Pachis",
        type: "2g Liquid Diamonds",
        flavor: "Bubblegum Tape",
        image: "https://rizo7o6vttmkyalu.public.blob.vercel-storage.com/bubblegum_tape.mp4",
        terps: "7% (hybrid - playful, sweet)",
        thcMg: "879.5/pkg",
        thcPercent: "88.0%",
        cbd: "0.0/pkg"
    },
    {
        id: "cart_fruitier_cereal",
        name: "FRUITIER CEREAL",
        category: "Disposable",
        brand: "Pachis",
        type: "2g Liquid Diamonds",
        flavor: "Fruitier Cereal",
        image: "https://rizo7o6vttmkyalu.public.blob.vercel-storage.com/fruitier_cereal.mp4",
        terps: "7% (hybrid - playful, sweet)",
        thcMg: "879.5/pkg",
        thcPercent: "88.0%",
        cbd: "0.0/pkg"
    },
    {
        id: "cart_grape_euphoria",
        name: "GRAPE EUPHORIA",
        category: "Disposable",
        brand: "Pachis",
        type: "2g Liquid Diamonds",
        flavor: "Grape Euphoria",
        image: "https://rizo7o6vttmkyalu.public.blob.vercel-storage.com/grape_euphoria.png",
        terps: "7% (indica - fruity, tangy)",
        thcMg: "879.5/pkg",
        thcPercent: "88.0%",
        cbd: "0.0/pkg"
    },
    {
        id: "cart_guava_galaxy",
        name: "GUAVA GALAXY",
        category: "Disposable",
        brand: "Pachis",
        type: "2g Liquid Diamonds",
        flavor: "Guava Galaxy",
        image: "https://rizo7o6vttmkyalu.public.blob.vercel-storage.com/guava_galaxy.png",
        terps: "7% (indica - fruity, tangy)",
        thcMg: "879.5/pkg",
        thcPercent: "88.0%",
        cbd: "0.0/pkg"
    },
    {
        id: "cart_nerdz",
        name: "NERDZ",
        category: "Disposable",
        brand: "Pachis",
        type: "2g Liquid Diamonds",
        flavor: "Nerdz",
        image: "https://rizo7o6vttmkyalu.public.blob.vercel-storage.com/nerdz.png",
        terps: "7% (indica - fruity, tangy)",
        thcMg: "879.5/pkg",
        thcPercent: "88.0%",
        cbd: "0.0/pkg"
    },
    {
        id: "cart_strawberry_jelly",
        name: "STRAWBERRY JELLY",
        category: "Disposable",
        brand: "Pachis",
        type: "2g Liquid Diamonds",
        flavor: "Strawberry Jelly",
        image: "https://rizo7o6vttmkyalu.public.blob.vercel-storage.com/strawberry_jelly.mp4",
        terps: "7% (indica - fruity, tangy)",
        thcMg: "879.5/pkg",
        thcPercent: "88.0%",
        cbd: "0.0/pkg"
    },
    {
        id: "cart_peach_rings",
        name: "PEACH RINGS",
        category: "Disposable",
        brand: "Pachis",
        type: "2g Liquid Diamonds",
        flavor: "Peach Rings",
        image: "https://rizo7o6vttmkyalu.public.blob.vercel-storage.com/peach_ringz.mp4",
        terps: "7% (sativa - tart, sweet)",
        thcMg: "879.5/pkg",
        thcPercent: "88.0%",
        cbd: "0.0/pkg"
    },
    {
        id: "cart_banana_bonanza",
        name: "BANANA BONANZA",
        category: "Disposable",
        brand: "Pachis",
        type: "2g Liquid Diamonds",
        flavor: "Banana Bonanza",
        image: "https://rizo7o6vttmkyalu.public.blob.vercel-storage.com/Pachis%20Banana%20Bonanza.png",
        terps: "7% (indica - creamy, tropical)",
        thcMg: "879.5/pkg",
        thcPercent: "88.0%",
        cbd: "0.0/pkg"
    },
    {
        id: "cart_cherry_jubilee",
        name: "CHERRY JUBILEE",
        category: "Disposable",
        brand: "Pachis",
        type: "2g Liquid Diamonds",
        flavor: "Cherry Jubilee",
        image: "https://rizo7o6vttmkyalu.public.blob.vercel-storage.com/Pachis%20Cherry%20Jubilee.png",
        terps: "7% (hybrid - sweet, tart)",
        thcMg: "879.5/pkg",
        thcPercent: "88.0%",
        cbd: "0.0/pkg"
    },
    {
        id: "cart_watermelon_marshmallow",
        name: "WATERMELON MARSHMALLOW",
        category: "Disposable",
        brand: "Pachis",
        type: "2g Liquid Diamonds",
        flavor: "Watermelon Marshmallow",
        image: "https://rizo7o6vttmkyalu.public.blob.vercel-storage.com/pachis%20watermelon%20marshmallow.png",
        terps: "7% (sativa - fresh, sweet)",
        thcMg: "879.5/pkg",
        thcPercent: "88.0%",
        cbd: "0.0/pkg"
    },

    // LIVE ROSIN DABS - Single product with jar quantity selector
    {
        id: "dab_pachis",
        name: "DAB IT PACHIS",
        category: "Live Rosin Dabs",
        brand: "Pachis",
        type: "Live Rosin Dabs",
        sizeOptions: [
            { id: "1jar_2g", name: "1 Jar (2g)", price: 120 },
            { id: "7jars_halfoz", name: "7 Jars - ½oz (14g)", price: 750 },
            { id: "14jars_1oz", name: "14 Jars - 1oz (28g)", price: 1400 }
        ],
        image: "https://rizo7o6vttmkyalu.public.blob.vercel-storage.com/dabs_2g.png"
    },

    // PRE-ROLLS - Single product with box type selector
    {
        id: "preroll_pachis",
        name: "PREROLLS PACHIS",
        category: "Pre-Rolls",
        brand: "Pachis",
        type: "Premium Pre-Rolled Joints",
        sizeOptions: [
            { id: "black_box", name: "Black Box (3 pre-rolls)", price: 75 },
            { id: "blue_box", name: "Blue Box (18 pre-rolls)", price: 400 }
        ],
        image: "https://rizo7o6vttmkyalu.public.blob.vercel-storage.com/pre_rolls.png"
    },

    // FLOWER - Single product with size selector
    {
        id: "flower_premium",
        name: "PREMIUM FLOWER",
        category: "Flower",
        brand: "Pachis",
        type: "Indoor Premium Flower",
        sizeOptions: [
            { id: "quarter_oz", name: "¼ oz (7g)", price: 80 },
            { id: "half_oz", name: "½ oz (14g)", price: 150 },
            { id: "full_oz", name: "1 oz (28g)", price: 280 }
        ],
        image: "images/premium-flower.jpg"
    },

    // APPAREL
    {
        id: "apparel_hat_classic",
        name: "PACHIS CLASSIC HAT",
        category: "Apparel",
        brand: "Pachis",
        type: "Snapback Hat",
        image: "images/hat-classic.jpg"
    },
    {
        id: "apparel_hat_trucker",
        name: "PACHIS TRUCKER HAT",
        category: "Apparel",
        brand: "Pachis",
        type: "Trucker Hat",
        image: "images/hat-trucker.jpg"
    },
    {
        id: "apparel_tshirt_logo",
        name: "PACHIS LOGO T-SHIRT",
        category: "Apparel",
        brand: "Pachis",
        type: "Cotton T-Shirt",
        sizes: ["S", "M", "L", "XL", "XXL"],
        image: "images/tshirt-logo.jpg"
    },
    {
        id: "apparel_tshirt_vintage",
        name: "PACHIS VINTAGE TEE",
        category: "Apparel",
        brand: "Pachis",
        type: "Vintage Wash T-Shirt",
        sizes: ["S", "M", "L", "XL", "XXL"],
        image: "images/tshirt-vintage.jpg"
    },
    {
        id: "apparel_hoodie_classic",
        name: "PACHIS CLASSIC HOODIE",
        category: "Apparel",
        brand: "Pachis",
        type: "Pullover Hoodie",
        sizes: ["S", "M", "L", "XL", "XXL"],
        image: "images/hoodie-classic.jpg"
    },
    {
        id: "apparel_hoodie_zip",
        name: "PACHIS ZIP HOODIE",
        category: "Apparel",
        brand: "Pachis",
        type: "Zip-Up Hoodie",
        sizes: ["S", "M", "L", "XL", "XXL"],
        image: "images/hoodie-zip.jpg"
    },
    {
        id: "apparel_sneakers_high",
        name: "PACHIS HIGH TOPS",
        category: "Apparel",
        brand: "Pachis",
        type: "Canvas High Top Sneakers",
        sizes: ["7", "8", "9", "10", "11", "12"],
        image: "images/sneakers-high.jpg"
    },
    {
        id: "apparel_sneakers_low",
        name: "PACHIS LOW TOPS",
        category: "Apparel",
        brand: "Pachis",
        type: "Canvas Low Top Sneakers",
        sizes: ["7", "8", "9", "10", "11", "12"],
        image: "images/sneakers-low.jpg"
    },

    // PLEASURE GEAR
    {
        id: "pleasure_massager",
        name: "INTIMATE MASSAGER",
        category: "Pleasure Gear",
        brand: "Pachis",
        type: "Premium Massager",
        image: "images/massager.jpg"
    },
    {
        id: "pleasure_kit_couples",
        name: "COUPLES KIT",
        category: "Pleasure Gear",
        brand: "Pachis",
        type: "Couples Experience Kit",
        image: "images/couples-kit.jpg"
    },
    {
        id: "pleasure_lubricant",
        name: "PREMIUM LUBRICANT",
        category: "Pleasure Gear",
        brand: "Pachis",
        type: "Water-Based Lubricant",
        image: "images/lubricant.jpg"
    },
    {
        id: "pleasure_accessories",
        name: "INTIMACY ACCESSORIES",
        category: "Pleasure Gear",
        brand: "Pachis",
        type: "Accessory Set",
        image: "images/accessories.jpg"
    },

    // 420 KIT
    {
        id: "kit_grinder_premium",
        name: "PREMIUM GRINDER",
        category: "420 Kit",
        brand: "Pachis",
        type: "4-Piece Metal Grinder",
        image: "images/grinder.jpg"
    },
    {
        id: "kit_rolling_tray",
        name: "ROLLING TRAY",
        category: "420 Kit",
        brand: "Pachis",
        type: "Metal Rolling Tray",
        sizes: ["Small", "Medium", "Large"],
        image: "images/rolling-tray.jpg"
    },
    {
        id: "kit_storage_jar",
        name: "AIRTIGHT STORAGE JAR",
        category: "420 Kit",
        brand: "Pachis",
        type: "UV Glass Storage Jar",
        sizes: ["4oz", "8oz", "16oz"],
        image: "images/storage-jar.jpg"
    },
    {
        id: "kit_papers",
        name: "PREMIUM PAPERS",
        category: "420 Kit",
        brand: "Pachis",
        type: "Rolling Papers Pack",
        image: "images/papers.jpg"
    },
    {
        id: "kit_lighter",
        name: "PACHIS LIGHTER",
        category: "420 Kit",
        brand: "Pachis",
        type: "Branded Lighter",
        image: "images/lighter.jpg"
    },
    {
        id: "kit_cleaning",
        name: "CLEANING KIT",
        category: "420 Kit",
        brand: "Pachis",
        type: "Complete Cleaning Kit",
        image: "images/cleaning-kit.jpg"
    }
];
