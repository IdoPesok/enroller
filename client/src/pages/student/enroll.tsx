import { useState } from "react"
import ShoppingCart from "../../components/enroll/shopping-cart"
import WeekCalendar from "@/components/WeekCalendar/WeekCalendar"
import {trpc} from "@/lib/trpc"


const CURRENT_QUARTER = 'Spring 2023' // hard coded for now as placeholder
const calendarHeight = 400 // TODO: find best way of sizing height 
const calenderWidth = 400

//do I need to input object here?
//const cartSections = trpc.enroll.listShoppingCart.useQuery(); 

export default function Enroll(){
    return(
        <>
        <div className = "flex flex-row">
            <WeekCalendar currentQuarter='' height={calendarHeight} width="w-3/5" courses={[]}></WeekCalendar>
            <ShoppingCart></ShoppingCart>
        </div>
        </>
    );
}