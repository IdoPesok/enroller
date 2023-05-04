export enum PrereqType {
  And = "and",
  Or = "or",
  Prerequisite = "prerequisite",
  Corequisite = "corequisite",
  Reccomended = "reccomended",
  Concurrent = "concurrent",
}

export enum PrereqOpType {
  And = "and",
  Or = "or",
}

export interface Prereq {
  type: PrereqType | PrereqOpType
}

export interface PrereqOp extends Prereq {
  type: PrereqOpType
  children: Prereq[]
}

export interface PrereqLeaf extends Prereq {
  code: string
  type: PrereqType
}