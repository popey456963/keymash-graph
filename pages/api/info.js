import fetch from 'node-fetch'

export default async function handler(req, res) {
  let info
  try {
    info = await fetch(`https://api.keyma.sh/api/v2/player/info?name=${req.query.name}`)
      .then(fetchRes => fetchRes.json())
  } catch (e) {
    console.log(e)
    throw e
  }

  res.status(200).json(info)
}
