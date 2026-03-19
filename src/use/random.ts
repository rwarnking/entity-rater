export function shuffle(array: Array<any>) {
  const a = array.slice()
  for (let i = a.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i+1));
    let k = array[i]
    a[i] = a[j]
    a[j] = k
  }
  return a
}