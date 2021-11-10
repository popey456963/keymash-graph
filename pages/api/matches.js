import fetch from 'node-fetch'

export default async function handler(req, res) {
    const info = await fetch(`https://api.keyma.sh/api/v2/player/matches?playerId=${req.query.playerId}&worldId=0&limit=90000&startNum=0`)
        .then(fetchRes => fetchRes.json())

    res.status(200).json(info)
}
