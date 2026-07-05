"use client"

import { useEffect } from "react"

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <html dir="rtl" lang="ar">
            <body>
                <div
                    style={{
                        minHeight: "100vh",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "1rem",
                        padding: "1rem",
                        textAlign: "center",
                        fontFamily: "system-ui, sans-serif",
                        color: "#1f2937",
                    }}
                >
                    <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>حدث خطأ في النظام</h1>
                    <p style={{ color: "#6b7280", maxWidth: "28rem" }}>
                        عذراً، حدث خطأ غير متوقع. يرجى إعادة تحميل الصفحة.
                    </p>
                    <button
                        onClick={reset}
                        style={{
                            padding: "0.5rem 1.25rem",
                            borderRadius: "0.5rem",
                            border: "none",
                            background: "#16a34a",
                            color: "white",
                            cursor: "pointer",
                            fontWeight: 600,
                        }}
                    >
                        إعادة المحاولة
                    </button>
                </div>
            </body>
        </html>
    )
}
