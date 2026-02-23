// Festival Detection Utility - Automatic date-aware festival and style detection

export interface Festival {
  name: string;
  startDate: { month: number; day: number };
  endDate: { month: number; day: number };
  region: 'india' | 'global' | 'both';
  stylePrompt: string;
  styleName: string;
  colors: string[];
  tag: string;
  priority: number; // Higher = more important
}

export interface TrendingStyle {
  name: string;
  prompt: string;
  image: string;
  trendScore: number; // 0-100, dynamic based on popularity
  category: 'viral' | 'classic' | 'seasonal';
  tag?: string;
}

// Festival Calendar - dates are approximate and can span multiple days
export const festivalCalendar: Festival[] = [
  // Indian Festivals
  {
    name: 'Diwali',
    startDate: { month: 10, day: 28 }, // Late October - early November
    endDate: { month: 11, day: 5 },
    region: 'india',
    stylePrompt: 'Transform with warm golden Diwali glow, traditional diyas, festive lights, rangoli patterns, and rich Indian cinematic colors with bokeh light effects',
    styleName: 'Diwali Festive',
    colors: ['#FFD700', '#FF6B00', '#8B0000'],
    tag: '🪔 Diwali Special',
    priority: 100
  },
  {
    name: 'Holi',
    startDate: { month: 3, day: 10 },
    endDate: { month: 3, day: 25 },
    region: 'india',
    stylePrompt: 'Transform with vibrant Holi colors, colorful powder splash effects, high saturation rainbow hues, joyful festival atmosphere with gulaal particles in the air',
    styleName: 'Holi Colors',
    colors: ['#FF1493', '#00FF00', '#FFD700', '#FF4500'],
    tag: '🎨 Holi Special',
    priority: 95
  },
  {
    name: 'Navratri',
    startDate: { month: 10, day: 3 },
    endDate: { month: 10, day: 15 },
    region: 'india',
    stylePrompt: 'Transform with Navratri Garba style, traditional attire aesthetics, festive motion blur of dancing, colorful chaniya choli patterns, and vibrant dandiya celebration atmosphere',
    styleName: 'Navratri Garba',
    colors: ['#FF1493', '#00CED1', '#FFD700'],
    tag: '💃 Navratri Special',
    priority: 90
  },
  {
    name: 'Raksha Bandhan',
    startDate: { month: 8, day: 15 },
    endDate: { month: 8, day: 30 },
    region: 'india',
    stylePrompt: 'Transform with soft warm family tones, gentle golden hour lighting, rakhi thread details, traditional Indian family portrait aesthetic with loving warmth',
    styleName: 'Rakhi Bond',
    colors: ['#FFB6C1', '#FFD700', '#FFA07A'],
    tag: '🎀 Rakhi Special',
    priority: 80
  },
  {
    name: 'Eid',
    startDate: { month: 4, day: 1 }, // Approximate - varies by lunar calendar
    endDate: { month: 4, day: 15 },
    region: 'india',
    stylePrompt: 'Transform with elegant Eid celebration lighting, soft pastel tones, crescent moon motifs, ornate Islamic patterns, and refined festive atmosphere',
    styleName: 'Eid Elegance',
    colors: ['#C0C0C0', '#FFD700', '#006400'],
    tag: '🌙 Eid Special',
    priority: 85
  },
  {
    name: 'Durga Puja',
    startDate: { month: 10, day: 10 },
    endDate: { month: 10, day: 20 },
    region: 'india',
    stylePrompt: 'Transform with dramatic Durga Puja pandal lighting, rich Bengali cultural aesthetics, vermillion and gold tones, divine goddess energy, and traditional dhunuchi smoke atmosphere',
    styleName: 'Durga Puja',
    colors: ['#FF0000', '#FFD700', '#FFFFFF'],
    tag: '🔱 Pujo Special',
    priority: 88
  },
  {
    name: 'Independence Day',
    startDate: { month: 8, day: 13 },
    endDate: { month: 8, day: 17 },
    region: 'india',
    stylePrompt: 'Transform with patriotic Indian tricolor grading, saffron white and green color scheme, proud national celebration atmosphere, flag motifs and freedom fighter aesthetic',
    styleName: 'Tricolor Pride',
    colors: ['#FF9933', '#FFFFFF', '#138808'],
    tag: '🇮🇳 Independence Special',
    priority: 92
  },
  {
    name: 'Ganesh Chaturthi',
    startDate: { month: 9, day: 5 },
    endDate: { month: 9, day: 15 },
    region: 'india',
    stylePrompt: 'Transform with Ganesh Chaturthi celebration style, modak and laddu aesthetics, vermillion and turmeric tones, traditional pandal lighting with Ganpati devotion atmosphere',
    styleName: 'Ganpati Bappa',
    colors: ['#FF6347', '#FFD700', '#FFA500'],
    tag: '🐘 Ganesh Special',
    priority: 87
  },
  
  // Global/Western Festivals
  {
    name: 'Christmas',
    startDate: { month: 12, day: 15 },
    endDate: { month: 12, day: 31 },
    region: 'global',
    stylePrompt: 'Transform with cozy Christmas lighting, warm red and green holiday tones, snow effects, twinkling fairy lights, Santa aesthetic, and magical winter wonderland atmosphere',
    styleName: 'Christmas Magic',
    colors: ['#FF0000', '#228B22', '#FFD700'],
    tag: '🎄 Christmas Special',
    priority: 95
  },
  {
    name: 'New Year',
    startDate: { month: 12, day: 28 },
    endDate: { month: 1, day: 5 },
    region: 'global',
    stylePrompt: 'Transform with neon New Year party glow, champagne gold sparkles, midnight celebration vibes, fireworks reflections, and glamorous countdown atmosphere',
    styleName: 'New Year Glow',
    colors: ['#FFD700', '#C0C0C0', '#000080'],
    tag: '🎆 New Year Special',
    priority: 98
  },
  {
    name: 'Halloween',
    startDate: { month: 10, day: 20 },
    endDate: { month: 11, day: 2 },
    region: 'global',
    stylePrompt: 'Transform with dark cinematic Halloween aesthetic, spooky orange and purple tones, jack-o-lantern glow, haunted atmosphere, and mysterious gothic vibes',
    styleName: 'Spooky Halloween',
    colors: ['#FF6600', '#800080', '#000000'],
    tag: '🎃 Halloween Special',
    priority: 85
  },
  {
    name: 'Valentine Day',
    startDate: { month: 2, day: 7 },
    endDate: { month: 2, day: 16 },
    region: 'global',
    stylePrompt: 'Transform with romantic soft pink lighting, dreamy love aesthetic, rose petals, heart bokeh effects, and intimate couple portrait vibes',
    styleName: 'Romantic Love',
    colors: ['#FF69B4', '#FF1493', '#DC143C'],
    tag: '💕 Valentine Special',
    priority: 88
  },
  {
    name: 'Easter',
    startDate: { month: 3, day: 25 },
    endDate: { month: 4, day: 10 },
    region: 'global',
    stylePrompt: 'Transform with bright Easter pastel tones, spring bloom aesthetic, soft bunny and egg motifs, fresh flower colors, and joyful spring celebration vibes',
    styleName: 'Easter Spring',
    colors: ['#FFB6C1', '#98FB98', '#87CEEB'],
    tag: '🐰 Easter Special',
    priority: 75
  },
  {
    name: 'Thanksgiving',
    startDate: { month: 11, day: 20 },
    endDate: { month: 11, day: 30 },
    region: 'global',
    stylePrompt: 'Transform with warm autumn Thanksgiving tones, harvest golden hour lighting, cozy family gathering aesthetic, fall leaves colors, and grateful celebration atmosphere',
    styleName: 'Thanksgiving Warmth',
    colors: ['#FF8C00', '#8B4513', '#FFD700'],
    tag: '🦃 Thanksgiving Special',
    priority: 78
  }
];

// Trending styles that rotate based on social media popularity
export const trendingStyles: TrendingStyle[] = [
  {
    name: 'Ghibli Style',
    prompt: 'Transform into Studio Ghibli anime style with soft watercolor textures, magical atmosphere, whimsical details, and Hayao Miyazaki artistic aesthetic',
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=400&fit=crop',
    trendScore: 95,
    category: 'viral',
    tag: '🔥 Viral'
  },
  {
    name: 'AI Portrait Pro',
    prompt: 'Transform into hyper-realistic AI enhanced portrait with perfect skin, professional studio lighting, magazine cover quality, and celebrity photoshoot aesthetic',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    trendScore: 92,
    category: 'viral',
    tag: '🔥 Trending'
  },
  {
    name: '3D Pixar Character',
    prompt: 'Transform into 3D Pixar-style animated character with expressive features, smooth rendering, cartoon proportions, and Disney-quality animation look',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
    trendScore: 90,
    category: 'viral',
    tag: '🔥 Viral'
  },
  {
    name: 'Retro 90s Anime',
    prompt: 'Transform into classic 90s retro anime style with vintage cel animation look, nostalgic color palette, VHS grain texture, and old school anime aesthetics',
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=400&fit=crop',
    trendScore: 88,
    category: 'classic',
    tag: '✨ Popular'
  },
  {
    name: 'Cinematic Portrait',
    prompt: 'Transform into cinematic movie still with dramatic lighting, film grain, anamorphic lens flare, Hollywood cinematography, and blockbuster movie poster aesthetic',
    image: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=400&h=400&fit=crop',
    trendScore: 87,
    category: 'classic',
    tag: '🎬 Cinematic'
  },
  {
    name: 'Cute Plushie',
    prompt: 'Transform into adorable plush toy version with soft fabric texture, button eyes, stuffed toy proportions, kawaii aesthetic, and collectible figure style',
    image: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=400&h=400&fit=crop',
    trendScore: 85,
    category: 'viral',
    tag: '🧸 Cute'
  },
  {
    name: 'Ink Sketch Art',
    prompt: 'Transform into detailed pen and ink sketch with fine line work, cross-hatching shading, artistic illustration style, and hand-drawn aesthetic',
    image: 'https://images.unsplash.com/photo-1579762715118-a6f1d4b934f1?w=400&h=400&fit=crop',
    trendScore: 82,
    category: 'classic',
    tag: '✏️ Artistic'
  },
  {
    name: 'Neon Cyberpunk',
    prompt: 'Transform into futuristic cyberpunk style with neon pink and blue lighting, rain-soaked streets, holographic elements, and Blade Runner aesthetic',
    image: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=400&h=400&fit=crop',
    trendScore: 84,
    category: 'viral',
    tag: '💜 Neon'
  },
  {
    name: 'Watercolor Dream',
    prompt: 'Transform into soft watercolor painting with flowing color bleeds, artistic brush strokes, dreamy pastel palette, and fine art gallery aesthetic',
    image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&h=400&fit=crop',
    trendScore: 78,
    category: 'classic',
    tag: '🎨 Artistic'
  },
  {
    name: 'Pop Art Comic',
    prompt: 'Transform into bold pop art comic style with Ben-Day dots, thick outlines, bright primary colors, Roy Lichtenstein aesthetic, and vintage comic book look',
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=400&fit=crop',
    trendScore: 76,
    category: 'classic',
    tag: '💥 Pop Art'
  },
  {
    name: 'Luxury Glam',
    prompt: 'Transform into luxury fashion magazine editorial with high-end glamour, designer aesthetic, premium lighting, and Vogue cover quality',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    trendScore: 80,
    category: 'classic',
    tag: '💎 Luxury'
  },
  {
    name: 'Anime Waifu',
    prompt: 'Transform into modern anime character style with expressive eyes, dynamic hair, clean line art, vibrant colors, and popular anime aesthetic',
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=400&fit=crop',
    trendScore: 86,
    category: 'viral',
    tag: '🌸 Anime'
  }
];

// Get current active festival based on date
export function getActiveFestival(date: Date = new Date()): Festival | null {
  const month = date.getMonth() + 1; // JavaScript months are 0-indexed
  const day = date.getDate();
  
  const activeFestivals = festivalCalendar.filter(festival => {
    const { startDate, endDate } = festival;
    
    // Handle year-wrapping festivals (e.g., New Year)
    if (endDate.month < startDate.month) {
      // Festival spans across year boundary
      return (month >= startDate.month && day >= startDate.day) || 
             (month <= endDate.month && day <= endDate.day);
    }
    
    // Normal case
    if (month > startDate.month && month < endDate.month) return true;
    if (month === startDate.month && day >= startDate.day) return true;
    if (month === endDate.month && day <= endDate.day) return true;
    
    return false;
  });
  
  if (activeFestivals.length === 0) return null;
  
  // Return the highest priority festival if multiple are active
  return activeFestivals.reduce((highest, current) => 
    current.priority > highest.priority ? current : highest
  );
}

// Get top trending styles sorted by trend score
export function getTrendingStyles(limit: number = 6): TrendingStyle[] {
  return [...trendingStyles]
    .sort((a, b) => b.trendScore - a.trendScore)
    .slice(0, limit);
}

// Get styles by category
export function getStylesByCategory(category: TrendingStyle['category']): TrendingStyle[] {
  return trendingStyles.filter(style => style.category === category);
}

// Get recommended style (highest trending + current festival if any)
export function getRecommendedStyles(): { festival: Festival | null; trending: TrendingStyle[] } {
  return {
    festival: getActiveFestival(),
    trending: getTrendingStyles(3)
  };
}

// Simulate trend score updates (in production, this would come from an API)
export function updateTrendScores(): void {
  // Add slight randomness to simulate real-time trend changes
  trendingStyles.forEach(style => {
    const variance = Math.random() * 10 - 5; // -5 to +5
    style.trendScore = Math.min(100, Math.max(50, style.trendScore + variance));
  });
}

// Get all styles for the current context
export function getContextualStyles(): {
  festivalStyles: Festival[];
  trendingStyles: TrendingStyle[];
  activeFestival: Festival | null;
} {
  const activeFestival = getActiveFestival();
  
  return {
    festivalStyles: activeFestival ? [activeFestival] : [],
    trendingStyles: getTrendingStyles(8),
    activeFestival
  };
}
