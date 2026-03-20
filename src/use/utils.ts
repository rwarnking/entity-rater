
export function getGenderIcon(gender: string) {
  return gender === "m" ? "mdi-gender-male" : "mdi-gender-female"
}

export function getGenderColor(gender: string) {
  return gender === "m" ? "blue" : "red"
}
