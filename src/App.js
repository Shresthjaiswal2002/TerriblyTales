import React, { useState, useEffect } from 'react';
import Chart from 'chart.js/auto';

const App = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [histogramData, setHistogramData] = useState([]);

  const fetchData = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('https://www.terriblytinytales.com/test.txt');
      const text = await response.text();

      const wordCounts = {};
      const words = text.split(/\s+/);

      words.forEach((word) => {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      });

      const sortedWords = Object.entries(wordCounts).sort((a, b) => b[1] - a[1]);

      const top20Words = sortedWords.slice(0, 20);

      setHistogramData(top20Words);
    } catch (error) {
      console.error('Error fetching data:', error);
    }

    setIsLoading(false);
  };

  const exportToCSV = () => {
    const csvContent = `Word,Count\n${histogramData
      .map(([word, count]) => `${word},${count}`)
      .join('\n')}`;

    const element = document.createElement('a');
    const file = new Blob([csvContent], { type: 'text/csv' });
    element.href = URL.createObjectURL(file);
    element.download = 'histogram_data.csv';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  useEffect(() => {
    if (histogramData.length > 0) {
      const ctx = document.getElementById('chart').getContext('2d');

      const labels = histogramData.map(([word]) => word);
      const data = histogramData.map(([, count]) => count);

      new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Word Count',
              data,
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            x: {
              title: {
                display: true,
                text: 'Word',
              },
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Count',
              },
            },
          },
        },
      });
    }
  }, [histogramData]);

  return (
    <div>
      <button onClick={fetchData} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Submit'}
      </button>

      {histogramData.length > 0 && (
        <div>
          <h2>Histogram</h2>
          <canvas id="chart" width="400" height="200"></canvas>
          <button onClick={exportToCSV}>Export</button>
        </div>
      )}
    </div>
  );
};

export default App;
