import React, { useCallback, useState } from 'react';
import { Line } from 'react-chartjs-2';
import _ from 'lodash';
import Head from 'next/head';

const options = {
  scales: {
    y: {
      beginAtZero: true
    }
  }
};

const Index = () => {
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [data, setData] = useState({
    labels: [],
    datasets: [
      {
        label: 'WPM',
        data: [],
        fill: false,
        backgroundColor: 'rgb(255, 99, 132)',
        borderColor: 'rgba(255, 99, 132, 0.2)',
      },
    ],
  })

  const onClick = useCallback(async () => {
    setError('')

    const info = await fetch(`/api/info?name=${username}`)
      .then(res => res.json())

    if (info.error) {
      return setError(info.error)
    }

    const { playerId } = info

    const matches = await fetch(`/api/matches?playerId=${playerId}`)
      .then(res => res.json())

    const newDatasets = _.cloneDeep(data.datasets)
    newDatasets[0].data = matches.data.map(match => match.wpm).filter(wpm => wpm > 20 && wpm < 250)

    setData({
      ...data,
      labels: (new Array(newDatasets[0].data.length)).fill(1).map((i, index) => 'Game ' + String(index + 1)),
      datasets: newDatasets
    })
  }, [username, setError, setData, data])

  const handleUsernameChange = useCallback((e) => {
    setUsername(e.target.value)
  }, [setUsername])

  return (<>
    <Head>
      <title>Keymash Graph</title>
    </Head>
    <div className='content'>
      <div className='header'>
        <h1 className='title'>Graph of Matches over Time</h1>
        {error && <p>ERROR: {error}</p>}
        <div className='links'>
          <input placeholder="Codefined-8516" value={username} onChange={handleUsernameChange} />
          <a
            className='btn btn-gh'
            onClick={onClick}
          >
            Set Username
          </a>
        </div>
      </div>
      <Line data={data} options={options} />
    </div>
  </>)
}

export default Index;