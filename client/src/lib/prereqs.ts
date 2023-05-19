import {
  Prereq,
  PrereqLeaf,
  PrereqOp,
  PrereqOpType,
} from "@/interfaces/PrereqTypes"

export function prereqString(
  prereq: Prereq,
  depth: number = 0
): string | undefined {
  if (Object.values(PrereqOpType).includes(prereq.type as PrereqOpType)) {
    const prereqOp = prereq as PrereqOp
    const format = prereqOp.children
      .map((p) => prereqString(p, depth + 1))
      .join(` ${prereqOp.type} `)
    return depth > 0 ? `(${format})` : format
  } else {
    const prereqLeaf = prereq as PrereqLeaf
    return prereqLeaf.code
  }
}

export function prereqsString(prereqs: Prereq[] | null) {
  if (!prereqs) {
    return null
  }
  console.log(prereqs)
  return prereqs.map(prereqString).join(" ")
}
