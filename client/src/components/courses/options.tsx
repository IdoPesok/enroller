interface Option {
  value: string
  label: string
}

export const classTypes: Option[] = [
  {
    value: "Seminar",
    label: "Seminar",
  },
  {
    value: "Lab",
    label: "Lab",
  },
  {
    value: "Lecture",
    label: "Lecture",
  },
]

export const modalities: Option[] = [
  {
    value: "InPerson",
    label: "In Person",
  },
  {
    value: "Online",
    label: "Online",
  },
  {
    value: "TBD",
    label: "TBD",
  },
]
