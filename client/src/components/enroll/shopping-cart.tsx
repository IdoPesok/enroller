import React, { useState } from "react"
import { trpc } from "@/lib/trpc"
import { Button } from "../ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import ErrorMessage from "../ui/error-message"
import { daysFormat } from "@/lib/section-formatting"
import { Check, ExternalLinkIcon } from "lucide-react"
import { Checkbox } from "../ui/checkbox"
import { Switch } from "../ui/switch"
import Link from "next/link"

type Props = React.ComponentProps<typeof Card> & {
  hiddenSections: number[]
  handleHideSection: (sectionId: number) => void
  quarter: number | undefined
}

export default function ShoppingCart({
  className,
  hiddenSections,
  handleHideSection,
  quarter,
  ...props
}: Props) {
  const cartSections = trpc.enroll.listShoppingCart.useQuery(
    {
      term: quarter!,
    },
    {
      enabled: Boolean(quarter),
    }
  )

  const enrollCart = trpc.enroll.enrollShoppingCart.useMutation()

  const [dontWaitlist, setDontWaitlist] = useState<number[]>([])
  const updateDontWaitlist = (sectionId: number) => {
    if (dontWaitlist.includes(sectionId)) {
      setDontWaitlist(dontWaitlist.filter((id) => id !== sectionId))
    } else {
      setDontWaitlist([...dontWaitlist, sectionId])
    }
  }

  const handleEnroll = () => {
    enrollCart.mutate()
  }

  const skeletonLoader = (
    <div>
      {[1, 2, 3].map((index) => (
        <div
          key={index}
          className="mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0 animate-pulse"
        >
          <span className="flex h-2 w-2 translate-y-1 rounded-full bg-slate-200" />
          <div className="space-y-2">
            <p className="text-md font-medium leading-none rounded-md bg-muted h-6 w-50" />
            <p className="text-sm text-muted-foreground w-24 rounded-md bg-muted h-5" />
            <div className="flex justify-between">
              <p className="text-sm text-muted-foreground w-24 rounded-md bg-muted h-5" />
              <p className="text-sm text-muted-foreground w-24 rounded-md bg-muted h-5" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  const emptyWarning = (
    <div className="flex flex-col items-center justify-center">
      <p className="text-lg font-medium">No sections in cart.</p>
      <p className="text-sm text-muted-foreground">
        Add sections to your cart to enroll.
      </p>
    </div>
  )

  return (
    <Card
      className={cn("w-2/5 min-w-[30rem] flex flex-col", className)}
      {...props}
    >
      <CardHeader>
        <CardTitle>Shopping Cart</CardTitle>
        <CardDescription>Enroll in classes here.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 flex-1 overflow-y-auto">
        {cartSections.isLoading ? (
          skeletonLoader
        ) : cartSections.error ? (
          <ErrorMessage message={cartSections.error.message} />
        ) : cartSections.data.length === 0 ? (
          emptyWarning
        ) : (
          <div>
            {cartSections.data.map((cartSection, index) => (
              <div
                key={index}
                className="mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0"
              >
                <span className="flex h-2 w-2 translate-y-1 rounded-full bg-emerald-500" />
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <Link
                      href={`/student/courses?p=${cartSection.Section.Courses.Prefix.toLowerCase()}&q=${
                        cartSection.Section.Courses.Number
                      }&term=${quarter}`}
                      className="text-md font-medium leading-none flex gap-2 items-center hover:underline"
                    >
                      {cartSection.Section.Course}:{" "}
                      {cartSection.Section.Courses.Name}
                      <ExternalLinkIcon size={16} />
                    </Link>
                    <div className="flex gap-4 justify-end items-center">
                      <Switch
                        checked={
                          !hiddenSections.includes(cartSection.SectionId)
                        }
                        onCheckedChange={() =>
                          handleHideSection(cartSection.SectionId)
                        }
                        className={cn(
                          !hiddenSections.includes(cartSection.SectionId) &&
                            "!bg-emerald-500"
                        )}
                      />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Professor: {cartSection.Section.Professor}
                  </p>
                  <div className="flex justify-between">
                    <p className="text-sm text-muted-foreground">
                      {daysFormat(cartSection.Section)}{" "}
                      {cartSection.Section.Start.toLocaleTimeString("en-US", {
                        hour12: true,
                        timeStyle: "short",
                      })}{" "}
                      -{" "}
                      {cartSection.Section.End.toLocaleTimeString("en-US", {
                        hour12: true,
                        timeStyle: "short",
                      })}
                    </p>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="terms"
                        checked={!dontWaitlist.includes(cartSection.SectionId)}
                        onCheckedChange={() =>
                          updateDontWaitlist(cartSection.SectionId)
                        }
                        className={cn(
                          !dontWaitlist.includes(cartSection.SectionId) &&
                            "!bg-emerald-200"
                        )}
                      />
                      <label
                        htmlFor="terms"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Waitlist if full
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          disabled={!cartSections.data || cartSections.data?.length === 0}
        >
          <Check className="mr-2 h-4 w-4" /> Enroll
        </Button>
      </CardFooter>
    </Card>
  )
}
