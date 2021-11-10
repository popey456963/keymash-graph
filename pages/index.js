import React, { useCallback, useState } from 'react';
import { Line } from 'react-chartjs-2';
import _ from 'lodash';
import sma from 'sma';
import Head from 'next/head';

const options = {
  scales: {
    y: {
      beginAtZero: true
    }
  }
};

function linearRegression(y, x) {
  var lr = {};
  var n = y.length;
  var sum_x = 0;
  var sum_y = 0;
  var sum_xy = 0;
  var sum_xx = 0;
  var sum_yy = 0;

  for (var i = 0; i < y.length; i++) {

    sum_x += x[i];
    sum_y += y[i];
    sum_xy += (x[i] * y[i]);
    sum_xx += (x[i] * x[i]);
    sum_yy += (y[i] * y[i]);
  }

  lr['slope'] = (n * sum_xy - sum_x * sum_y) / (n * sum_xx - sum_x * sum_x);
  lr['intercept'] = (sum_y - lr.slope * sum_x) / n;
  lr['r2'] = Math.pow((n * sum_xy - sum_x * sum_y) / Math.sqrt((n * sum_xx - sum_x * sum_x) * (n * sum_yy - sum_y * sum_y)), 2);

  return lr;
}

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
    newDatasets[0].data = matches.data
      .filter(item => item.placement !== 999)
      .map(match => match.wpm)
      .filter(wpm => wpm > 20 && wpm < 250)

    let batches = _.chunk(newDatasets[0].data, 100)
    const regressions = []
    let batchStart = 0

    for (let batch of batches) {
      const res = linearRegression(batch, new Array(batch.length).fill(1).map((a, index) => index))
      regressions.push(res)

      batchStart += 100
    }

    newDatasets[1] = {
      label: 'Regression',
      data: [],
      fill: false,
      backgroundColor: 'rgb(132, 99, 255)',
      borderColor: 'rgba(132, 99, 255, 0.2)',
    }

    for (let regression of regressions) {
      for (let i = 0; i < 100; i++) {
        newDatasets[1].data.push(regression.intercept + regression.slope * i)
      }
    }

    let array = []

    for (let i = 0; i < 25; i++) {
      array.push(undefined)
    }

    array = array.concat(sma(newDatasets[0].data, 50))

    for (let i = 0; i < 25; i++) {
      array.push(undefined)
    }

    newDatasets[2] = {
      label: '24 Window Average',
      data: array,
      fill: false,
      backgroundColor: 'rgb(132, 255, 99)',
      borderColor: 'rgba(132, 255, 99, 0.2)',
    }

    newDatasets[0] = newDatasets[2]
    newDatasets[1] = undefined
    newDatasets[2] = undefined

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