import { useEffect, useState } from "react";
import { Enrolled_Type, Sections } from "@prisma/client"
import WeekCalendar from "../../components/WeekCalendar/WeekCalendar"
import { trpc } from "@/lib/trpc";
import { CalendarEvent } from "@/interfaces/CalendarTypes";
import { SourceTextModule } from "vm";

interface props {
  currentQuarter: string,
  height: number,
  width: string,
  courses?: Sections[]
}


const CURRENT_QUARTER = 'Spring 2023' // hard coded for now as placeholder
const calendarHeight = 600 // TODO: find best way of sizing height 

export default function Calendar(props:props){
  const [showEnrolled, setShowEnrolled] = useState(true)
  const [showWaitlist, setShowWaitlist] = useState(false)
  const [showShoppingCart, setShowShoppingCart] = useState(false)
  const [showingSections, setShowingSections] = useState<Enrolled_Type[]>([Enrolled_Type.Enrolled])

  const sections = trpc.home.userSections.useQuery({ types: showingSections }).data 
  console.log("sections: " + sections)

  const handleShowEnrolled = () => { 
    setShowEnrolled(prevShowEnrolled => !prevShowEnrolled)
  }

  const handleShowWaitlist = () => { 
    setShowWaitlist(prevShowWaitlist => !prevShowWaitlist)
  }

  const handleShowShoppingCart = () => { 
    setShowShoppingCart(prevShowShoppingCart => !prevShowShoppingCart)
  }

  const updateShowEnrolled = () => {
    showEnrolled ? setShowingSections([...showingSections, Enrolled_Type.Enrolled]) 
                 : setShowingSections(showingSections.filter((type) => type !== Enrolled_Type.Enrolled))
  }

  const updateShowWaitlist = () => {
    showWaitlist ? setShowingSections([...showingSections, Enrolled_Type.Waitlist]) 
                 : setShowingSections(showingSections.filter((type) => type !== Enrolled_Type.Waitlist))
  }

  const updateShowShoppingCart = () => {
    showShoppingCart ? setShowingSections([...showingSections, Enrolled_Type.ShoppingCart]) 
                 : setShowingSections(showingSections.filter((type) => type !== Enrolled_Type.ShoppingCart))
  }

  useEffect(() => {
    updateShowEnrolled()
  }, [showEnrolled])

  useEffect(() => {
    updateShowWaitlist()
  }, [showWaitlist])

  useEffect(() => {
    updateShowShoppingCart()
  }, [showShoppingCart])

  return (
      <>
        <div className="columns-3 text-center gap-x-2 pb-4">
          <div>
            <label>
              Show Enrolled Classes
              <input type="checkbox" className="ml-2" checked={showEnrolled} onChange={handleShowEnrolled}/>
            </label>
          </div>
          <div>
            <label>
              Show Waitlisted Classes
              <input type="checkbox" className="ml-2" checked={showWaitlist} onChange={handleShowWaitlist}/>
            </label>
          </div>
          <div>
            <label>
              Show Shopping Cart Classes
              <input type="checkbox" className="ml-2" checked={showShoppingCart} onChange={handleShowShoppingCart}/>
            </label>
          </div>
        </div>

        <div>
          <WeekCalendar currentQuarter={CURRENT_QUARTER} height={calendarHeight} width="" sections={sections ? sections : []}/>
        </div>
      </>
  );
}

