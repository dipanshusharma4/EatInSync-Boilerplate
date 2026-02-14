import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'

const FAQs = () => {
    const [openIndex, setOpenIndex] = useState(null);

    const toggleOpen = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    }

    const faqData = [
        {
            question: "What is Molecular Analysis?",
            answer: "Molecular Analysis breaks down foods into their chemical constituents. Instead of just looking at fats or carbs, we identify specific bio-active amines like Tyramine, Histamine, and Phenylethylamine that can trigger individual sensitivities."
        },
        {
            question: "Is this a medical advice tool?",
            answer: "No. EatInSync provides nutritional information based on chemical composition. It is a wellness tool to help you identify patterns and optimize your diet. Always consult a healthcare professional for medical conditions."
        },
        {
            question: "How do you calculate the Bio-Compatibility Score?",
            answer: "We compare the chemical profile of a meal against your personal sensitivity profile. User inputs (e.g., 'I get headaches from red wine') help us weight certain compounds negatively. A score of 100 means zero known triggers."
        },
        {
            question: "Can I use this for weight loss?",
            answer: "Indirectly, yes. By eating foods that don't cause inflammation or adverse reactions, many users find it easier to maintain a healthy weight and energy levels. However, our primary focus is bio-compatibility, not calorie restriction."
        },
        {
            question: "Is the detailed analysis free?",
            answer: "We offer a free tier with basic analysis. Advanced features like personalized long-term tracking and complex recipe optimization will be part of our premium offering."
        }
    ];

    return (
        <div className="max-w-3xl mx-auto px-4 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-16"
            >
                <div className="inline-block px-4 py-1.5 rounded-full bg-purple-50 dark:bg-purple-900/30 border border-purple-100 dark:border-purple-800 mb-6">
                    <span className="text-purple-600 dark:text-purple-400 text-sm font-semibold tracking-wide uppercase">Support</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h1>
                <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                    Everything you need to know about the product and how it works.
                </p>
            </motion.div>

            <div className="space-y-4">
                {faqData.map((faq, index) => (
                    <div key={index} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800">
                        <button
                            className="w-full text-left px-6 py-4 flex justify-between items-center focus:outline-none hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                            onClick={() => toggleOpen(index)}
                        >
                            <span className="font-semibold text-slate-900 dark:text-white text-lg">{faq.question}</span>
                            <span className={`transform transition-transform duration-200 text-slate-400 dark:text-slate-500 ${openIndex === index ? 'rotate-180' : ''}`}>
                                ▼
                            </span>
                        </button>
                        <AnimatePresence>
                            {openIndex === index && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                    className="overflow-hidden"
                                >
                                    <div className="px-6 pb-6 text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-700 pt-4">
                                        {faq.answer}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>

            <div className="mt-16 text-center text-slate-500 dark:text-slate-400">
                Still have questions? <a href="mailto:support@eatinsync.com" className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline">Contact Support</a>
            </div>
        </div>
    )
}

export default FAQs
