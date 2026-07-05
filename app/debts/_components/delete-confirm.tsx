"use client"

import { usePayments } from "./use-payments"
import { Sheet } from "./sheet"
import { TrashFull } from "./icons"

export function DeleteConfirm() {
  const p = usePayments()
  const item = p.items.find((i) => i.id === p.confirmId)

  return (
    <Sheet
      open={!!p.confirmId}
      onClose={() => p.setConfirmId(null)}
      label="تأكيد حذف العملية"
      variant="center"
      width={360}
    >
      <div className="px-5 pb-5 pt-6 text-center">
        <div
          className="mx-auto mb-3.5 flex items-center justify-center"
          style={{ width: "56px", height: "56px", borderRadius: "16px", background: "var(--rose-bg)", color: "var(--rose)" }}
        >
          <TrashFull size={27} />
        </div>
        <div className="font-heading" style={{ fontWeight: 800, fontSize: "17px" }}>
          حذف العملية؟
        </div>
        <div style={{ fontSize: "13px", color: "var(--muted)", marginTop: "7px", lineHeight: 1.7 }}>
          سيتم حذف «{item?.name ?? ""}» وكل دفعاتها المسجّلة نهائيًا. لا يمكن التراجع.
        </div>
        <div className="mt-5 flex gap-2.5">
          <button
            type="button"
            onClick={() => p.setConfirmId(null)}
            style={{
              flex: 1,
              height: "46px",
              borderRadius: "12px",
              border: "1px solid var(--line)",
              background: "var(--paper)",
              color: "var(--ink)",
              fontWeight: 700,
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            تراجع
          </button>
          <button
            type="button"
            onClick={p.doDelete}
            disabled={p.isPending}
            style={{
              flex: 1,
              height: "46px",
              borderRadius: "12px",
              border: "none",
              background: "var(--rose)",
              color: "#fff",
              fontWeight: 700,
              fontSize: "14px",
              cursor: "pointer",
              opacity: p.isPending ? 0.7 : 1,
            }}
          >
            نعم، احذف
          </button>
        </div>
      </div>
    </Sheet>
  )
}
