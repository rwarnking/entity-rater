import DM from "./data-manager"

function getUrl(file: string) {
  // @ts-ignore
  return `https://api.github.com/repos/${__GITHUB_USER__}/${__GITHUB_REPO__}/contents/${file}`
}

function toBase64(str: string) {
  return btoa(
    String.fromCharCode(...new TextEncoder().encode(str))
  )
}

export async function getRepoFile(file: string) {
  try {

    const res = await fetch(getUrl(file))
    const json = await res.json()
    return JSON.parse(atob(json.content))
  } catch(err: any) {
    console.error(err.toString())
    return null
  }
}

export async function pushRepoFile(path: string, message: string, content: any) {
  if (!DM.github) return
  let sha

  // @ts-ignore
  const owner = __GITHUB_USER__
  // @ts-ignore
  const repo = __GITHUB_REPO__
  const branch = "main"

  // get existing file (to update)
  try {
    const { data } = await DM.github.repos.getContent({
      owner,
      repo,
      path,
      ref: branch
    })

    if (!Array.isArray(data)) {
      sha = data.sha
    }
  } catch (err: any) {
    if (err.status !== 404) {
      console.error(err.toString())
      throw err
    }
  }

  const encoded = toBase64(JSON.stringify(content, null, 2))

  // create/update file (this makes the commit)
  const response = await DM.github.repos.createOrUpdateFileContents({
    owner,
    repo,
    path,
    message,
    content: encoded, // base64 encoding
    sha,              // required if updating
    branch
  });

  return response.data
}