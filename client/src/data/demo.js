export const DemoAnalysis = {
  dish: {
    dishName: "Easy Thai Peanut Sauce",
    Recipe_id: "demo-thai-peanut",
    ingredients: "peanut butter, soy sauce, lime juice, brown sugar, garlic, ginger, red chili flakes, water",
    Calories: 150
  },
  analysis: {
    block: false,
    bioScore: 88,
    tasteScore: 94,
    evidence: [
      { 
        ingredient: "Peanuts", 
        reason: "Rich in healthy monounsaturated fats and protein, supports sustained energy.", 
        type: "benefit" 
      },
      { 
        ingredient: "Ginger", 
        reason: "Excellent for digestion and reducing inflammation.", 
        type: "benefit" 
      },
      { 
        ingredient: "Soy Sauce", 
        reason: "Contains high sodium which may cause bloating for sensitive individuals.", 
        type: "sensitivity" 
      },
      {
        ingredient: "Red Chili Flakes",
        reason: "Capsaicin can boost metabolism but might irritate sensitive stomachs.",
        type: "sensitivity"
      }
    ],
    breakdown: [
      "This sauce is a **nutritional powerhouse** thanks to the peanuts and ginger.",
      "The **healthy fats** provide satiety, making it a great pairing for veggies or lean proteins.",
      "However, the **sodium content** from soy sauce suggests moderation is key.",
      "Overall, it aligns well with your metabolic profile, offering a good balance of macronutrients."
    ],
    modifications: [
      { original: "Soy Sauce", swap: "Coconut Aminos (Lower Sodium)" },
      { original: "Brown Sugar", swap: "Maple Syrup (Lower Glycemic Index)" }
    ]
  },
  alternatives: [
    { 
      Recipe_title: "Golden Turmeric Tahini Dressing", 
      Recipe_id: "demo-alt-1", 
      bioScore: 95,
      ingredients: "tahini, turmeric, lemon, maple syrup"
    },
    { 
      Recipe_title: "Creamy Cashew Ginger Sauce", 
      Recipe_id: "demo-alt-2", 
      bioScore: 92,
      ingredients: "cashews, ginger, garlic, lime"
    },
    { 
      Recipe_title: "Zesty Almond Butter Dip", 
      Recipe_id: "demo-alt-3", 
      bioScore: 90,
      ingredients: "almond butter, orange juice, soy sauce"
    }
  ]
};
