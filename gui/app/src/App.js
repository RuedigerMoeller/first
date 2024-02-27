import logo from './logo.svg';
import React, { Component } from "react";
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import './App.css';
import './index.css';

const data = {
  labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
  datasets: [
    {
      label: 'First dataset',
      data: [33, 53, 85, 41, 44, 65, 85],
      fill: false,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    },
    {
      label: 'Second dataset',
      data: [33, 25, 35, 51, 54, 76, 95],
      fill: false,
      borderColor: 'rgb(255, 99, 132)',
      tension: 0.1
    }
  ]
};

class SearchField extends Component {
  constructor(props) {
    super(props);
    this.state = { inputValue: '' };
  }

  handleChange = (event) => {
    this.setState({ inputValue: event.target.value });
  };

  handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      // Call the passed-in handler function
      this.props.onEnter(this.state.inputValue);
    }
  };

  render() {
    const inputStyle = {
      fontSize: '1.25rem', // Large font size (equivalent to Tailwind's text-lg)
      border: '2px solid #d1d5db', // Light gray border (similar to Tailwind's border-gray-300)
      borderRadius: '0.5rem', // Rounded corners (similar to Tailwind's rounded-lg)
      padding: '0.5rem' // Padding inside the input (similar to Tailwind's p-2)
    };
    return (
      <div>
        <input
          style={inputStyle}
          type="text"
          value={this.state.inputValue}
          onChange={this.handleChange}
          onKeyDown={this.handleKeyDown} // Add the onKeyDown event handler
          placeholder="Ticker Symbol"
        />
      </div>
    );
  }
}

class QueryComp extends Component {

  constructor(props) {
    super(props);
    this.state = {
      data: { labels: {}, datasets: [] }
    }
  }

  async fetchTicker(ticker) {
    const resp = await fetch("query/?ticker=" + ticker);
    let res = await resp.json();
    res = res.filter(x => x.vol != null);
    res = res.reverse();
    const rawData = res;
    console.log(res);
    let prevDate = new Date(0);
    let labels = res.map(x => {
      const dt = new Date(x.dt);
      const year = dt.getFullYear();
      const month = dt.getMonth() + 1; // getMonth() returns 0-11
      const day = dt.getDate();
      const hours = dt.getHours();
      const minutes = dt.getMinutes();
      const seconds = dt.getSeconds();
      //if ( dt.getDay() != prevDate.getDay() ) 
      {
        // Formatting to a more readable form, for example: "13-02-2024 15:54:25"
        const formattedDate = `${day}-${month.toString().padStart(2, '0')} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        prevDate = dt;
        return formattedDate;
      }
      prevDate = dt;
      const formattedDate = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      return formattedDate;
    });
    let sets = [
      {
        label: "Price",
        data: res.map(x => x.price),
        fill: false,
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1,
        yAxisID: "y1"
      },
      {
        label: "PCR OI",
        data: res.map(x => x.oi),
        fill: false,
        borderColor: 'rgb(99, 255, 132)',
        tension: 0.1,
        yAxisID: "y2"
      },
      {
        label: "PCR Vol",
        data: res.map(x => x.vol),
        fill: false,
        borderColor: 'rgb(99, 132, 255)',
        tension: 0.1,
        yAxisID: "y2"
      },
      {
        label: "Volume",
        data: res.map(x => x.activeVol),
        fill: false,
        borderColor: 'rgb(132, 132, 132)',
        tension: 0.1,
        yAxisID: "y3"
      }

    ];
    const full = {
      labels: labels,
      datasets: sets
    };
    this.setState(prev => ({ data: full, rawData: rawData, ticker: ticker }));
  }

  componentDidMount() {
    this.fetchTicker("TSLA");
  }

  onTicker(val) {
    this.fetchTicker(val);
  }

  render() {
    return <>
      <center><SearchField onEnter={this.onTicker.bind(this)} /></center>
      <br />
      <div style={{ paddingLeft: 32 }}>{this.state.ticker}</div>
      <div style={{ padding: 16 }}><MultiLineChart data={this.state.data} /></div>
    </>;
    //       <pre>{JSON.stringify(this.state.data, null, 2)}</pre>
  }

}

const MultiLineChart = ({ data }) => {

  const options = {
    scales: {
      y1: {
        beginAtZero: false
      },
      y2: { // Second y-axis configuration
        type: 'linear',
        beginAtZero: false,
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'PCR'
        },
        // Use this to style this axis independently
        grid: {
          drawOnChartArea: false, // Only draw the grid lines for this axis
        }
      },
      y3: { // Second y-axis configuration
        type: 'linear',
        beginAtZero: false,
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Volume'
        },
        // Use this to style this axis independently
        grid: {
          drawOnChartArea: false, // Only draw the grid lines for this axis
        }
      },

    }
  };

  return <Line data={data} options={options} />;
};


function App() {
  return (
    <div>
      <div style={{ paddingTop: "24px" }}>
        <QueryComp />
      </div>
    </div>
  );
}

export default App;
