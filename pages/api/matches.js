import fetch from 'node-fetch'

async function getPage(playerId, page) {
    const info = await fetch(`https://api.keyma.sh/api/v2/player/matches?playerId=${playerId}&worldId=0&limit=50&startNum=${page * 50}`)
        .then(fetchRes => fetchRes.json())

    return info
}

export default async function handler(req, res) {
    let page = 0
    let running = true
    let data = []

    while (running) {
        console.log(page)
        const info = await getPage(req.query.playerId, page)
        page += 1;
        data = data.concat(info.data)

        running = info.isNextPage
    }

    res.status(200).json({
        data
    })
}
