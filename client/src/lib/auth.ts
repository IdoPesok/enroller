import { PUBLIC_METADATA_KEYS } from "@/interfaces/PublicMetadata"

export const isUserAdmin = (user: UserPublicMetadata | undefined) => {
  if (!user) {
    return false
  }
  return user[PUBLIC_METADATA_KEYS.role] === "ADMIN"
}

export const doesUserNeedOnboarding = (user: UserPublicMetadata | undefined) => {
  if (!user) {
    return false
  }
  return user[PUBLIC_METADATA_KEYS.role] !== "ADMIN" && user[PUBLIC_METADATA_KEYS.onboarding] !== true
}