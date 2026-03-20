import DM from "./data-manager"

function toBase64(str: string) {
  return btoa(
    String.fromCharCode(...new TextEncoder().encode(str))
  )
}

function fromBase64(data: any) {
  const decoded = atob(data)
  const utf8data = new Uint8Array(decoded.length)
  for (let i = 0; i < decoded.length; i++) {
    utf8data[i] = decoded.charCodeAt(i)
  }
  return JSON.parse(new TextDecoder().decode(utf8data))
}

function getUrl(file: string) {
  // @ts-ignore
  return `https://api.github.com/repos/${__GITHUB_USER__}/${__GITHUB_REPO__}/contents/${file}`
}

export async function getRepoFile(file: string) {
  try {
    const res = await fetch(getUrl(file))
    if (res.ok) {
      const json = await res.json()
      return fromBase64(json.content)
    }
  } catch(err: any) {
    console.error(err.toString())
  }

  return null

  // if (DM.github) {
  //   // @ts-ignore
  //   const owner = __GITHUB_USER__
  //   // @ts-ignore
  //   const repo = __GITHUB_REPO__
  //   const branch = "main"

  //   try {
  //     const { data } = await DM.github.repos.getContent({
  //       owner,
  //       repo,
  //       path: file,
  //       ref: branch
  //     })
  //     // @ts-ignore
  //     return fromBase64(data.content)
  //   } catch(err: any) {
  //     console.error(err.toString())
  //   }

  //   return null
  // }
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