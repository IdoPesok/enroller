import React, { Fragment, useState } from 'react'
import { trpc } from '@/lib/trpc';
import { Enrolled, Sections, Enrolled_Type, Courses} from "@prisma/client"
import { daysFormat } from '@/lib/section-formatting';


const products = [
  {
    id: 1,
    name: 'CSC 307: Intro to Software Engineering',
    href: '#',
    color: 'Salmon',
    price: '$90.00',
    quantity: 1,
    imageSrc: 'https://tailwindui.com/img/ecommerce-images/shopping-cart-page-04-product-01.jpg',
    imageAlt: 'Salmon orange fabric pouch with match zipper, gray zipper pull, and adjustable hip belt.',
  },
  {
    id: 2,
    name: 'ISLA 340: Intro to Screenwriting',
    href: '#',
    color: 'Blue',
    price: '$32.00',
    quantity: 1,
    imageSrc: 'https://tailwindui.com/img/ecommerce-images/shopping-cart-page-04-product-02.jpg',
    imageAlt:
      'Front of satchel with blue canvas body, black straps and handle, drawstring top, and front zipper pouch.',
  },
  // More products...
]

const courses = [
    {
      id: 1,
      name: 'CSC 307: Intro to Software Engineering',
      href: '#',
      professor: 'John Fox',
      quantity: 1,
      startTime: '12:10',
      endTime: '2:00pm', //add am/pm
      imageSrc: 'https://tailwindui.com/img/ecommerce-images/shopping-cart-page-04-product-01.jpg',
      imageAlt: 'Salmon orange fabric pouch with match zipper, gray zipper pull, and adjustable hip belt.',
    },
    {
      id: 2,
      name: 'ISLA 340: Intro to Screenwriting',
      href: '#',
      professor: 'Prof Blue',
      startTime: '3:10',
      endTime: '5:00pm',
      quantity: 1,
      imageSrc: 'https://tailwindui.com/img/ecommerce-images/shopping-cart-page-04-product-02.jpg',
      imageAlt:
        'Front of satchel with blue canvas body, black straps and handle, drawstring top, and front zipper pouch.',
    },
    // More products...
  ]


export default function ShoppingCart() {

  //const [cartSections, setCartSections] = useState(trpc.enroll.listShoppingCart.useQuery())
  const cartSections = trpc.enroll.listShoppingCart.useQuery();

  const enrollCart = trpc.enroll.enrollShoppingCart.useMutation();

  const handleEnroll = () => {
    enrollCart.mutate();
  };


  return (
        //<div className="overflow-auto">
          <div className="min-w-2/5 overflow-auto">
            <div className=" flex min-w-2/5 max-w-full pl-10">
                  <div className="flex h-full flex-col overflow-y-auto bg-white shadow-xl">
                    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                      <div className="flex items-start justify-between">
                        <span className="text-lg font-medium text-gray-900">Shopping Cart</span>
                        <div className="ml-3 flex h-7 items-center">
                        </div>
                      </div>

                      <div className="mt-8">
                        <div className="flow-root">
                          <ul role="list" className="-my-6 divide-y divide-gray-200">
                            {cartSections?.data?.map((cartSection) => (
                              <li key={cartSection.SectionId} className="flex py-6">

                                <div className=" flex flex-1 flex-col">
                                  <div>
                                    <div className="flex justify-between text-base font-medium text-gray-900">
                                      <h3>
                                        <a href="#">{cartSection.Section.Course}: {cartSection.Section.Courses.Name}</a>
                                      </h3>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-500">{cartSection.Section.Professor}</p>
                                  </div>
                                  <div className="flex flex-1 items-end justify-between text-sm">
                                    <p className='text-gray-500'>{daysFormat(cartSection.Section)} {cartSection.Section.Start.toLocaleTimeString('en-US', { hour12: true, timeStyle: "short"})} - {cartSection.Section.End.toLocaleTimeString('en-US', { hour12: true, timeStyle: "short" })}</p>

                                    <div className="flex">
                                      <button
                                        type="button"
                                        className="font-medium text-emerald-600 hover:text-emerald-500"
                                      >
                                        Waitlist If Full
                                      </button>
                                      <input type="checkbox" className="ml-2"/>
                                    </div>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                      <div className="mt-6 flex items-center justify-center">
                        <button
                          type = "button"
                          className="rounded-md border border-transparent bg-emerald-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-emerald-800"
                          onClick={() => { 
                            enrollCart.mutate();
                            cartSections.refetch();
                          }}
                          >
                          Enroll
                        </button>
                      </div>
                      <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                        <p> 
                          <button
                            type="button"
                            className="font-medium text-emerald-600 hover:text-emerald-500"
                            //onClick={() => setOpen(false)}
                          >
                            Edit Shopping Cart
                            <span aria-hidden="true"> &rarr;</span>
                          </button>
                        </p>
                      </div>
                    </div>
                  </div>
            </div>
          </div>
        //</div>
  )
}


// export default function ShoppingCart() {
//   const [open, setOpen] = useState(true)

//   return (
//         <div className="flex overflow-auto">
//           <div className="overflow-auto">
//             <div className=" flex max-w-full pl-10">
//                   <div className="flex h-full flex-col overflow-y-auto bg-white shadow-xl">
//                     <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
//                       <div className="flex items-start justify-between">
//                         <span className="text-lg font-medium text-gray-900">Shopping Cart</span>
//                         <div className="ml-3 flex h-7 items-center">
//                         </div>
//                       </div>

//                       <div className="mt-8">
//                         <div className="flow-root">
//                           <ul role="list" className="-my-6 divide-y divide-gray-200">
//                             {courses.map((course) => (
//                               <li key={course.id} className="flex py-6">
//                                 {/* <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
//                                   <img
//                                     src={product.imageSrc}
//                                     alt={product.imageAlt}
//                                     className="h-full w-full object-cover object-center"
//                                   />
//                                 </div> */}

//                                 <div className=" flex flex-1 flex-col">
//                                   <div>
//                                     <div className="flex justify-between text-base font-medium text-gray-900">
//                                       <h3>
//                                         <a href={course.href}>{course.name}</a>
//                                       </h3>
//                                       {/* <p className="ml-4">{course.price}</p> */}
//                                     </div>
//                                     <p className="mt-1 text-sm text-gray-500">{course.professor}</p>
//                                   </div>
//                                   <div className="flex flex-1 items-end justify-between text-sm">
//                                     <p className='text-gray-500'>MWF {course.startTime} - {course.endTime}</p>

//                                     <div className="flex">
//                                       <button
//                                         type="button"
//                                         className="font-medium text-emerald-600 hover:text-emerald-500"
//                                       >
//                                         Waitlist If Full
//                                       </button>
//                                       <input type="checkbox" className="ml-2"/>
//                                     </div>
//                                   </div>
//                                 </div>
//                               </li>
//                             ))}
//                           </ul>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
//                       {/* <div className="flex justify-between text-base font-medium text-gray-900">
//                         <p>Subtotal</p>
//                         <p>$262.00</p>
//                       </div>
//                       <p className="mt-0.5 text-sm text-gray-500">Shipping and taxes calculated at checkout.</p> */}
//                       <div className="mt-6">
//                         <a
//                           href="#"
//                           className="flex items-center justify-center rounded-md border border-transparent bg-emerald-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-emerald-800"
//                         >
//                           Enroll
//                         </a>
//                       </div>
//                       <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
//                         <p> 
//                           <button
//                             type="button"
//                             className="font-medium text-emerald-600 hover:text-emerald-500"
//                             onClick={() => setOpen(false)}
//                           >
//                             Edit Shopping Cart
//                             <span aria-hidden="true"> &rarr;</span>
//                           </button>
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//             </div>
//           </div>
//         </div>
//   )
// }
