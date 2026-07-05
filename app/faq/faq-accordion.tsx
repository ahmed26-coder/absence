"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

export interface Faq {
    q: string
    a: string
}

export function FaqAccordion({ faqs }: { faqs: Faq[] }) {
    const [openIndex, setOpenIndex] = useState<number | null>(0)

    return (
        <div className="space-y-4">
            {faqs.map((faq, idx) => {
                const isOpen = openIndex === idx
                return (
                    <div
                        key={idx}
                        className={`overflow-hidden rounded-2xl border bg-card transition-all duration-200 ${isOpen ? "border-primary shadow-md" : "border-border shadow-sm"}`}
                    >
                        <h3>
                            <button
                                type="button"
                                onClick={() => setOpenIndex(isOpen ? null : idx)}
                                aria-expanded={isOpen}
                                aria-controls={`faq-panel-${idx}`}
                                id={`faq-trigger-${idx}`}
                                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-start transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                            >
                                <span className={`font-bold text-lg ${isOpen ? "text-primary" : "text-foreground"}`}>
                                    {faq.q}
                                </span>
                                {isOpen ? (
                                    <ChevronUp className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                                ) : (
                                    <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                                )}
                            </button>
                        </h3>

                        <div
                            id={`faq-panel-${idx}`}
                            role="region"
                            aria-labelledby={`faq-trigger-${idx}`}
                            hidden={!isOpen}
                            className="border-t border-border/60 bg-muted/20 px-6 py-4 leading-relaxed text-muted-foreground"
                        >
                            {faq.a}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
