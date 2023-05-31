import { ArrowUpIcon } from "lucide-react"
import { useEffect } from "react"
import { Button } from "./button"

export default function ScrollToTopButton() {
  // setup scroll listener
  useEffect(() => {
    // listen for scroll events
    window.addEventListener("scroll", handleScroll)

    // cleanup
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  // scroll to top on click
  const handleClick = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  // show/hide button on scroll
  const handleScroll = () => {
    const btn = document.getElementById("scroll-to-top")
    if (btn) {
      if (window.scrollY > 100) {
        btn.classList.remove("hidden")
      } else {
        btn.classList.add("hidden")
      }
    }
  }

  return (
    <Button
      id="scroll-to-top"
      className="fixed bottom-6 right-12 hidden"
      onClick={handleClick}
    >
      <ArrowUpIcon className="h-4 w-4" />
    </Button>
  )
}
