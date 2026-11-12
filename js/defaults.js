/* defaults.js — fallback content (used when data/site.json cannot be loaded) and placeholders */
(function (S) {
  S.SITE_NAME = 'Shri Vinayak Nursery';

  const P = (n, s, c, e, d, tag) => ({ n, s, c, e, d, price: '', img: '', tag: tag || '' });

  S.DEFAULTS = {
    contact: {
      phone: '+91 XXXXX XXXXX',
      whatsapp: '91XXXXXXXXXX',
      email: 'info@yourdomain.com',
      address: 'Your nursery address, City, State – PIN',
      hours: 'Mon – Sun: 8:00 AM – 7:00 PM',
      mapEmbed: ''
    },
    plants: [
      P('Money Plant', 'Epipremnum aureum', 'Indoor', '🪴', 'Hardy trailing plant, grows in soil or water.', 'Bestseller'),
      P('Snake Plant', 'Sansevieria trifasciata', 'Indoor', '🌿', 'Low-maintenance, air-purifying and drought tolerant.', 'Bestseller'),
      P('Peace Lily', 'Spathiphyllum', 'Indoor', '🤍', 'Elegant white blooms; thrives in indoor light.'),
      P('Monstera Deliciosa', 'Monstera deliciosa', 'Indoor', '🍃', 'Statement plant with large split leaves.', 'Popular'),
      P('ZZ Plant', 'Zamioculcas zamiifolia', 'Indoor', '🌱', 'Glossy leaves; perfect for beginners.'),
      P('Areca Palm', 'Dypsis lutescens', 'Indoor', '🌴', 'Feathery tropical palm for living rooms.'),
      P('Aglaonema (Chinese Evergreen)', 'Aglaonema', 'Indoor', '🌺', 'Colourful foliage, tolerates low light.'),
      P('Lucky Bamboo', 'Dracaena sanderiana', 'Indoor', '🎋', 'Symbol of good luck; great for gifting.'),
      P('Areca Palm (Garden)', 'Dypsis lutescens', 'Outdoor', '🌴', 'Tall privacy screen and garden accent.'),
      P('Ficus (Weeping Fig)', 'Ficus benjamina', 'Outdoor', '🌳', 'Dense evergreen for hedges and shade.'),
      P('Bougainvillea', 'Bougainvillea glabra', 'Outdoor', '💐', 'Vibrant papery blooms for walls and gates.', 'Popular'),
      P('Tecoma / Golden Trumpet', 'Tecoma stans', 'Outdoor', '🌼', 'Bright yellow flowers; loves full sun.'),
      P('Bamboo Plants', 'Bambusa', 'Outdoor', '🎍', 'Fast-growing natural screen.'),
      P('Rose (Gulab)', 'Rosa', 'Flowering', '🌹', 'Classic fragrant roses in assorted colours.', 'Bestseller'),
      P('Hibiscus (Gudhal)', 'Hibiscus rosa-sinensis', 'Flowering', '🌺', 'Large showy flowers almost all year.'),
      P('Jasmine (Mogra / Chameli)', 'Jasminum', 'Flowering', '🤍', 'Intensely fragrant white blossoms.'),
      P('Marigold (Genda)', 'Tagetes', 'Flowering', '🌻', 'Festive favourite; easy seasonal colour.'),
      P('Chrysanthemum (Guldaudi)', 'Chrysanthemum', 'Flowering', '🌸', 'Winter-season blooms in many shades.'),
      P('Jade Plant', 'Crassula ovata', 'Succulents', '🍀', 'Lucky succulent, minimal watering.'),
      P('Aloe Vera', 'Aloe barbadensis', 'Succulents', '🪴', 'Medicinal, hardy and easy to grow.', 'Popular'),
      P('Assorted Succulents', 'Mixed', 'Succulents', '🌵', 'Mini succulents for desks and gifting.'),
      P('Tulsi (Holy Basil)', 'Ocimum tenuiflorum', 'Herbs & Veg', '🌿', 'Sacred and medicinal; a household essential.', 'Bestseller'),
      P('Curry Leaf (Kadi Patta)', 'Murraya koenigii', 'Herbs & Veg', '🍃', 'Fresh leaves for everyday cooking.'),
      P('Lemon Plant', 'Citrus limon', 'Herbs & Veg', '🍋', 'Fruiting plant for terrace and garden.'),
      P('Ceramic & Terracotta Pots', 'Assorted sizes', 'Pots & Supplies', '🏺', 'Decorative and classic pots in many sizes.'),
      P('Garden Soil Mix & Cocopeat', 'Growing media', 'Pots & Supplies', '🟤', 'Ready-to-use potting mix for healthy roots.'),
      P('Organic Manure & Fertilisers', 'Vermicompost, cow manure…', 'Pots & Supplies', '🌾', 'Nutrition to keep your plants thriving.')
    ],
    gallery: [],   // photos added from the admin page
    videos: []     // videos added from the admin page
  };

  /* Shown on the public site until the owner adds real photos / videos */
  S.PLACEHOLDER_SLIDES = [
    { e: '🌿', title: 'Our Nursery', caption: 'Rows of healthy, well-cared-for plants', bg: ['#1b6b45', '#2fa56a'] },
    { e: '🌺', title: 'Flowering Collection', caption: 'Seasonal blooms in every colour', bg: ['#b5365f', '#f08aa6'] },
    { e: '🏡', title: 'Garden Landscaping', caption: 'Complete garden design and plantation', bg: ['#2d6a4f', '#95d5b2'] }
  ];
  S.PLACEHOLDER_VIDEOS = [
    { title: 'Nursery Tour', description: 'A walk through our plant collection.' },
    { title: 'Garden Landscaping Project', description: 'Before and after of a recent garden project.' },
    { title: 'Plantation & Care Tips', description: 'How we plant, pot and care for our plants.' }
  ];
})(window.SVN = window.SVN || {});
