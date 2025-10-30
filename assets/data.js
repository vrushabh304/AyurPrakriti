// Static recommendations per dominant dosha
const DOSHA_DIET = {
	Vata: [
		{ title: "Warm, cooked foods", desc: "Soups, stews, oats, root veggies." },
		{ title: "Healthy fats", desc: "Ghee, olive oil, sesame oil." },
		{ title: "Warming spices", desc: "Ginger, cinnamon, cumin." },
		{ title: "Avoid", desc: "Cold salads, dry snacks, iced drinks." }
	],
	Pitta: [
		{ title: "Cooling foods", desc: "Cucumber, leafy greens, coconut, milk, yogurt." },
		{ title: "Sweet, bitter, astringent", desc: "Pear, melon, beans, coriander." },
		{ title: "Hydration", desc: "Room-temp water, mint, fennel teas." },
		{ title: "Avoid", desc: "Excess spicy, sour, fried foods; excessive heat." }
	],
	Kapha: [
		{ title: "Light and warm", desc: "Steamed veggies, millet, barley." },
		{ title: "Stimulating spices", desc: "Black pepper, mustard seed, turmeric." },
		{ title: "More astringent", desc: "Apples, lentils, greens." },
		{ title: "Avoid", desc: "Heavy, oily, sweet, cold dairy in excess." }
	]
};

const DOSHA_SCHEDULE = {
	Vata: [
		{ time: "05:30", desc: "Gentle wake-up, oil massage (abhyanga)." },
		{ time: "06:30", desc: "Warm breakfast (oats), ginger tea." },
		{ time: "07:30", desc: "Calm study block (deep work)." },
		{ time: "12:30", desc: "Warm lunch, grounding foods." },
		{ time: "16:30", desc: "Walk + stretch, light snack." },
		{ time: "20:30", desc: "Early dinner, screen wind-down." },
		{ time: "22:00", desc: "Sleep routine, warm milk, journaling." }
	],
	Pitta: [
		{ time: "06:00", desc: "Wake cool, splash face with cool water." },
		{ time: "07:00", desc: "Cooling breakfast (fruit + yogurt)." },
		{ time: "09:00", desc: "High-focus study block; take hydration breaks." },
		{ time: "13:00", desc: "Main meal; avoid very spicy foods." },
		{ time: "17:00", desc: "Evening walk; avoid intense heat workouts." },
		{ time: "19:30", desc: "Light, cooling dinner (salads, soups)." },
		{ time: "22:30", desc: "Relaxation: reading, music, meditation." }
	],
	Kapha: [
		{ time: "05:00", desc: "Early wake; energizing breath-work." },
		{ time: "06:30", desc: "Exercise: brisk walk, cardio, sun salutations." },
		{ time: "08:00", desc: "Light breakfast (millet porridge)." },
		{ time: "12:30", desc: "Light but warm lunch." },
		{ time: "16:00", desc: "Stimulating tea (ginger)." },
		{ time: "19:00", desc: "Very light dinner; avoid late snacking." },
		{ time: "22:00", desc: "Sleep, avoid oversleeping next day." }
	]
};

// Wellness suggestions per dosha
const DOSHA_WELLNESS = {
	Vata: [
		{ title: "Yoga", desc: "Slow, grounding flows; yin yoga; long holds." },
		{ title: "Breath", desc: "Nadi shodhana (alternate nostril), gentle ujjayi." },
		{ title: "Mind", desc: "Fixed routines, journaling, warm baths, oil massage." }
	],
	Pitta: [
		{ title: "Yoga", desc: "Cooling, non-competitive; moon salutations, twists." },
		{ title: "Breath", desc: "Sheetali/Sheetkari, mindful slow breathing." },
		{ title: "Mind", desc: "Take breaks, time in nature, gratitude reflection." }
	],
	Kapha: [
		{ title: "Yoga", desc: "Energizing flows; sun salutations; brisk pace." },
		{ title: "Breath", desc: "Bhastrika/Kapalabhati (if suitable), stimulating breath." },
		{ title: "Mind", desc: "Morning sunlight, accountability buddy, upbeat music." }
	]
};

// Full meal plan per dosha
const DOSHA_MEAL_PLAN = {
	Vata: {
		Breakfast: ["Warm oatmeal with ghee and dates", "Herbal ginger tea"],
		Lunch: ["Lentil soup, rice, steamed carrots & beets", "Sesame oil drizzle"],
		Snack: ["Baked sweet potato", "Soaked almonds"],
		Dinner: ["Khichdi with veggies", "Golden milk (warm)"]
	},
	Pitta: {
		Breakfast: ["Yogurt with cucumber & mint", "Sweet fruits (pear/melon)"],
		Lunch: ["Rice, sautéed greens, mung dal", "Cilantro chutney"],
		Snack: ["Coconut water", "Roasted chickpeas (mild)"],
		Dinner: ["Mixed veggie soup (cooling)", "Chapati with ghee"]
	},
	Kapha: {
		Breakfast: ["Millet porridge with spices", "Warm lemon water"],
		Lunch: ["Barley khichdi, sautéed broccoli & peppers", "Pickled ginger"],
		Snack: ["Apple or pear", "Ginger tea"],
		Dinner: ["Light veggie soup", "Avoid late/eavy meals"]
	}
};

// Example user-case answers from prompt to preload
const EXAMPLE_PROFILE = {
	fullName: "Student Example",
	age: 18,
	gender: "Female",
	heightCm: 165,
	weightKg: 55,
	email: "student@example.com",
	notes: "Balanced skin; prefers cool weather; enjoys spicy food."
};

const EXAMPLE_ANSWERS = {
	skin: "balanced",
	body: "slim",
	hair: "thick",
	eyes: "medium",
	mindset: "calm",
	memory: "forgetful",
	emotions: "angry",
	dietpref: "hotspicy",
	sleep: "deep",
	energy: "balanced",
	weather: "cool",
	stress: "irritable"
};


