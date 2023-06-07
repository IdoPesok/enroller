import { camelAddSpace } from "@/lib/section-formatting"
import { cn } from "@/lib/utils"
import { Enrolled_Type } from "@prisma/client"
import {
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  ShoppingCart,
} from "lucide-react"

interface Props {
  Status: Enrolled_Type
}

export default function EnrolledTypeBubble({ Status }: Props) {
  return (
    <span
      className={cn(
        "whitespace-nowrap w-32 h-2 py-3 px-1 text-xs font-medium rounded-full flex gap-2 items-center justify-center",
        Status === Enrolled_Type.Enrolled && "text-green-900 bg-green-200",
        Status === Enrolled_Type.Waitlist && "text-amber-900 bg-amber-200",
        Status === Enrolled_Type.ShoppingCart && "text-sky-900 bg-sky-200"
      )}
    >
      {camelAddSpace(Status)}{" "}
      {Status === Enrolled_Type.Enrolled ? (
        <CheckCircle2 size={10} />
      ) : Status === Enrolled_Type.Waitlist ? (
        <AlertCircle size={10} />
      ) : Status === Enrolled_Type.ShoppingCart ? (
        <ShoppingCart size={10} />
      ) : (
        <HelpCircle size={10} />
      )}
    </span>
  )
}
