import Image from "next/image";
import Graduation from './graduation.svg';
import { Button } from "@/components/ui/button";
import { useState } from "react";
import anime from 'animejs';
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/router";
import { generateStudentRoute } from "@/lib/routes";

export default function Onboarding() {
  const [stage, setStage] = useState(1)
  const [selectedCatalog, setSelectedCatalog] = useState<undefined | string>(undefined)
  const [open, setOpen] = useState(false)
  const [selectedMajor, setSelectedMajor] = useState("")
  const [selectedConcentration, setSelectedConcentration] = useState("")
  const router = useRouter()

  const catalogs = trpc.onboard.catalogs.useQuery();
  const majors = trpc.onboard.majors.useQuery({
    catalogYear: selectedCatalog
  });
  const concentrations = trpc.onboard.concentrations.useQuery({
    catalogYear: selectedCatalog,
    majorId: selectedMajor
  });

  const handleMutationSuccess = () => {
    const nextRoute = generateStudentRoute("courses")
    // redirect to next route
    router.replace(nextRoute)
  }
  const mutation = trpc.onboard.saveUserFlowchart.useMutation({
    onSuccess: handleMutationSuccess
  })

  const animateStage = async (newStage: number) => {
    const element = document.getElementById(`stage-${stage}`)
    if (!element) return

    await anime({
      targets: element,
      translateX: stage > newStage ? -100 : 100,
      opacity: 0,
      easing: 'easeInOutQuad',
      duration: 500,
    }).finished

    anime({
      targets: element,
      translateX: stage > newStage ? 100 : -100,
      opacity: 0,
      easing: 'easeInOutQuad',
      duration: 0,
    }).finished

    setStage(newStage)

    await anime({
      targets: element,
      translateX: 0,
      opacity: 1,
      easing: 'easeInOutQuad',
      duration: 500,
    }).finished
  }

  const saveOnboarding = async () => {
    await mutation.mutateAsync({
      catalogYear: selectedCatalog,
      majorId: selectedMajor,
      concentrationId: selectedConcentration
    })
  }

  const stageOne = (
    <>
      <h1 className="text-3xl font-bold flex items-center text-center justify-center">
        Welcome!
      </h1>
      <Image
        src={Graduation}
        width={300}
        height={100}
        alt="Graduation"
        className="mr-2 rounded-sm"
      />
      <p className="my-0">
        We&apos;re excited to have you here! 
        Before you can start using 
        <br/>
        the platform, we need to know a bit more about you.
      </p>
      <Button
        className="bg-emerald-500 hover:bg-emerald-600 text-white"
        onClick={() => animateStage(2)}
      >
        Begin
      </Button>
    </>
  )

  const stageTwo = (
    <>
      <h1 className="text-3xl font-bold flex items-center text-center justify-center">
        Select your catalog year
      </h1>
      <p className="my-0">
        We will begin with your catalog year.
        This will<br/> help us determine which courses you need to take.
      </p>
      <div className="grid grid-cols-3 gap-4">
        {
          catalogs.data?.map((catalog) => (
            <Button
              key={catalog.CatalogYear}
              className={cn(
                "hover:bg-slate-300 bg-slate-100 text-black",
                selectedCatalog === catalog.CatalogYear && "bg-emerald-500 text-white hover:bg-emerald-500"
              )}
              onClick={() => setSelectedCatalog(catalog.CatalogYear)}
            >
              {catalog.CatalogYear}
            </Button>
          ))
        }
      </div>
      <Button
        className={cn(
          "bg-emerald-500 hover:bg-emerald-600 text-white",
          !selectedCatalog && "opacity-50 cursor-not-allowed"
        )}
        onClick={() => animateStage(3)}
        disabled={!selectedCatalog}
      >
        Next
      </Button>
    </>
  )

  const stageThree = (
    <>
      <h1 className="text-3xl font-bold flex items-center text-center justify-center">
        Select your major
      </h1>
      <p className="my-0">
        Great! Now we are diving deeper.
        This will<br/> help us determine which courses you need to take.
      </p>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[400px] justify-between"
          >
            {selectedMajor && majors.data
              ? majors.data.find((major) => major.Id === selectedMajor)?.Name
              : "Select major..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0">
          <Command>
            <CommandInput placeholder="Search majors..." />
            <CommandEmpty>No majors found.</CommandEmpty>
            <CommandGroup className="max-h-48 overflow-y-auto">
              {majors.data?.map((major) => (
                <CommandItem
                  key={major.Id}
                  onSelect={() => {
                    setSelectedMajor(major.Id === selectedMajor ? "" : major.Id)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedMajor === major.Id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {major.Name}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      <Button
        className={cn(
          "bg-emerald-500 hover:bg-emerald-600 text-white",
          !selectedMajor && "opacity-50 cursor-not-allowed"
        )}
        onClick={() => animateStage(4)}
        disabled={!selectedMajor}
      >
        Next
      </Button>
    </>
  )

  const stageFour = (
    <>
      <h1 className="text-3xl font-bold flex items-center text-center justify-center">
        Last step! Select your concentration
      </h1>
      <p className="my-0">
        Awesome! We are almost there!
        This will be the final <br/> step to help us determine which courses you need to take.
      </p>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[400px] justify-between"
          >
            {selectedConcentration && concentrations.data
              ? concentrations.data.find((conc) => conc.Id === selectedConcentration)?.Name ?? "General (No concentration)"
              : "Select concentration..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0">
          <Command>
            <CommandInput placeholder="Search concentration..." />
            <CommandEmpty>No concentrations found.</CommandEmpty>
            <CommandGroup className="max-h-48 overflow-y-auto">
              {concentrations.data?.map((conc, ix) => (
                <CommandItem
                  key={conc.Id + ix.toString()}
                  onSelect={() => {
                    setSelectedConcentration(conc.Id === selectedConcentration ? "" : conc.Id)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedConcentration === conc.Id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {conc.Name ?? "General (No concentration)"}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      {
        mutation.error && (
          <p className="text-red-500">
            {mutation.error.message}
          </p>
        )
      }
      {
        mutation.isLoading ? (
          <Spinner />
        ) : (
          <Button
            className={cn(
              "bg-emerald-500 hover:bg-emerald-600 text-white",
              (!selectedConcentration || mutation.isLoading) && "opacity-50 cursor-not-allowed"
            )}
            onClick={saveOnboarding}
            disabled={!selectedConcentration || mutation.isLoading}
          >
            Finish
          </Button>
        )
      }
    </>
  )

  return (
    <div className="mx-auto max-w-2xl py-10 text-center flex flex-col gap-10 items-center justify-center mb-20" id={'stage-' + stage}>
      {{
        1: stageOne,
        2: stageTwo,
        3: stageThree,
        4: stageFour,
      }[stage] || <></>}
    </div>
  )
}
